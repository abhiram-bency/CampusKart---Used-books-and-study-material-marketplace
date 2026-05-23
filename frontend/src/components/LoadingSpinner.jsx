export default function LoadingSpinner({ fullPage = false, size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  const spinner = (
    <div
      className={`${sizes[size]} rounded-full border-campus-200 border-t-campus-600 animate-spin`}
      role="status"
      aria-label="Loading"
    />
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-ink-50/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-campus-200 border-t-campus-600 animate-spin" />
          <p className="text-sm font-display font-medium text-ink-500">Loading…</p>
        </div>
      </div>
    )
  }

  return spinner
}
