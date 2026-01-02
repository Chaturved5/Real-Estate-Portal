const palette = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-rose-100 text-rose-800 border-rose-200',
  needs_more_info: 'bg-blue-100 text-blue-800 border-blue-200',
  unsubmitted: 'bg-gray-100 text-gray-700 border-gray-200',
  default: 'bg-gray-100 text-gray-700 border-gray-200',
}

const labelMap = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  needs_more_info: 'Needs more info',
  unsubmitted: 'Not submitted',
}

const StatusBadge = ({ status = 'default', children }) => {
  const normalized = String(status || 'default').toLowerCase()
  const classes = palette[normalized] || palette.default
  const label = children || labelMap[normalized] || status

  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${classes}`}>{label}</span>
}

export default StatusBadge
