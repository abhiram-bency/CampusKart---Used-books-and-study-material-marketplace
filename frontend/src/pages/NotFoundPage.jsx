import { Link } from 'react-router-dom'
import { ShoppingCart, ArrowLeft } from 'lucide-react'

const NotFoundPage = () => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center animate-fade-in">
    <div className="font-display text-8xl font-bold text-brand-500/30 mb-4">404</div>
    <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mb-5 animate-float">
      <ShoppingCart size={28} className="text-brand-400" />
    </div>
    <h1 className="font-display text-2xl font-bold text-white mb-2">Page Not Found</h1>
    <p className="text-slate-400 text-sm mb-8 max-w-xs">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link to="/" className="btn-primary flex items-center gap-2">
      <ArrowLeft size={16} /> Back to Marketplace
    </Link>
  </div>
)

export default NotFoundPage
