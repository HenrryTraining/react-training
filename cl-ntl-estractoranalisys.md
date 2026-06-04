# CL vs NTL Extractor — End-to-End Analysis and Parity

> **Author:** hvelez · **Date:** 2026-06-04
> **Module:** `member-sessionizer`
> **Context:** Consolidated Logging (CL) → Netflix Telemetry & Logging (NTL) migration.
> Compares how `clextractor_profile_f` (CL, on `main`) is built versus `ntlextractor_profile_f`
> (NTL, on branches `pgn/ntl-extractor` / `pgn/ntl-eventsjoin-cutover` / `pgn/ntl-eventsjoin-phase2`).
> Input for the migration parity check.

---

## 0. TL;DR

Both processes do the same thing conceptually: **read raw events → filter out the irrelevant ones →
parse the payload → project to a per-event table** that then feeds the events-join.

- Parity **between the NTL extractor and the NTL inline events-join** (Phase 1 of the cutover) is
  solid **by construction** — they reuse the same filters. **The risk is not there.**
- The real risk is **CL vs NTL** parity, concentrated in 3 areas:
  1. **Filtering** → different rules shift **row counts**.
  2. **Shape/content** → NTL has no `snapshot`; less context, no `unified_entity_id` fallback.
  3. **Timestamps** → the NTL column mapping is **unverified**; an error here changes **session
     boundaries**, not a field, and cascades to the entire table.
- There are **by-design** divergences (`other_data` allowlist, `data_agg` slimming, nested
  `tracking_info`) that the parity check must know about so it doesn't treat them as bugs.

**Conclusion:** measure parity at the **semantic/session level**, not struct-equals-struct. Harden
**timestamps first**.

---

## 1. Why the extractor exists (context)

The extractor unpacks each event's heavy payload once and writes the result to a per-event table
(`*extractor_profile_f`) that the events-join consumes. Benefits: do the expensive parse **once per
hour** (not on every sessionizer run), **independent backfills**, **retry isolation**, and
already-clean data.

- **CL** always had an extractor (`clextractor_profile_f`) because its events carry a heavy JSON
  `snapshot` that must be parsed.
- **NTL v1** did this inline inside the events-join (no extractor). The doc
  `docs/architecture/extractor-architecture.md` on `main` still says *"NTL has no extractor"* — that
  is **outdated** relative to the `pgn/*` branches.
- **NTL now** (`pgn/*` branches) **added** `ntlextractor_profile_f` to **emulate**
  `clextractor_profile_f`. Reason per `docs/design/ntl-extractor.md`: **repeated prod OOMs** (tvui),
  not tidiness. The `from_json` parse of the wide `eventData_json` shared heap with the
  sessionize-SMJ + write in a single Spark job. Splitting it out gave columnar pushdown, retry
  isolation, and structural parity with CL.

Rollout: **Phase 1** (shadow — the extractor writes the table, the events-join keeps parsing inline)
→ **Phase 2** (flip — the events-join reads from the table and removes the inline parse). The
`pgn/ntl-eventsjoin-cutover` branch is Phase 2.

---

## 2. End-to-end: how `clextractor_profile_f` is built (CL)

5 layers, from the outside (trigger) inward (heavy parse):

```
@hourly (Maestro)                              ← workflows/CL.EXTRACTOR.profileaggs.sch.yaml
   │
   ▼
ProfileAggsExtractorSparkApp  (entry point — 4 useful lines)
   │
   ▼
BatchExtractorJob  (generic engine: read → filter → select → transform → write)
   │   uses the "CL recipe" ↓
   ▼
ProfileAggsExtractor  (recipe: WHAT to filter, WHICH columns, WHEN to unpack)
   │   calls the unpacker ↓
   ▼
SnapshotPromotion  (heavy work: parse the JSON snapshot with Circe)
   │
   ▼
vault.clextractor_profile_f  (1 row per event) → VTTS → events-join
```

**Layer 1 — Workflow** (`workflows/CL.EXTRACTOR.profileaggs.sch.yaml`): runs `@hourly`, processes the
previous hour (`KEEP_CURRENT_DATEHOUR = hour − 1`). **A single job** processes all sources. The
`extractor_vtts` job publishes the VTTS that unblocks the events-join. Sizing: 960 partitions,
8g/executor, 0.45 fraction, 5 cores, up to 400 executors.

**Layer 2 — Entry point** (`ProfileAggsExtractorSparkApp.scala`): builds `BatchExtractorJob` with the
`ProfileAggsExtractor` recipe and delegates.

**Layer 3 — Generic engine** (`BatchExtractorJob.scala`): for each hour group: read `clevent_f` →
filter by hour → base filter (`source`/`log_id`/`sequence_nbr` not null) → `eventFilter` →
`select(getSelection)` → `transformer` → conform schema → `writeTo().overwritePartitions()`.

**Layer 4 — CL recipe** (`ProfileAggsExtractor.scala`):
- `eventFilter`: sources `{www, iOS, android, tvui}` + valid timestamp + `ExcludedEvents.emdtFilter`
  + `smdtFilter` + `EventReader.uaSessionsFilters`.
- `getSelection`: decides **when** to unpack:
  - `conditionSnapshot` (full): not an excluded session/event **AND** is `Action`/`Command`/
    `SessionEnded`/`Presented` → `extractSnapshotUdf(snapshot)`.
  - `conditionEvent` (light): any other non-excluded event → `extractEventUdf(event)`.
  - otherwise → null.
  - Projects ~40 clean columns (identity, platform-corrected timestamps, versions, geo, nav,
    `command_name`, and the parsed `snapshot` column).
- `transformer`: `extracted_video_id` and `extracted_unified_entity_id` with the fallback chain
  `event → nav → focus → presentation`, each as `{value, provenance}`.

**Layer 5 — Heavy unpacking** (`SnapshotPromotion.scala`): the `snapshot` is a JSON array of the
events in the same logger window (the last item is the trigger). Guardrail: skip snapshots
> 200,000 chars. `extractSnapshot` iterates in reverse, collects coincident items by type (`Focus`,
`Presentation`, `NavigationLevel`, `LolomoDataModel`, `Search*`), **capped at 4/type** (overflow to
`discarded`). `SessionEnded` special case: find the session start by `sessionId`. Output: struct
`SnapshotGeneric { event, coincident, discarded, original_snapshot_strlen }`.

**Output:** `vault.clextractor_profile_f`, partitioned by `utc_date/utc_hour/source`, 1 row per
relevant event.

---

## 3. End-to-end: how `ntlextractor_profile_f` is built (NTL)

```
@hourly (Maestro)        ← scheduler/ntl.extractor.profileaggs.sch.yaml  (4 PARALLEL jobs, 1 per source)
   │
   ▼
NTLProfileAggsExtractorSparkApp   (entry point — processes ONE source per run)
   │
   ▼
NTLEventExtraction.readAndExtract  (read → filter → project)   ← NO generic engine
   │
   ▼
from_json (single pass) + projectToExtractedNTLEvent   ← NO Circe UDF / SnapshotPromotion
   │
   ▼
vault.ntlextractor_profile_f  → VTTS → events-join (Phase 2)
```

**Layer 1 — Workflow** (`scheduler/ntl.extractor.profileaggs.sch.yaml`): `@hourly`, previous hour.
**Per-source fan-out**: `tvui`/`android`/`ios`/`www` as 4 parallel Spark jobs (tvui 960/400; the
others 480/200), converging on a single `ntl_extractor_vtts`. PagerDuty disabled during rollout.

**Layer 2 — Entry point** (`NTLProfileAggsExtractorSparkApp.scala`): takes `NTL_EVENTS_TABLE`,
`OUTPUT_TABLE`, `CLEVENT_F_SOURCES` (one source), `KEEP_CURRENT_DATEHOUR`; calls
`NTLEventExtraction.readAndExtract` and writes `overwritePartitions()`. **No** generic engine.

**Layer 3 — Read + filter** (`NTLEventExtraction.readAndExtract`): read `ntl_all_member_events` →
filter partition → filter `appContext.source` → `NTLEventReader.filterUASessionRelevantEvents`
(mirror of `uaSessionsFilters`) → exclude `NTLExcludedEvents.EXCLUDED_EVENT_NAMES` (mirror of
`ExcludedEvents`) → `projectToExtractedNTLEvent`.

**Layer 4 — Project + light unpacking** (`projectToExtractedNTLEvent`):
- **`from_json(eventData_json, EVENT_DATA_SCHEMA)` ONCE per row** → narrow struct `_event_data`,
  dotted reads. (An earlier version with `get_json_object` per field re-parsed ~30×/row → CPU
  regression.)
- Narrow `EVENT_DATA_SCHEMA`: ~15 scalars + 3 tracking maps (vs ~200 upstream fields).
- `tracking_info { root, focus, nav_level }` (analog of `snapshot.event` + `snapshot.coincident
  [Focus/NavigationLevel]`), with nullability: inner null when its JSON sub-object is absent; outer
  null when all three are null (saves ~32 B/row).
- `other_data`: **allowlist** (`searchTerm, desiredValue, thumbRating, downloadType,
  verticalVideoFeedSessionId` + `shares`), NOT a catch-all (a catch-all would re-import
  `playbackContextId`/`adEventToken` ~230 GB/hr → OOM).

**Layer 5 — NO heavy unpacking:** NTL has no `snapshot` array; `eventData_json` is flat. No Circe
UDF, no reverse iteration, no coincidence cap, no `SessionEnded` case, no 200 KB guardrail. This is
"NTL already comes clean".

**Output:** `vault.ntlextractor_profile_f`, partitioned by `utc_date/utc_hour/source`,
`lifetime: 15` / `snapshot_lifetime_days: 3` (aligned with `clextractor_profile_f`).

---

## 4. Table: most important differences

| # | Dimension | CL (`clextractor_profile_f`) | NTL (`ntlextractor_profile_f`) | Impact |
|---|---|---|---|---|
| 1 | Orchestration | generic `BatchExtractorJob` engine + `ExtractorDefinition` recipe | direct app + `NTLEventExtraction` | Low |
| 2 | Workflow | 1 job (all sources) | 4 parallel jobs (1/source) + single VTTS | Operational |
| 3 | Parsing | Circe UDF (`SnapshotPromotion`), outside Catalyst | `from_json` 1×/row, narrow schema, inside Catalyst | Perf |
| 4 | "snapshot" source | JSON `snapshot` array with coincidents | ❌ none; flat `eventData_json` | Structural |
| 5 | Tracking | `snapshot.coincident[Focus/Nav/**Presentation/Lolomo/Search**]`, cap 4/type + `discarded` | `tracking_info {root, focus, nav_level}`, 1/type, no cap | **Content** |
| 6 | `unified_entity_id` | chain `event→nav→focus→presentation` + `provenance` | root `$.unifiedEntityId` only (no fallback) | **Content** |
| 7 | Key aliases | multiple (`row`/`rowNum`/`video_id`/…) + lenient cast | single camelCase key | **Content** |
| 8 | `other_data` | catch-all (all event primitives) | allowlist (5 keys + `shares`) | By design |
| 9 | Tracking extraction | conditional (only Action/Command/SessionEnded/Presented) | unconditional (any event with JSON) | **Content** |
| 10 | Session-type filter | yes (`session_most_derived_type`) | ❌ no such column | **Count** |
| 11 | Exclusion guard | excludes only if `command_name IS NULL` | excludes by `eventName` unconditionally + `+Ended/+Canceled` variants | **Count** |
| 12 | Classification list | `SessionActivityRules` | `NTLEventClassification` (separate list) | **Count / drift** |
| 13 | Validity | `log_id>0`, `client/server_utc_ts` not null | `loggerId!=""`, 3 timestamps not null | Edge |
| 14 | log range | `log_id` (long), `sequence_nbr` (int) | `logger_id` (string UUID), `event_sequence` (long) | Types |
| 15 | `data_agg` (downstream) | keeps `ui/app/nrd_version`, `referrer_url`… per-event | drops/hoists those fields (payload reduction) | By design |

---

## 5. Where the logic can break

Confidence legend: ✅ confirmed in code · ⚠️ hypothesis to verify.

### 🔴 Tier 1 — Breaks sessions or counts
- **R1 — Timestamp mapping** ⚠️: `platformSessionTime` is shared, but the NTL mapping
  (`deviceTimeMs`↔raw, `eventTimeMs`↔server-corrected) is an assumption. If `deviceTimeMs` is not raw
  Unix epoch on iOS, `IOSTimestampCorrection` double-corrects → bad `sessionizer_utc_ms` →
  **sessions split/merged wrong**. *Affects the whole table.*
- **R2 — No session-type filter** ✅: CL drops events in irrelevant session types; NTL has no such
  column → **NTL over-counts**.
- **R3 — Exclusion without the `command.isNull` guard** ✅: CL excludes only when `command_name` is
  null; NTL excludes by `eventName` unconditionally → **NTL may under-count** if those events carry a
  command.
- **R4 — Drift between `SessionActivityRules` and `NTLEventClassification`** ⚠️: separate lists,
  diverge silently.

### 🟠 Tier 2 — Changes field values
- **R5 — `unified_entity_id` without fallback** ✅: NULL in NTL where CL had a value → breaks
  attribution.
- **R6 — Missing `Presentation`/`Search` coincidents** ✅: impression/search context absent → risk
  for `session_impression_f`.
- **R7 — No alias resolution** ✅: `rowNum`/`video_id` (snake) → null in NTL.
- **R8 — `from_json` narrow schema** ✅: undeclared keys are silently dropped.
- **R9 — `tracking_info` over-population** ✅: NTL populates tracking where CL left it empty.
- **R10 — Edge validity** ✅: `eventTimeMs` null drops events with no CL equivalent.

### 🟡 Tier 3 — By design (not a bug, but account for it)
- **R11 — `other_data` allowlist** vs catch-all → expected missing keys.
- **R12 — Slimmed `data_agg`** → compare at session level, not struct-equals.
- **R13 — Nested `tracking_info` ≠ `snapshot` map** → functional parity, not schema parity.

---

## 6. Suggested parity check

**Guiding principle:** compare at the **semantic/session level**, joining on
`(logger_id↔log_id, event_sequence↔sequence_nbr)` and on `profile_session_id` downstream. Run over
**the same hour** in both pipelines.

### Phase 0 — Harden timestamps (before any count)
- [ ] Verify the real type/epoch of `deviceTimeMs` and `eventTimeMs` in `ntl_all_member_events`
  (read `IOSTimestampCorrection`).
- [ ] Diff `sessionizer_utc_ms` CL vs NTL for a sample of matched events, by platform (**focus iOS
  and tvui**).
- ✅ *Criterion:* time delta ≈ 0 (modulo expected corrections).

### Phase 1 — Row counts (catches R2, R3, R4)
- [ ] `COUNT(*)` by `(utc_date, utc_hour, source)` CL vs NTL.
- [ ] Break the delta down by `eventName`/`event_most_derived_type`.
- ✅ *Criterion:* document and explain every delta (expected: NTL ≥ CL due to R2).

### Phase 2 — Field-by-field diff (catches R5–R10)
- [ ] Sample ~1000 matched events/source; compare column by column.
- [ ] `unified_entity_id` null-rate NTL vs CL (R5) + validate downstream `COALESCE`.
- [ ] `tracking_info` populated coverage, by event type (R7, R9).
- [ ] Look for events with snake keys (`rowNum`, `video_id`) that NTL fails to resolve (R7, R8).
- ✅ *Criterion:* differences only in fields from by-design divergences (R11–R13).

### Phase 3 — List comparison (catches R4)
- [ ] Diff `SessionActivityRules` vs `NTLEventClassification` (namespaces, events, prefixes, patterns).
- ✅ *Criterion:* every difference justified or synced.

### Phase 4 — End-to-end on `*_profile_f` (final parity)
- [ ] Iceberg snapshot-diff of `ntlsessionizer_profile_f` pre vs post, and semantic comparison with
  `clsessionizer_profile_f` at the session level (not struct-equals, due to R12).
- [ ] Confirm downstream `session_impression_f`/`session_feature_engagement_f` don't degrade due to
  R5/R6.

---

## 7. Code references

**CL (`main` branch):**
- `member-sessionizer/workflows/CL.EXTRACTOR.profileaggs.sch.yaml`
- `member-sessionizer/src/main/scala/com/netflix/cl/sessionizer/profileaggs/extractor/ProfileAggsExtractorSparkApp.scala`
- `member-sessionizer/src/main/scala/com/netflix/cl/sessionizer/extractor/BatchExtractorJob.scala`
- `member-sessionizer/src/main/scala/com/netflix/cl/sessionizer/extractor/ExtractorDefinition.scala`
- `member-sessionizer/src/main/scala/com/netflix/cl/sessionizer/profileaggs/extractor/ProfileAggsExtractor.scala`
- `member-sessionizer/src/main/scala/com/netflix/cl/sessionizer/profileaggs/extractor/promotion/SnapshotPromotion.scala`
- `member-sessionizer/src/main/scala/com/netflix/cl/sessionizer/profileaggs/extractor/promotion/TrackingInfoPromotion.scala`
- `member-sessionizer/src/main/scala/com/netflix/cl/sessionizer/profileaggs/extractor/ExcludedEvents.scala`
- `member-sessionizer/src/main/scala/com/netflix/cl/sessionizer/genericaggs/core/EventReader.scala`
- `member-sessionizer/src/main/scala/com/netflix/cl/sessionizer/genericaggs/core/clevent/PlatformTimestamp.scala`

**NTL (`pgn/ntl-extractor` / `pgn/ntl-eventsjoin-cutover` branches):**
- `member-sessionizer/scheduler/ntl.extractor.profileaggs.sch.yaml`
- `member-sessionizer/src/main/scala/com/netflix/cl/sessionizer/profileaggs/ntlextractor/NTLProfileAggsExtractorSparkApp.scala`
- `member-sessionizer/src/main/scala/com/netflix/cl/sessionizer/profileaggs/ntlextractor/NTLEventExtraction.scala`
- `member-sessionizer/tables/vault.ntlextractor_profile_f.table.yaml`
- `member-sessionizer/src/main/scala/com/netflix/cl/sessionizer/profileaggs/eventsjoin/NTLExcludedEvents.scala`
- `member-sessionizer/src/main/scala/com/netflix/cl/sessionizer/genericaggs/core/NTLEventReader.scala`
- `member-sessionizer/src/main/scala/com/netflix/cl/sessionizer/genericaggs/core/ntlevent/NTLPlatformTimestamp.scala`
- `member-sessionizer/docs/design/ntl-extractor.md` (design/why)
- `member-sessionizer/docs/proposals/ntl-data-agg-payload-reduction.md` (`data_agg` slimming)
