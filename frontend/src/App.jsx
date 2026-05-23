import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import { ProtectedRoute, AdminRoute, PublicRoute } from './routes/ProtectedRoute'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CreateListingPage from './pages/CreateListingPage'
import MyListingsPage from './pages/MyListingsPage'
import OrdersPage from './pages/OrdersPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ListingDetailPage from './pages/ListingDetailPage'
import NotFoundPage from './pages/NotFoundPage'

const App = () => {
  return (
    <Routes>
      {/* Auth routes — no navbar */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />

      {/* Main layout routes — with navbar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />

        <Route path="/listings/create" element={
          <ProtectedRoute><CreateListingPage /></ProtectedRoute>
        } />
        <Route path="/my-listings" element={
          <ProtectedRoute><MyListingsPage /></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute><OrdersPage /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute><AdminDashboardPage /></AdminRoute>
        } />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
