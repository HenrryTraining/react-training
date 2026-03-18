import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import LoginPage from './pages/LoginPage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import CustomersPage from './pages/CustomersPage.jsx'
import Sidebar from './components/Sidebar.jsx'

function App() {
  const { isAuth, user, logout } = useAuth()

  if (!isAuth) {
    return <LoginPage />
  }

  return (
    <BrowserRouter>
      <div style={styles.app}>

        {/* Navbar */}
        <div style={styles.navbar}>
          <span style={styles.brand}>MiniERP</span>
          <div style={styles.userInfo}>
            <span>{user.email}</span>
            <span style={styles.role}>{user.role}</span>
            <button style={styles.logoutBtn} onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Sidebar + Contenido */}
        <div style={styles.body}>
          <Sidebar />
          <main style={styles.main}>
            <Routes>
              <Route path="/" element={<Navigate to="/orders" />} />
              <Route path="/products"  element={<ProductsPage />} />
              <Route path="/orders"    element={<OrdersPage />} />
              <Route path="/customers" element={<CustomersPage />} />
            </Routes>
          </main>
        </div>

      </div>
    </BrowserRouter>
  )
}

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#1a1a2e',
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  brand: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'white'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.9rem'
  },
  role: {
    backgroundColor: '#4f46e5',
    padding: '0.2rem 0.6rem',
    borderRadius: '999px',
    fontSize: '0.8rem'
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    padding: '0.3rem 0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  body: {
    display: 'flex',
    flex: 1
  },
  main: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    overflow: 'auto'
  }
}

export default App