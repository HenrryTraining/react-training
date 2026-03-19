import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import LoginPage from './pages/LoginPage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import NewOrderPage from './pages/NewOrderPage.jsx'
import OrdersListPage from './pages/OrdersListPage.jsx'
import OrderDetailPage from './pages/OrderDetailPage.jsx'   
import CustomersPage from './pages/CustomersPage.jsx'
import Sidebar from './components/Sidebar.jsx'

function App() {
  const { isAuth, user, logout } = useAuth()

  // Si no está logueado, muestra solo el login
  if (!isAuth) {
    return <LoginPage />
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">

        {/* Navbar */}
        <div className="flex justify-between items-center px-8 py-4 bg-[#1a1a2e] text-white sticky top-0 z-50">
          <span className="text-lg font-bold">MiniERP</span>
          <div className="flex items-center gap-4 text-sm">
            <span>{user.email}</span>
            <span className="bg-indigo-600 px-3 py-0.5 rounded-full text-xs">
              {user.role}
            </span>
            <button
              onClick={logout}
              className="border border-white/30 text-white px-3 py-1 rounded-md text-sm hover:bg-white/10"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Sidebar + Contenido */}
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 bg-gray-100 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/orders" />} />
              <Route path="/orders"    element={<OrdersListPage />} />
              <Route path="/orders/new"    element={<NewOrderPage />} />
              <Route path="/orders/:id"   element={<OrderDetailPage />} />  {/* ← nuevo */}
              <Route path="/products"  element={<ProductsPage />} />
              <Route path="/customers" element={<CustomersPage />} />
            </Routes>
          </main>
        </div>

      </div>
    </BrowserRouter>
  )
}

export default App