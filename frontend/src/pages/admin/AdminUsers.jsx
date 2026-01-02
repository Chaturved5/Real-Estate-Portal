import { useMemo, useState } from 'react'
import StatusBadge from '../../components/StatusBadge'

const sampleUsers = [
  { id: 1, name: 'Admin Portal', email: 'admin@estateportal.com', role: 'admin', status: 'active', verified: true },
  { id: 2, name: 'Owner One', email: 'owner@estateportal.com', role: 'owner', status: 'active', verified: true },
  { id: 3, name: 'Broker Ally', email: 'broker@estateportal.com', role: 'broker', status: 'active', verified: false },
  { id: 4, name: 'Buyer Prime', email: 'buyer@estateportal.com', role: 'buyer', status: 'suspended', verified: false },
]

const roleColors = {
  admin: 'text-emerald-200 bg-emerald-500/15 border-emerald-500/40',
  owner: 'text-blue-200 bg-blue-500/15 border-blue-500/40',
  broker: 'text-amber-200 bg-amber-500/15 border-amber-500/40',
  agent: 'text-amber-200 bg-amber-500/15 border-amber-500/40',
  buyer: 'text-slate-200 bg-slate-500/15 border-slate-500/40',
}

const AdminUsers = () => {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')

  const filtered = useMemo(() => {
    return sampleUsers.filter((user) => {
      if (role && user.role !== role) return false
      if (status && user.status !== status) return false
      if (search) {
        const haystack = `${user.name} ${user.email}`.toLowerCase()
        if (!haystack.includes(search.toLowerCase())) return false
      }
      return true
    })
  }, [role, search, status])

  return (
    <div className="bg-slate-950 text-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 space-y-6">
        <header className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-300 font-semibold">Admin • Users</p>
          <h1 className="text-3xl font-bold text-white">User management</h1>
          <p className="text-sm text-slate-300 max-w-2xl">Search, filter, and review user access. Hook this table to backend when APIs are ready.</p>
        </header>

        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap gap-3 text-sm">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All roles</option>
              {['admin', 'owner', 'broker', 'agent', 'buyer'].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All status</option>
              {['active', 'suspended'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-slate-800/60">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-200">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-slate-100">
                      <div className="font-semibold text-white">{user.name}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${roleColors[user.role] || 'border-white/10 text-slate-200'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-100">
                      <StatusBadge status={user.status === 'active' ? 'approved' : 'rejected'} />
                    </td>
                    <td className="px-4 py-3 text-slate-100">
                      <StatusBadge status={user.verified ? 'approved' : 'pending'} />
                    </td>
                    <td className="px-4 py-3 text-slate-200">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <button className="px-3 py-1 rounded-lg border border-white/15 bg-white/5 text-emerald-100 hover:border-emerald-400">View</button>
                        <button className="px-3 py-1 rounded-lg border border-white/15 bg-white/5 text-amber-100 hover:border-amber-400">Suspend</button>
                        <button className="px-3 py-1 rounded-lg border border-white/15 bg-white/5 text-rose-100 hover:border-rose-400">Reset MFA</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-sm text-slate-300">No users match the current filters.</td>
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

export default AdminUsers
