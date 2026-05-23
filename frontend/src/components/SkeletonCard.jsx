const SkeletonCard = () => (
  <div className="card p-5 pointer-events-none">
    <div className="flex items-center justify-between mb-3">
      <div className="shimmer h-5 w-20 rounded-full" />
      <div className="shimmer h-4 w-10 rounded" />
    </div>
    <div className="shimmer h-6 w-4/5 rounded-lg mb-2" />
    <div className="shimmer h-4 w-full rounded mb-1.5" />
    <div className="shimmer h-4 w-3/4 rounded mb-4" />
    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
      <div className="shimmer h-4 w-24 rounded" />
      <div className="shimmer h-7 w-20 rounded-lg" />
    </div>
  </div>
)

export const SkeletonGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
)

export default SkeletonCard
