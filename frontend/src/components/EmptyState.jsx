const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 animate-float">
        <Icon size={28} className="text-slate-500" />
      </div>
    )}
    <h3 className="font-display text-xl font-semibold text-white mb-2">{title}</h3>
    {description && <p className="text-slate-400 text-sm max-w-sm mb-6">{description}</p>}
    {action}
  </div>
)

export default EmptyState
