export default function OrdersPage() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <span style={styles.icon}>🚧</span>
        <h2 style={styles.title}>Órdenes</h2>
        <p style={styles.text}>Esta sección está en construcción</p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh'
  },
  card: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  icon: {
    fontSize: '3rem'
  },
  title: {
    margin: '1rem 0 0.5rem',
    color: '#1a1a2e'
  },
  text: {
    color: '#666',
    margin: 0
  }
}