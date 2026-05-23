import { Link } from 'react-router-dom'
import { Tag, User, BookOpen, Cpu } from 'lucide-react'

const CATEGORY_ICONS = {
  books: BookOpen,
  hardware: Cpu,
  default: Tag,
}

const CATEGORY_COLORS = {
  books: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  hardware: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  default: 'text-brand-400 bg-brand-400/10 border-brand-400/20',
}

const ListingCard = ({ listing }) => {
  const { id, title, description, price, category, seller } = listing
  const cat = category?.toLowerCase() || 'default'
  const Icon = CATEGORY_ICONS[cat] || CATEGORY_ICONS.default
  const colorClass = CATEGORY_COLORS[cat] || CATEGORY_COLORS.default

  return (
    <Link to={`/listings/${id}`} className="card block p-5 group">
      {/* Category pill */}
      <div className="flex items-center justify-between mb-3">
        <span className={`badge border ${colorClass}`}>
          <Icon size={11} className="mr-1" />
          {category || 'General'}
        </span>
        <span className="text-xs text-slate-500 font-mono">#{id?.toString().slice(-4) || '----'}</span>
      </div>

      {/* Title */}
      <h3 className="font-display font-semibold text-lg text-white mb-2 leading-snug
                     group-hover:text-brand-400 transition-colors line-clamp-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4 min-h-[2.5rem]">
        {description || 'No description provided.'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <User size={12} />
          <span className="truncate max-w-[100px]">{seller?.name || seller?.email || 'Unknown'}</span>
        </div>
        <span className="font-display font-bold text-xl text-brand-400">
          ₹{typeof price === 'number' ? price.toLocaleString('en-IN') : price}
        </span>
      </div>
    </Link>
  )
}

export default ListingCard
