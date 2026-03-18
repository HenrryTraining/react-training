import { useAuth } from "./hooks/useAuth"
import LoginPage from "./pages/LoginPage"

function App() {
  const {isAuth, user, logout} = useAuth()

  if (!isAuth) {
    return<LoginPage />
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Mini ERP</h1>
      <p>Bienvenido, {user.email}</p>
      <p>Rol: {user.role}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  )
}
export default App