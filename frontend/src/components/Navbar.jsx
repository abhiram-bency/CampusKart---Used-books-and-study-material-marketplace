import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ShoppingCart, BookOpen, Package, PlusCircle,
  LayoutDashboard, LogOut, Menu, X, User, ChevronDown
} from 'lucide-react'

const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5 group">
    <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow">
      <ShoppingCart size={16} className="text-white" />
    </div>
    <span className="font-display font-bold text-xl text-white">
      Campus<span className="text-gradient">Kart</span>
    </span>
  </Link>
)

const NavLink = ({ to, icon: Icon, label, mobile, onClick }) => {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${mobile ? 'w-full' : ''}
        ${isActive
          ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </Link>
  )
}

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    setMobileOpen(false)
    navigate('/login')
  }

  const close = () => setMobileOpen(false)

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled ? 'glass shadow-lg border-b border-slate-800' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/" icon={BookOpen} label="Marketplace" />
              {isAuthenticated && (
                <>
                  <NavLink to="/listings/create" icon={PlusCircle} label="Sell" />
                  <NavLink to="/my-listings" icon={Package} label="My Listings" />
                  <NavLink to="/orders" icon={ShoppingCart} label="Orders" />
                  {isAdmin && <NavLink to="/admin" icon={LayoutDashboard} label="Admin" />}
                </>
              )}
            </div>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all text-sm"
                  >
                    <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-slate-200 max-w-[100px] truncate">{user?.name}</span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl shadow-xl border border-slate-700 py-1 animate-slide-down">
                      <div className="px-3 py-2 border-b border-slate-700">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary text-sm px-4 py-2">Sign In</Link>
                  <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
          <div className="absolute top-0 right-0 w-72 h-full glass border-l border-slate-800 p-6 animate-slide-down flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <Logo />
              <button onClick={close} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
                <X size={18} />
              </button>
            </div>

            {isAuthenticated && (
              <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                <div className="w-9 h-9 bg-brand-500 rounded-full flex items-center justify-center font-bold text-white">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <NavLink to="/" icon={BookOpen} label="Marketplace" mobile onClick={close} />
              {isAuthenticated ? (
                <>
                  <NavLink to="/listings/create" icon={PlusCircle} label="Sell an Item" mobile onClick={close} />
                  <NavLink to="/my-listings" icon={Package} label="My Listings" mobile onClick={close} />
                  <NavLink to="/orders" icon={ShoppingCart} label="My Orders" mobile onClick={close} />
                  {isAdmin && <NavLink to="/admin" icon={LayoutDashboard} label="Admin Dashboard" mobile onClick={close} />}
                </>
              ) : (
                <>
                  <NavLink to="/login" icon={User} label="Sign In" mobile onClick={close} />
                </>
              )}
            </div>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="mt-auto w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            ) : (
              <Link to="/register" onClick={close} className="btn-primary text-center mt-auto">
                Create Account
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
      )}
    </>
  )
}

export default Navbar
