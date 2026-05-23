const StatsCard = ({ icon: Icon, label, value, color = 'brand', trend }) => {
  const colors = {
    brand: 'from-brand-500/20 to-brand-600/5 border-brand-500/20 text-brand-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
    rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/20 text-rose-400',
  }

  return (
    <div className={`card p-5 bg-gradient-to-br ${colors[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center ${colors[color].split(' ')[3]}`}>
          <Icon size={20} className="text-current" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            trend >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-3xl font-display font-bold text-white mb-1">{value ?? '—'}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  )
}

export default StatsCard
