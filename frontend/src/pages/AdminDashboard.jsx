import { useState, useEffect } from 'react'
import { adminAPI, listingsAPI, ordersAPI, authAPI } from '../services/api'
import StatsCard from '../components/StatsCard'
import { Users, Package, ShoppingCart, TrendingUp, LayoutDashboard, AlertCircle } from 'lucide-react'
import api from '../services/api'

const CATEGORY_COLORS = {
  books:      '#3b82f6',
  hardware:   '#22c55e',
  notes:      '#f59e0b',
  stationery: '#8b5cf6',
  other:      '#6b7280',
}

function MiniBarChart({ data }) {
  if (!data?.length) return null
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map(({ label, count }) => (
        <div key={label} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-xs font-display font-bold text-ink-600">{count}</span>
          <div
            className="w-full rounded-t-md transition-all duration-700"
            style={{
              height: `${(count / max) * 64}px`,
              backgroundColor: CATEGORY_COLORS[label] || '#22c55e',
              minHeight: 4,
            }}
          />
          <span className="text-[10px] font-display font-semibold text-ink-400 capitalize truncate w-full text-center">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats,    setStats]    = useState(null)
  const [listings, setListings] = useState([])
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // Try dedicated admin endpoint first
        let statsData = null
        try {
          const res = await api.get('/admin/stats')
          statsData = res.data
        } catch {
          // Build stats from individual endpoints
          const [listRes, orderRes] = await Promise.allSettled([
            listingsAPI.getAll(),
            ordersAPI.getAllOrders(),
          ])
          const listData  = listRes.value?.data  || []
          const orderData = orderRes.value?.data || []
          const listArr   = Array.isArray(listData)  ? listData  : listData.items  || []
          const orderArr  = Array.isArray(orderData) ? orderData : orderData.items || []
          statsData = {
            total_users:    '—',
            total_listings: listArr.length,
            total_orders:   orderArr.length,
          }
          setListings(listArr.slice(0, 10))
          setOrders(orderArr.slice(0, 10))
        }
        setStats(statsData)

        if (listings.length === 0) {
          const res = await listingsAPI.getAll()
          setListings(Array.isArray(res.data) ? res.data.slice(0, 10) : (res.data.items || []).slice(0, 10))
        }
        if (orders.length === 0) {
          const res = await ordersAPI.getAllOrders()
          setOrders(Array.isArray(res.data) ? res.data.slice(0, 10) : (res.data.items || []).slice(0, 10))
        }
      } catch (e) {
        setError('Failed to load admin data. Make sure you have admin access.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Compute category breakdown
  const categoryBreakdown = listings.reduce((acc, l) => {
    const cat = l.category?.toLowerCase() || 'other'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})
  const chartData = Object.entries(categoryBreakdown).map(([label, count]) => ({ label, count }))

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-6 space-y-3">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="section-title text-ink-700 mb-2">Access Denied</h2>
        <p className="text-sm text-ink-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-campus-100 rounded-xl flex items-center justify-center">
            <LayoutDashboard size={20} className="text-campus-600" />
          </div>
          <h1 className="page-title text-2xl">Admin Dashboard</h1>
        </div>
        <p className="text-ink-500 text-sm">Platform overview and management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total Users',    value: stats?.total_users,    icon: Users,        color: 'blue'   },
          { label: 'Total Listings', value: stats?.total_listings, icon: Package,      color: 'campus' },
          { label: 'Total Orders',   value: stats?.total_orders,   icon: ShoppingCart, color: 'amber'  },
          { label: 'Revenue (est.)', value: listings.length > 0
              ? `₹${listings.reduce((s,l)=>s+(l.price||0),0).toLocaleString('en-IN')}`
              : '—',
            icon: TrendingUp, color: 'purple' },
        ].map((s, i) => (
          <div key={s.label} className={`animate-fade-up opacity-0 stagger-${i+1}`} style={{ animationFillMode: 'forwards' }}>
            <StatsCard {...s} />
          </div>
        ))}
      </div>

      {/* Charts + Tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Category chart */}
        <div className="card p-6">
          <h2 className="section-title mb-4 text-base">Listings by Category</h2>
          {chartData.length > 0
            ? <MiniBarChart data={chartData} />
            : <p className="text-sm text-ink-400">No listing data available.</p>
          }
        </div>

        {/* Recent orders */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="section-title mb-4 text-base">Recent Orders</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-ink-400">No orders found.</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 6).map(order => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-ink-50 last:border-0">
                  <div>
                    <p className="text-sm font-display font-semibold text-ink-800 truncate max-w-[200px]">
                      {order.listing?.title || 'Deleted listing'}
                    </p>
                    <p className="text-xs text-ink-400">
                      {order.buyer?.email || order.user?.email || '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-display font-bold text-ink-700">
                      ₹{Number(order.listing?.price || 0).toLocaleString('en-IN')}
                    </span>
                    <span className={`badge ${
                      order.status === 'completed' ? 'badge-green' :
                      order.status === 'cancelled' ? 'badge-red'   :
                      order.status === 'confirmed' ? 'badge-blue'  :
                      'badge-yellow'
                    }`}>
                      {order.status || 'pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Listings Table */}
      <div className="card p-6">
        <h2 className="section-title mb-5 text-base">Recent Listings</h2>
        {listings.length === 0 ? (
          <p className="text-sm text-ink-400">No listings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100">
                  <th className="text-left py-2.5 pr-4 font-display font-semibold text-ink-400 text-xs uppercase tracking-wider">Title</th>
                  <th className="text-left py-2.5 pr-4 font-display font-semibold text-ink-400 text-xs uppercase tracking-wider hidden sm:table-cell">Seller</th>
                  <th className="text-left py-2.5 pr-4 font-display font-semibold text-ink-400 text-xs uppercase tracking-wider">Category</th>
                  <th className="text-right py-2.5 font-display font-semibold text-ink-400 text-xs uppercase tracking-wider">Price</th>
                </tr>
              </thead>
              <tbody>
                {listings.map(l => (
                  <tr key={l.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-ink-800 max-w-[180px] truncate">{l.title}</td>
                    <td className="py-3 pr-4 text-ink-500 hidden sm:table-cell">
                      {l.seller?.name || l.seller?.email || '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${
                        l.category === 'books'    ? 'badge-blue'   :
                        l.category === 'hardware' ? 'badge-green'  :
                        l.category === 'notes'    ? 'badge-yellow' :
                        'badge-gray'
                      } capitalize`}>
                        {l.category || 'other'}
                      </span>
                    </td>
                    <td className="py-3 text-right font-display font-bold text-ink-800">
                      ₹{Number(l.price).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
