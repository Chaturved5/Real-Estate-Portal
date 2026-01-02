import { useMemo } from 'react'
import { useTheme } from '../../context/ThemeContext.jsx'

const StatCard = ({ label, value, helper, isDark }) => (
  <div className={`rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-slate-900/80' : 'border-slate-200 bg-white shadow-sm'}`}>
    <p className={`text-xs uppercase tracking-wide font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</p>
    <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
    {helper && <p className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{helper}</p>}
  </div>
)

const SparkBar = ({ values = [], color = 'bg-emerald-400' }) => (
  <div className="flex items-end gap-1 h-16">
    {values.map((v, idx) => (
      <div key={idx} className={`w-3 rounded-sm ${color}`} style={{ height: `${Math.max(8, v)}%`, minHeight: '8px' }} />
    ))}
  </div>
)

const AdminAnalytics = () => {
  const { isDark } = useTheme()
  const metrics = useMemo(
    () => ({
      users: 12450,
      listings: 830,
      bookings: 4120,
      revenue: '₹8.4Cr',
      growth: '+12% MoM',
    }),
    []
  )

  return (
    <div className={`${isDark ? 'bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'} min-h-screen py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 space-y-6">
        <header className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-300 font-semibold">Admin • Analytics</p>
          <h1 className="text-3xl font-bold">Performance & analytics</h1>
          <p className={`text-sm max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>High-level KPIs and simple trend sparks. Replace static data with API/BI source when ready.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard isDark={isDark} label="Active users" value={metrics.users.toLocaleString('en-IN')} helper="All roles" />
          <StatCard isDark={isDark} label="Listings live" value={metrics.listings.toLocaleString('en-IN')} helper="Approved inventory" />
          <StatCard isDark={isDark} label="Bookings" value={metrics.bookings.toLocaleString('en-IN')} helper="Lifetime" />
          <StatCard isDark={isDark} label="Revenue" value={metrics.revenue} helper={metrics.growth} />
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className={`rounded-2xl border p-6 space-y-4 ${isDark ? 'border-white/10 bg-slate-900/80' : 'border-slate-200 bg-white shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Bookings trend</h2>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Last 12 periods</span>
            </div>
            <SparkBar values={[10, 18, 22, 25, 28, 35, 32, 38, 42, 44, 48, 55]} color="bg-emerald-400" />
          </div>

          <div className={`rounded-2xl border p-6 space-y-4 ${isDark ? 'border-white/10 bg-slate-900/80' : 'border-slate-200 bg-white shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Verification throughput</h2>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Pending vs approved</span>
            </div>
            <SparkBar values={[55, 52, 48, 40, 38, 32, 28, 24, 22, 20, 18, 16]} color="bg-amber-300" />
          </div>
        </div>

        <div className={`rounded-2xl border p-6 space-y-3 ${isDark ? 'border-white/10 bg-slate-900/80' : 'border-slate-200 bg-white shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Upcoming work</h2>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Roadmap for real data</span>
          </div>
          <ul className={`space-y-2 text-sm list-disc list-inside ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
            <li>Wire metrics to backend endpoints or BI warehouse.</li>
            <li>Add date range selector and comparative deltas (WoW, MoM).</li>
            <li>Provide CSV export and scheduled email reports.</li>
            <li>Add drilldowns for city, role, and property type.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics
