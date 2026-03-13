function SearchBar({ setSearch}){
    return (
        <input
            placeholder="Search user"
            onChange={(e)=> setSearch(e.target.value)}
        />
    )
}
export default SearchBar