import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listingsService } from '../services/api'
import ListingCard from '../components/ListingCard'
import { SkeletonGrid } from '../components/SkeletonCard'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import { Package, PlusCircle, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const EditModal = ({ listing, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: listing.title,
    description: listing.description,
    price: listing.price,
    category: listing.category,
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await listingsService.update(listing.id, { ...form, price: parseFloat(form.price) })
      toast.success('Listing updated!')
      onSave()
    } catch {
      toast.error('Failed to update listing')
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <Modal isOpen onClose={onClose} title="Edit Listing" maxWidth="max-w-lg">
      <div className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input type="text" value={form.title} onChange={set('title')} className="input-field" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea value={form.description} onChange={set('description')} rows={3} className="input-field resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Price (₹)</label>
            <input type="number" value={form.price} onChange={set('price')} className="input-field" />
          </div>
          <div>
            <label className="label">Category</label>
            <select value={form.category} onChange={set('category')} className="input-field">
              <option value="book">Books</option>
              <option value="hardware">Hardware</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

const MyListingsPage = () => {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchListings = async () => {
    setLoading(true)
    try {
      const { data } = await listingsService.getMine()
      setListings(Array.isArray(data) ? data : (data.items || []))
    } catch (err) {
      console.error('MyListings error:', err.response?.status, err.response?.data)
      toast.error(`Failed to load: ${err.response?.data?.detail || err.message}`)
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchListings() }, [])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await listingsService.delete(deleteTarget.id)
      toast.success('Listing deleted')
      setListings(l => l.filter(x => x.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <PageHeader
        title="My Listings"
        subtitle={`You have ${listings.length} active listing${listings.length !== 1 ? 's' : ''}`}
        action={
          <Link to="/listings/create" className="btn-primary flex items-center gap-2">
            <PlusCircle size={16} /> New Listing
          </Link>
        }
      />

      {loading ? (
        <SkeletonGrid count={6} />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No listings yet"
          description="Start selling — list a book or hardware in minutes."
          action={
            <Link to="/listings/create" className="btn-primary flex items-center gap-2">
              <PlusCircle size={16} /> Create Your First Listing
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map(listing => (
            <div key={listing.id} className="relative group">
              <ListingCard listing={listing} />
              {/* Action overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                <button
                  onClick={() => setEditTarget(listing)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-xs font-medium transition-colors"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(listing)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <EditModal
          listing={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={() => { setEditTarget(null); fetchListings() }}
        />
      )}

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Listing">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <div>
            <p className="text-white font-medium mb-1">Are you sure?</p>
            <p className="text-slate-400 text-sm">
              Delete <span className="text-white">"{deleteTarget?.title}"</span>? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Keep It</button>
            <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1 flex items-center justify-center gap-2">
              {deleting ? <div className="w-4 h-4 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" /> : <><Trash2 size={14} /> Delete</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default MyListingsPage
