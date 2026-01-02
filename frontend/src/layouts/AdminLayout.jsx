import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

const navItems = [
  { label: 'Overview', to: '/admin', icon: 'gauge' },
  { label: 'Verifications', to: '/admin/verifications', icon: 'id-card' },
  { label: 'Users', to: '/admin/users', icon: 'users' },
  { label: 'Properties', to: '/admin/properties', icon: 'building' },
  { label: 'Disputes', to: '/admin/disputes', icon: 'triangle-exclamation' },
  { label: 'Analytics', to: '/admin/analytics', icon: 'chart-line' },
]

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { isDark } = useTheme()

  return (
    <div className={`${isDark ? 'bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'} min-h-screen`}> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-lg font-semibold ${isDark ? 'bg-emerald-900/60 text-emerald-100 border border-emerald-700/60' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
              <FontAwesomeIcon icon="shield-halved" />
            </div>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>
                Admin
              </p>
              <h1 className="text-2xl font-bold">Platform Dashboard</h1>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Manage users, listings, disputes, and verification flows from the same app shell.</p>
            </div>
          </div>
          <div className={`hidden sm:flex flex-col text-right text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name}</span>
            <span>Admin</span>
            <span className={`inline-flex items-center gap-1 ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>
              <FontAwesomeIcon icon="circle-check" /> Active session
            </span>
          </div>
        </div>

        <div className={`flex flex-wrap gap-2 rounded-2xl border px-2 py-2 ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors border ${
                  isActive
                    ? isDark
                      ? 'bg-emerald-500/15 text-emerald-100 border-emerald-400/40 shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-sm'
                    : isDark
                      ? 'text-slate-200 border-transparent hover:bg-slate-800/60 hover:border-white/10'
                      : 'text-slate-700 border-transparent hover:bg-slate-50 hover:border-slate-200'
                }`
              }
            >
              <FontAwesomeIcon icon={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="min-h-[60vh]">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
