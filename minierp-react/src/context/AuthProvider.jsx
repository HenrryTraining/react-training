import { useState } from 'react'
import { AuthContext } from './AuthContext.js'

export function AuthProvider({ children }) {

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null
  })

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  async function login(email, password) {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      throw new Error('Credenciales inválidas')
    }

    const data = await response.json()

    setToken(data.token)
    localStorage.setItem('token', data.token)

    const payload = JSON.parse(atob(data.token.split('.')[1]))
    const userData = {
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    }

    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))

    return userData
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value = {
    token,
    user,
    isAuth: !!token,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}