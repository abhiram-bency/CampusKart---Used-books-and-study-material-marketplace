import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { listingsService, ordersService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import OrderStatusBadge from '../components/OrderStatusBadge'
import { BookOpen, Cpu, Tag, User, ArrowLeft, ShoppingCart, Share2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORY_ICONS = { book: BookOpen, hardware: Cpu }

const ListingDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [ordered, setOrdered] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true)
      try {
        const { data } = await listingsService.getById(id)
        setListing(data)
      } catch {
        toast.error('Listing not found')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    fetchListing()
  }, [id])

  const handleOrder = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    setOrdering(true)
    try {
      await ordersService.create({ listing_id: listing.id })
      toast.success('Order placed successfully!')
      setOrdered(true)
    } catch (err) {
      const detail = err.response?.data?.detail
      const msg = Array.isArray(detail)
        ? detail.map(d => d.msg).join(', ')
        : detail || 'Could not place order'
      toast.error(msg)
    } finally {
      setOrdering(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="shimmer h-8 w-32 rounded mb-8" />
        <div className="card p-6 space-y-4">
          <div className="shimmer h-7 w-3/4 rounded" />
          <div className="shimmer h-4 w-full rounded" />
          <div className="shimmer h-4 w-5/6 rounded" />
          <div className="shimmer h-10 w-28 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!listing) return null

  const cat = listing.category?.toLowerCase()
  const Icon = CATEGORY_ICONS[cat] || Tag

  // Use owner_id from API response to check if this listing belongs to current user
  const isMine = user && listing.owner_id && (
    // Try matching by id if available in user object
    (user.id && user.id === listing.owner_id) ||
    // Fallback: decode from token via AuthContext if user.id not present
    false
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-slide-up">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge bg-brand-500/10 border border-brand-500/20 text-brand-400 capitalize">
                <Icon size={11} className="mr-1" />{listing.category || 'General'}
              </span>
              {listing.status && <OrderStatusBadge status={listing.status} />}
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight">
              {listing.title}
            </h1>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors flex-shrink-0"
          >
            <Share2 size={16} />
          </button>
        </div>

        <p className="text-slate-300 leading-relaxed mb-8">{listing.description || 'No description provided.'}</p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-6 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500/20 rounded-full flex items-center justify-center">
              <User size={18} className="text-brand-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Seller</p>
              <p className="text-white font-medium text-sm">
                {listing.seller?.name || listing.seller?.email || `Seller #${listing.owner_id}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-slate-500">Price</p>
              <p className="font-display font-bold text-3xl text-brand-400">
                ₹{(listing.price || 0).toLocaleString('en-IN')}
              </p>
            </div>
            {isMine ? (
              <Link to="/my-listings" className="btn-secondary text-sm">
                Manage Listing
              </Link>
            ) : ordered ? (
              <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-sm">
                <CheckCircle size={16} /> Ordered!
              </div>
            ) : (
              <button
                onClick={handleOrder}
                disabled={ordering || !isAuthenticated}
                className="btn-primary flex items-center gap-2 px-6 py-3"
              >
                {ordering
                  ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <><ShoppingCart size={16} /> Buy Now</>
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListingDetailPage