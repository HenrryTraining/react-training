import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <div style={styles.sidebar}>

      <div style={styles.section}>
        <p style={styles.sectionTitle}>Transacciones</p>
        <NavLink
          to="/orders"
          end
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.linkActive : {})
          })}
        >
          📋 Lista de Órdenes
        </NavLink>
      <NavLink
        to="/orders/new"
        style={({ isActive }) => ({
          ...styles.link,
          ...(isActive ? styles.linkActive : {})
        })}
      >
        📋 Nueva Orden
      </NavLink>
      </div>

      <div style={styles.section}>
        <p style={styles.sectionTitle}>Mantenimiento</p>
        <NavLink
          to="/products"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.linkActive : {})
          })}
        >
          📦 Productos
        </NavLink>
        <NavLink
          to="/customers"
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.linkActive : {})
          })}
        >
          👥 Clientes
        </NavLink>
      </div>

    </div>
  )
}

const styles = {
  sidebar: {
    width: '220px',
    minHeight: '100%',
    backgroundColor: '#1a1a2e',
    padding: '1.5rem 0',
    flexShrink: 0
  },
  section: {
    marginBottom: '1.5rem'
  },
  sectionTitle: {
    color: '#8888aa',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    padding: '0 1.25rem',
    margin: '0 0 0.5rem'
  },
  link: {
    display: 'block',
    padding: '0.6rem 1.25rem',
    color: '#ccccdd',
    textDecoration: 'none',
    fontSize: '0.95rem',
    borderRadius: '0',
    transition: 'background 0.15s'
  },
  linkActive: {
    backgroundColor: '#4f46e5',
    color: 'white'
  }
}