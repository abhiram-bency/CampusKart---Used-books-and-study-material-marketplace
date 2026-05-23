import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Hydrate from localStorage on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('campuskart_token')
    const savedUser = localStorage.getItem('campuskart_user')

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('campuskart_token')
        localStorage.removeItem('campuskart_user')
      }
    }

    setLoading(false)
  }, [])

  // LOGIN — sends form data (OAuth2 compatible)
  const login = useCallback(async (email, password) => {
    const formData = new URLSearchParams()
    formData.append('username', email)   // backend expects "username" not "email"
    formData.append('password', password)

    const response = await axios.post(
      `${API_URL}/auth/login`,
      formData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    const accessToken = response.data.access_token

    // Decode role from JWT payload (no extra API call needed)
    let userData = { email, role: 'student', name: email.split('@')[0] }
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      userData = {
        email: payload.sub || email,
        role: payload.role || 'student',
        name: payload.name || email.split('@')[0],
        id: payload.user_id || payload.id || null,
      }
    } catch {
      // keep default userData if JWT decode fails
    }

    localStorage.setItem('campuskart_token', accessToken)
    localStorage.setItem('campuskart_user', JSON.stringify(userData))
    setToken(accessToken)
    setUser(userData)

    return userData
  }, [])

  // REGISTER
  const register = useCallback(async (data) => {
    const response = await axios.post(`${API_URL}/auth/register`, data)
    return response.data
  }, [])

  // LOGOUT
  const logout = useCallback(() => {
    localStorage.removeItem('campuskart_token')
    localStorage.removeItem('campuskart_user')
    setToken(null)
    setUser(null)
  }, [])

  const isAuthenticated = !!token
  const isAdmin = user?.role === 'admin'

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout,
      isAuthenticated, isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  )
}