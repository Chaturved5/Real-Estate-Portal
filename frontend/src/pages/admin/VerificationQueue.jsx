import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { verificationApi } from '../../services/verificationApi'
import { useTheme } from '../../context/ThemeContext.jsx'

const statuses = ['pending', 'approved', 'rejected', 'needs_more_info']
const kinds = ['identity', 'owner_role', 'agent_role', 'bank']

const VerificationQueue = () => {
  const { isDark } = useTheme()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ status: 'pending', kind: '', search: '' })

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const data = await verificationApi.adminList({ status: filters.status || undefined, kind: filters.kind || undefined })
        if (active) setItems(data?.data || data || [])
      } catch (err) {
        if (active) setError(err.message || 'Failed to load queue')
      } finally {
        if (active) setLoading(false)
      }
    }
    if (verificationApi.isEnabled) {
      load()
    } else {
      setError('Backend not configured. Set VITE_API_BASE_URL.')
      setLoading(false)
    }
    return () => {
      active = false
    }
  }, [filters.kind, filters.status])

  const filtered = items.filter((item) => {
    if (!filters.search) return true
    const haystack = `${item?.user?.email ?? ''} ${item?.user?.name ?? ''}`.toLowerCase()
    return haystack.includes(filters.search.toLowerCase())
  })

  return (
    <div className={`${isDark ? 'bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'} min-h-screen py-10`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Admin • Verifications</p>
            <h1 className="text-3xl font-bold">Verification queue</h1>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Review and approve identity/role submissions.</p>
          </div>
        </div>

        {error && <div className={`rounded-lg border px-4 py-3 text-sm ${isDark ? 'border-rose-500/40 bg-rose-500/10 text-rose-100' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>{error}</div>}

        <div className={`${isDark ? 'bg-slate-900/70 border border-white/10' : 'bg-white border border-slate-200 shadow-sm'} rounded-2xl p-5 shadow-sm space-y-4`}>
          <div className="flex flex-wrap gap-3 text-sm">
            <select
              className={`rounded-lg px-3 py-2 ${isDark ? 'border border-white/10 bg-slate-950/60 text-slate-100' : 'border border-slate-200 bg-white text-slate-800'}`}
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">All statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              className={`rounded-lg px-3 py-2 ${isDark ? 'border border-white/10 bg-slate-950/60 text-slate-100' : 'border border-slate-200 bg-white text-slate-800'}`}
              value={filters.kind}
              onChange={(e) => setFilters((f) => ({ ...f, kind: e.target.value }))}
            >
              <option value="">All kinds</option>
              {kinds.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <input
              type="search"
              placeholder="Search by email or name"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className={`rounded-lg px-3 py-2 w-full sm:w-64 ${isDark ? 'border border-white/10 bg-slate-950/60 text-slate-100 placeholder:text-slate-400' : 'border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400'}`}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className={isDark ? 'bg-slate-800/60' : 'bg-slate-100'}>
                <tr className={`text-left text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Kind</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((request) => (
                  <tr key={request.id} className={`${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'} transition-colors`}>
                    <td className="px-4 py-3">
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{request.user?.name ?? 'Unknown'}</div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{request.user?.email}</div>
                    </td>
                    <td className={`px-4 py-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{request.kind}</td>
                    <td className="px-4 py-3"><StatusBadge status={request.status} /></td>
                    <td className={`px-4 py-3 truncate max-w-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{request.notes ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/verifications/${request.id}`}
                        className={`text-sm font-semibold ${isDark ? 'text-emerald-200 hover:text-white' : 'text-emerald-700 hover:text-emerald-900'}`}
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={5} className={`px-4 py-4 text-center text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {loading ? 'Loading…' : 'No verification requests match your filters.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerificationQueue
