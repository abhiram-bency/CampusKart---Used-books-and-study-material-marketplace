import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listingsService } from '../services/api'
import PageHeader from '../components/PageHeader'
import { BookOpen, Cpu, Tag, DollarSign, FileText, Type, ArrowRight, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { value: 'book', label: 'Books', icon: BookOpen, desc: 'Textbooks, notes, guides' },
  { value: 'hardware', label: 'Hardware', icon: Cpu, desc: 'Calculators, devices, tools' },
  { value: 'other', label: 'Other', icon: Tag, desc: 'Anything else academic' },
]

const CreateListingPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    else if (form.title.length < 3) errs.title = 'Title must be at least 3 characters'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (!form.price) errs.price = 'Price is required'
    else if (isNaN(Number(form.price)) || Number(form.price) <= 0) errs.price = 'Enter a valid price'
    if (!form.category) errs.category = 'Select a category'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const { data } = await listingsService.create({
        ...form,
        price: parseFloat(form.price),
      })
      toast.success('Listing created successfully!')
      navigate('/?refresh=' + Date.now())
    } catch (err) {
      // Show the full backend validation message
      const detail = err.response?.data?.detail
      const msg = Array.isArray(detail)
        ? detail.map(d => d.msg).join(', ')   // FastAPI 422 returns an array
        : detail || 'Failed to create listing'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setErrors(er => ({ ...er, [k]: '' }))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 animate-slide-up">
      <PageHeader
        title="Create a Listing"
        subtitle="List your item and reach hundreds of students"
      />

      <div className="glass rounded-2xl border border-slate-800 p-6 md:p-8 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category first */}
          <div>
            <label className="label">Category <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value} type="button"
                  onClick={() => { setForm(f => ({ ...f, category: value })); setErrors(er => ({ ...er, category: '' })) }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all
                    ${form.category === value
                      ? 'bg-brand-500/15 border-brand-500/40 text-brand-300'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{label}</span>
                  <span className="text-xs text-slate-500 hidden sm:block">{desc}</span>
                </button>
              ))}
            </div>
            {errors.category && <p className="text-red-400 text-xs mt-1.5">{errors.category}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="label">Title <span className="text-red-400">*</span></label>
            <div className="relative">
              <Type size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text" placeholder="e.g. NCERT Chemistry Part 1 — Class 12"
                value={form.title} onChange={set('title')}
                className={`input-field pl-10 ${errors.title ? 'border-red-500/50' : ''}`}
                maxLength={100}
              />
            </div>
            <div className="flex justify-between mt-1">
              {errors.title ? <p className="text-red-400 text-xs">{errors.title}</p> : <span />}
              <span className="text-xs text-slate-600">{form.title.length}/100</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description <span className="text-red-400">*</span></label>
            <div className="relative">
              <FileText size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <textarea
                placeholder="Describe the condition, edition, any markings, etc."
                value={form.description} onChange={set('description')}
                rows={4}
                className={`input-field pl-10 resize-none ${errors.description ? 'border-red-500/50' : ''}`}
                maxLength={500}
              />
            </div>
            <div className="flex justify-between mt-1">
              {errors.description ? <p className="text-red-400 text-xs">{errors.description}</p> : <span />}
              <span className="text-xs text-slate-600">{form.description.length}/500</span>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="label">Price (₹) <span className="text-red-400">*</span></label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="number" placeholder="0.00" min="1" step="0.01"
                value={form.price} onChange={set('price')}
                className={`input-field pl-10 ${errors.price ? 'border-red-500/50' : ''}`}
              />
            </div>
            {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
            <p className="text-xs text-slate-500 mt-1">Set a fair price — items priced well sell faster</p>
          </div>

          {/* Preview card */}
          {(form.title || form.price) && (
            <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-4">
              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-medium">Preview</p>
              <p className="text-white font-semibold line-clamp-1">{form.title || '—'}</p>
              {form.description && <p className="text-slate-400 text-sm mt-1 line-clamp-2">{form.description}</p>}
              {form.price && (
                <p className="text-brand-400 font-display font-bold text-xl mt-2">
                  ₹{parseFloat(form.price || 0).toLocaleString('en-IN')}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <><CheckCircle size={16} /> Publish Listing</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateListingPage
