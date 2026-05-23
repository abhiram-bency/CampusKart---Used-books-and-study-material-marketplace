import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { listingsService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import ListingCard from '../components/ListingCard'
import { SkeletonGrid } from '../components/SkeletonCard'
import EmptyState from '../components/EmptyState'
import { Search, SlidersHorizontal, BookOpen, Cpu, Tag, X, PlusCircle, TrendingUp } from 'lucide-react'

const CATEGORIES = [
  { value: '', label: 'All Items', icon: Tag },
  { value: 'book', label: 'Books', icon: BookOpen },
  { value: 'hardware', label: 'Hardware', icon: Cpu },
]

const HeroBanner = ({ isAuthenticated }) => (
  <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 border-b border-slate-800">
    <div className="absolute inset-0 bg-mesh opacity-60" />
    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-5">
          <TrendingUp size={12} />
          Campus Marketplace — Buy &amp; Sell with Ease
        </div>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
          Trade smarter,<br />
          <span className="text-gradient">study better.</span>
        </h1>
        <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8">
          Discover used textbooks, academic hardware, and more. List your items in minutes and reach fellow students.
        </p>
        {!isAuthenticated && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/register" className="btn-primary flex items-center gap-2 justify-center">
              <PlusCircle size={16} /> Start Selling
            </Link>
            <Link to="/login" className="btn-secondary flex items-center gap-2 justify-center">
              Browse as Member
            </Link>
          </div>
        )}
      </div>
    </div>
  </div>
)

const LIMIT = 12

const HomePage = () => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('')
  const [skip, setSkip] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const isAppending = useRef(false)

  // Keep latest search/category in a ref so doFetch always sees current values
  const searchRef = useRef(debouncedSearch)
  const categoryRef = useRef(category)
  useEffect(() => { searchRef.current = debouncedSearch }, [debouncedSearch])
  useEffect(() => { categoryRef.current = category }, [category])

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  // Reset and re-fetch when search, category, OR location.search changes
  useEffect(() => {
    isAppending.current = false
    setSkip(0)
    setListings([])
    setHasMore(true)
    doFetch(0, debouncedSearch, category)
  }, [debouncedSearch, category, location.search])

  // "Load More" — fires only when skip increases past 0
  useEffect(() => {
    if (skip === 0) return
    isAppending.current = true
    doFetch(skip, searchRef.current, categoryRef.current)
  }, [skip])

  // doFetch receives all values as params — no stale closure risk
  const doFetch = async (currentSkip, currentSearch, currentCategory) => {
    setLoading(true)
    try {
      const params = {
        limit: LIMIT,
        skip: currentSkip,
        ...(currentSearch && { search: currentSearch }),
        ...(currentCategory && { category: currentCategory }),
      }

      const response = await listingsService.getAll(params)
      const items = Array.isArray(response.data)
        ? response.data
        : response.data.items || response.data.listings || []

      if (isAppending.current) {
        setListings(prev => [...prev, ...items])
      } else {
        setListings(items)
      }

      setHasMore(items.length === LIMIT)
    } catch (err) {
      console.error('Fetch listings error:', err)
      if (!isAppending.current) setListings([])
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    setSkip(prev => prev + LIMIT)
  }

  const clearSearch = () => {
    setSearch('')
    setDebouncedSearch('')
  }

  return (
    <div className="animate-fade-in">
      <HeroBanner isAuthenticated={isAuthenticated} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search books, hardware, notes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 pr-10"
            />
            {search && (
              <button onClick={clearSearch} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <SlidersHorizontal size={15} className="text-slate-500 flex-shrink-0" />
            {CATEGORIES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setCategory(value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all
                  ${category === value
                    ? 'bg-brand-500 text-white shadow-glow'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                  }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-400">
            {!loading && (
              <>
                <span className="text-white font-medium">{listings.length}</span> listing{listings.length !== 1 ? 's' : ''} found
                {debouncedSearch && <> for <span className="text-brand-400">"{debouncedSearch}"</span></>}
              </>
            )}
          </p>
          {isAuthenticated && (
            <Link to="/listings/create" className="btn-primary flex items-center gap-1.5 text-sm px-4 py-2">
              <PlusCircle size={14} /> List an Item
            </Link>
          )}
        </div>

        {/* Grid */}
        {loading && listings.length === 0 ? (
          <SkeletonGrid count={LIMIT} />
        ) : listings.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No listings found"
            description={debouncedSearch ? `No results for "${debouncedSearch}". Try a different search.` : 'Be the first to list something!'}
            action={isAuthenticated ? (
              <Link to="/listings/create" className="btn-primary flex items-center gap-2">
                <PlusCircle size={16} /> Create Listing
              </Link>
            ) : null}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {listings.map(listing => (
                <div key={listing.id} className="animate-fade-in">
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>

            {hasMore && !loading && (
              <div className="flex justify-center mt-10">
                <button onClick={handleLoadMore} className="btn-secondary px-8">
                  Load More
                </button>
              </div>
            )}
            {loading && listings.length > 0 && (
              <div className="flex justify-center mt-8">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default HomePage