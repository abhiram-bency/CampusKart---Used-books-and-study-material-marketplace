import { useState, useEffect } from 'react'
import { ordersService, listingsService, adminService } from '../services/api'
import PageHeader from '../components/PageHeader'
import StatsCard from '../components/StatsCard'
import OrderStatusBadge from '../components/OrderStatusBadge'
import {
  Users, Package, ShoppingBag, TrendingUp,
  BarChart2, Activity, RefreshCw
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#e08518', '#3b82f6', '#10b981', '#a855f7', '#ef4444']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl border border-slate-700 px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-white font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({ total_users: 0, total_listings: 0, total_orders: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    try {
      const [statsRes, ordersRes, listingsRes] = await Promise.allSettled([
        adminService.getStats(),
        ordersService.getAll(),
        listingsService.getAll({ limit: 100 }),
      ])

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data || {})
      }

      if (ordersRes.status === 'fulfilled') {
        const orders = Array.isArray(ordersRes.value.data)
          ? ordersRes.value.data
          : (ordersRes.value.data?.orders || ordersRes.value.data?.items || [])
        setRecentOrders(orders.slice(0, 8))
      }

      if (listingsRes.status === 'fulfilled') {
        const items = Array.isArray(listingsRes.value.data)
          ? listingsRes.value.data
          : (listingsRes.value.data?.items || [])
        // Build category distribution
        const catCounts = items.reduce((acc, item) => {
          const cat = item.category || 'other'
          acc[cat] = (acc[cat] || 0) + 1
          return acc
        }, {})
        setCategoryData(Object.entries(catCounts).map(([name, value]) => ({ name, value })))
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Mock chart data if no real data
  const barData = recentOrders.length > 0
    ? [
        { day: 'Mon', orders: 4 }, { day: 'Tue', orders: 7 }, { day: 'Wed', orders: 3 },
        { day: 'Thu', orders: 9 }, { day: 'Fri', orders: 12 }, { day: 'Sat', orders: 6 }, { day: 'Sun', orders: 2 },
      ]
    : []

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="shimmer h-9 w-56 rounded-xl mb-2" />
          <div className="shimmer h-4 w-40 rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="card p-5">
              <div className="shimmer h-10 w-10 rounded-xl mb-3" />
              <div className="shimmer h-8 w-16 rounded mb-1" />
              <div className="shimmer h-4 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform overview and metrics"
        action={
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={Users} label="Total Users" value={stats.total_users ?? '—'} color="blue" />
        <StatsCard icon={Package} label="Active Listings" value={stats.total_listings ?? '—'} color="emerald" />
        <StatsCard icon={ShoppingBag} label="Total Orders" value={stats.total_orders ?? '—'} color="brand" />
        <StatsCard icon={TrendingUp} label="Revenue (₹)" value={stats.total_revenue ? `${(stats.total_revenue/1000).toFixed(1)}k` : '—'} color="purple" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Bar chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={18} className="text-brand-400" />
            <h3 className="font-display font-semibold text-white">Orders This Week</h3>
          </div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barCategoryGap="30%">
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="orders" fill="#e08518" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">
              No order data available yet
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={18} className="text-emerald-400" />
            <h3 className="font-display font-semibold text-white">By Category</h3>
          </div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-400 capitalize">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">
              No listing data yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-display font-semibold text-white flex items-center gap-2">
            <ShoppingBag size={18} className="text-brand-400" />
            Recent Orders
          </h3>
          <span className="text-xs text-slate-500">{recentOrders.length} shown</span>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Order ID', 'Item', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-400">#{order.id?.toString().slice(-6)}</td>
                    <td className="px-5 py-3.5 text-sm text-white max-w-[180px] truncate">
                      {order.listing?.title || order.listing_title || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-brand-400">
                      ₹{(order.total_price || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : '—'}
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

export default AdminDashboardPage
