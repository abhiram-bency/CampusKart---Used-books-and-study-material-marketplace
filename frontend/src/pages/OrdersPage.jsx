import { useState, useEffect } from 'react'
import { ordersService } from '../services/api'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import OrderStatusBadge from '../components/OrderStatusBadge'
import { ShoppingBag, Calendar, Package, Hash } from 'lucide-react'

const OrderCard = ({ order }) => {
  const listing = order.listing || {}
  const date = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
              <Hash size={11} />
              {order.id?.toString().slice(-6) || '------'}
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
          <h3 className="font-display font-semibold text-white truncate">
            {listing.title || order.listing_title || 'Unknown Item'}
          </h3>
          {listing.category && (
            <span className="text-xs text-slate-500 capitalize">{listing.category}</span>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-display font-bold text-xl text-brand-400">
            ₹{(order.total_price || listing.price || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar size={12} className="text-slate-500" />
          <span>Ordered: {date}</span>
        </div>
        {listing.seller && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Package size={12} className="text-slate-500" />
            <span className="truncate">Seller: {listing.seller?.name || listing.seller?.email}</span>
          </div>
        )}
      </div>
    </div>
  )
}

const SkeletonOrder = () => (
  <div className="card p-5">
    <div className="flex justify-between mb-4">
      <div className="space-y-2 flex-1">
        <div className="shimmer h-4 w-24 rounded" />
        <div className="shimmer h-5 w-48 rounded" />
      </div>
      <div className="shimmer h-8 w-20 rounded-lg" />
    </div>
    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
      <div className="shimmer h-4 w-32 rounded" />
      <div className="shimmer h-4 w-28 rounded" />
    </div>
  </div>
)

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const { data } = await ordersService.getMyOrders()
        setOrders(Array.isArray(data) ? data : (data.orders || data.items || []))
      } catch {
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const statuses = ['all', ...new Set(orders.map(o => o.status?.toLowerCase()).filter(Boolean))]
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status?.toLowerCase() === filter)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <PageHeader
        title="My Orders"
        subtitle={`${orders.length} order${orders.length !== 1 ? 's' : ''} in total`}
      />

      {/* Status filter tabs */}
      {!loading && orders.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all
                ${filter === s
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                }`}
            >
              {s} {s === 'all' ? `(${orders.length})` : `(${orders.filter(o => o.status?.toLowerCase() === s).length})`}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <SkeletonOrder key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
          description={filter === 'all' ? 'Browse the marketplace and place your first order.' : 'Try selecting a different filter.'}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  )
}

export default OrdersPage
