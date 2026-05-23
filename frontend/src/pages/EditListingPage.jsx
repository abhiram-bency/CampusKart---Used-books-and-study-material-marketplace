import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { listingsAPI } from '../services/api'
import { Loader2, IndianRupee, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['Books', 'Hardware', 'Notes', 'Stationery', 'Other']

export default function EditListingPage() {
  const { id }   = useParams()
  const navigate  = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'Books' })
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(true)
  const [errors,  setErrors]    = useState({})

  useEffect(() => {
    const load = async () => {
      try {
        const res = await listingsAPI.getOne(id)
        const l = res.data
        setForm({
          title:       l.title       || '',
          description: l.description || '',
          price:       l.price       || '',
          category:    l.category
            ? l.category.charAt(0).toUpperCase() + l.category.slice(1)
            : 'Books',
        })
      } catch {
        toast.error('Failed to load listing')
        navigate('/my-listings')
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [id, navigate])

  const validate = () => {
    const e = {}
    if (!form.title.trim())       e.title       = 'Title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.price)              e.price       = 'Price is required'
    else if (isNaN(form.price) || Number(form.price) <= 0) e.price = 'Enter a valid price'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await listingsAPI.update(id, {
        ...form,
        price:    parseFloat(form.price),
        category: form.category.toLowerCase(),
      })
      toast.success('Listing updated!')
      navigate('/my-listings')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update listing'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="card p-8 space-y-5">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-12 w-full" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Pencil size={18} className="text-amber-600" />
          </div>
          <h1 className="page-title text-2xl">Edit Listing</h1>
        </div>
        <p className="text-ink-500 text-sm">Update the details of your listing.</p>
      </div>

      <div className="card p-8 animate-fade-up stagger-1 opacity-0" style={{ animationFillMode: 'forwards' }}>
        {errors.general && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label className="label" htmlFor="title">Title</label>
            <input
              id="title" type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className={`input-field ${errors.title ? 'border-red-400' : ''}`}
            />
            {errors.title && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.title}</p>}
          </div>

          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea
              id="description" rows={4}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className={`input-field resize-none ${errors.description ? 'border-red-400' : ''}`}
            />
            {errors.description && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label" htmlFor="price">Price (₹)</label>
              <div className="relative">
                <IndianRupee size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  id="price" type="number" min="1" step="0.01"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  className={`input-field pl-9 ${errors.price ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.price && <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.price}</p>}
            </div>

            <div>
              <label className="label" htmlFor="category">Category</label>
              <select
                id="category"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="input-field"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/my-listings')} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={17} className="animate-spin" /> Saving…</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
