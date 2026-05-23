const STATUS = {
  pending:    { label: 'Pending',    cls: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' },
  confirmed:  { label: 'Confirmed',  cls: 'bg-blue-400/10 text-blue-400 border-blue-400/20' },
  shipped:    { label: 'Shipped',    cls: 'bg-purple-400/10 text-purple-400 border-purple-400/20' },
  delivered:  { label: 'Delivered',  cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
  cancelled:  { label: 'Cancelled',  cls: 'bg-red-400/10 text-red-400 border-red-400/20' },
}

const OrderStatusBadge = ({ status }) => {
  const s = STATUS[status?.toLowerCase()] || STATUS.pending
  return (
    <span className={`badge border ${s.cls}`}>{s.label}</span>
  )
}

export default OrderStatusBadge
