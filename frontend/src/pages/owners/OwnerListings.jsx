import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMarketplace } from '../../context/MarketplaceContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const statusColor = {
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  pending: 'bg-amber-100 text-amber-900 border-amber-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  paused: 'bg-slate-100 text-slate-700 border-slate-200',
  available: 'bg-green-100 text-green-800 border-green-200'
}

const formatCurrency = (amount) => {
  const value = Number(amount)
  if (!Number.isFinite(value) || value <= 0) return '—'
  return `₹${value.toLocaleString('en-IN')}`
}

const normalizeStatus = (status) => {
  if (status === 'available') return 'approved'
  return status || 'draft'
}

const OwnerListings = () => {
  const { properties, updateProperty, deleteProperty } = useMarketplace()
  const { user } = useAuth()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [busyId, setBusyId] = useState(null)

  const ownerProperties = useMemo(() => {
    if (!user?.id) return []
    const scoped = properties.filter((prop) => prop.ownerId === user.id)
    return scoped.map((prop) => ({ ...prop, status: normalizeStatus(prop.status) }))
  }, [properties, user])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return ownerProperties.filter((prop) => {
      const matchesTerm = term
        ? prop.title.toLowerCase().includes(term) || prop.city?.toLowerCase().includes(term) || prop.location?.toLowerCase().includes(term)
        : true
      const matchesStatus = filterStatus === 'all' ? true : prop.status === filterStatus
      return matchesTerm && matchesStatus
    })
  }, [ownerProperties, search, filterStatus])

  const togglePause = async (property) => {
    setBusyId(property.id)
    try {
      const nextStatus = property.status === 'paused' ? 'approved' : 'paused'
      await updateProperty(property.id, { status: nextStatus })
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (property) => {
    const confirm = window.confirm(`Delete ${property.title}? This cannot be undone.`)
    if (!confirm) return
    setBusyId(property.id)
    try {
      await deleteProperty(property.id)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="bg-amber-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-700">Owner workspace</p>
            <h1 className="text-3xl font-bold text-green-900">Your listings</h1>
            <p className="text-sm text-gray-600">Manage drafts, approvals, and visibility in one place.</p>
          </div>
          <Link
            to="/owner/listings/new"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 shadow-sm"
          >
            + New listing
          </Link>
        </div>

        <div className="page-panel mt-6 p-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or city"
                className="flex-1 sm:w-64 border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 bg-white"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-amber-200 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paused">Paused</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <p className="text-xs text-gray-500">{filtered.length} result(s)</p>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white border border-amber-100 rounded-xl p-8 text-center space-y-3">
              <p className="text-sm text-gray-600">No listings found. Create your first one.</p>
              <Link to="/owner/listings/new" className="text-green-700 text-sm font-semibold">Start a listing</Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-amber-100">
                <thead className="bg-amber-50 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Listing</th>
                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                    <th className="px-4 py-3 text-left font-semibold">Price</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50 text-sm">
                  {filtered.map((property) => (
                    <tr key={property.id} className="hover:bg-amber-50/60">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-green-900">{property.title}</div>
                        <p className="text-xs text-gray-600">{property.city || property.location}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <div className="capitalize">{property.listingIntent || 'rent'}</div>
                        <p className="text-xs text-gray-500">{property.type}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {property.listingIntent === 'sale'
                          ? formatCurrency(property.pricing?.salePrice || property.price)
                          : formatCurrency(property.pricing?.monthlyRent || property.price)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${statusColor[property.status] || statusColor.pending}`}>
                          {property.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/owner/listings/${property.id}/edit`}
                            className="text-green-700 hover:text-green-800 font-semibold text-xs"
                          >
                            Edit
                          </Link>
                          {(property.status === 'approved' || property.status === 'paused') && (
                            <button
                              className="text-amber-700 hover:text-amber-800 font-semibold text-xs"
                              onClick={() => togglePause(property)}
                              disabled={busyId === property.id}
                            >
                              {property.status === 'paused' ? 'Resume' : 'Pause'}
                            </button>
                          )}
                          <button
                            className="text-red-600 hover:text-red-700 font-semibold text-xs"
                            onClick={() => handleDelete(property)}
                            disabled={busyId === property.id}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OwnerListings
