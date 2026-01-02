import { useMemo, useState } from 'react'
import StatusBadge from '../../components/StatusBadge'
import { useTheme } from '../../context/ThemeContext.jsx'

const sampleDisputes = [
  { id: 'D-11', title: 'Refund request - Harbor View', status: 'pending', priority: 'high', assigned: 'Admin Portal', createdAt: '2025-11-20' },
  { id: 'D-12', title: 'Noise complaint - Skyline Residency', status: 'in_review', priority: 'medium', assigned: 'Admin Portal', createdAt: '2025-11-18' },
  { id: 'D-13', title: 'Payment shortfall - Tech Park', status: 'resolved', priority: 'low', assigned: 'Admin Portal', createdAt: '2025-11-10' },
]

const priorityTone = {
  high: 'text-rose-200 bg-rose-500/15 border-rose-500/40',
  medium: 'text-amber-200 bg-amber-500/15 border-amber-500/40',
  low: 'text-emerald-200 bg-emerald-500/15 border-emerald-500/40',
}

const AdminDisputes = () => {
  const { isDark } = useTheme()
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')

  const filtered = useMemo(() => {
    return sampleDisputes.filter((d) => {
      if (status && d.status !== status) return false
      if (priority && d.priority !== priority) return false
      return true
    })
  }, [priority, status])

  return (
    <div className={`${isDark ? 'bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'} min-h-screen py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 space-y-6">
        <header className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-300 font-semibold">Admin • Disputes</p>
          <h1 className="text-3xl font-bold">Disputes & escalations</h1>
          <p className={`text-sm max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Triage, assign, and resolve customer issues. Replace sample data with API when ready.</p>
        </header>

        <div className={`${isDark ? 'bg-slate-900/70 border border-white/10' : 'bg-white border border-slate-200 shadow-sm'} rounded-2xl p-5 space-y-4`}>
          <div className="flex flex-wrap gap-3 text-sm">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isDark ? 'border border-white/10 bg-slate-950/60 text-slate-100' : 'border border-slate-200 bg-white text-slate-800'}`}
            >
              <option value="">All status</option>
              {['pending', 'in_review', 'resolved'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={`rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isDark ? 'border border-white/10 bg-slate-950/60 text-slate-100' : 'border border-slate-200 bg-white text-slate-800'}`}
            >
              <option value="">All priorities</option>
              {['high', 'medium', 'low'].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className={isDark ? 'bg-slate-800/60' : 'bg-slate-100'}>
                <tr className={`text-left text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  <th className="px-4 py-3">Ticket</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((item) => (
                  <tr key={item.id} className={`${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'} transition-colors`}>
                    <td className="px-4 py-3">
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>#{item.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${priorityTone[item.priority]}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    <td className={`px-4 py-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.assigned}</td>
                    <td className={`px-4 py-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.createdAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <button className={`px-3 py-1 rounded-lg border ${isDark ? 'border-white/15 bg-white/5 text-emerald-100 hover:border-emerald-400' : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300'}`}>View</button>
                        <button className={`px-3 py-1 rounded-lg border ${isDark ? 'border-white/15 bg-white/5 text-amber-100 hover:border-amber-400' : 'border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300'}`}>Assign</button>
                        <button className={`px-3 py-1 rounded-lg border ${isDark ? 'border-white/15 bg-white/5 text-emerald-100 hover:border-emerald-400' : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300'}`}>Resolve</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={6} className={`px-4 py-4 text-center text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      No disputes match the current filters.
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

export default AdminDisputes
