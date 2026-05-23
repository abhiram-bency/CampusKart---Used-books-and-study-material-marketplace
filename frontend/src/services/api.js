import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campuskart_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.detail || error.message || 'Something went wrong'

    if (status === 401) {
      localStorage.removeItem('campuskart_token')
      localStorage.removeItem('campuskart_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (status === 403) {
      toast.error('You do not have permission to do that.')
    } else if (status === 404) {
      // silent
    } else if (status >= 500) {
      toast.error('Server error. Please try again.')
    }

    return Promise.reject(error)
  }
)

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: async (credentials) => {
    const formData = new URLSearchParams()

    formData.append("username", credentials.email)
    formData.append("password", credentials.password)

    return api.post("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
  },
}

// ─── Listings ────────────────────────────────────────────────────────────────
export const listingsService = {
  getAll: (params) => api.get('/listings', { params }),
  getById: (id) => api.get(`/listings/${id}`),
  create: (data) => api.post('/listings', data),
  update: (id, data) => api.put(`/listings/${id}`, data),
  delete: (id) => api.delete(`/listings/${id}`),
  getMine: () => api.get('/listings/me'),
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export const ordersService = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/me'),
  getAll: () => api.get('/orders'),
}

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
}

export default api
