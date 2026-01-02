import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMarketplace } from '../../context/MarketplaceContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotifications } from '../../context/NotificationContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

const formatTimestamp = (value) => {
  if (!value) {
    return 'Just now'
  }
  try {
    return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch (error) {
    return value
  }
}

const classifyNotification = (notification) => {
  if (!notification?.title) {
    return { isCritical: false, category: 'general' }
  }

  const lowered = notification.title.toLowerCase()
  const messageLowered = (notification.message || '').toLowerCase()
  const isCritical = lowered.includes('dispute') || lowered.includes('urgent') || lowered.includes('escalation') || messageLowered.includes('breach')

  const haystack = `${lowered} ${messageLowered}`
  let category = 'general'
  if (/(payment|payout|revenue|settlement|invoice|refund)/.test(haystack)) {
    category = 'financial'
  } else if (/(approval|listing|onboarding|compliance|audit|policy)/.test(haystack)) {
    category = 'governance'
  } else if (/(booking|visit|tour|review|customer|lead)/.test(haystack)) {
    category = 'operations'
  } else if (/(system|maintenance|downtime|integration|api)/.test(haystack)) {
    category = 'system'
  }

  return { isCritical, category }
}

const MetricCard = ({ label, value, helper, tone = 'default', isDark }) => {
  const toneClass = {
    default: isDark ? 'bg-slate-900/70 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900',
    highlight: 'bg-emerald-600 text-white border-emerald-500/60',
    warning: isDark ? 'bg-amber-500/10 text-amber-100 border-amber-400/60' : 'bg-amber-50 text-amber-900 border-amber-200'
  }[tone]

  const helperClass = tone === 'highlight'
    ? 'text-white/80'
    : isDark
      ? 'text-slate-300'
      : 'text-slate-600'

  return (
    <div className={`${toneClass} rounded-2xl border p-5 sm:p-6 space-y-2 shadow-sm`}> 
      <p className={`text-xs font-semibold uppercase tracking-wide ${tone === 'highlight' ? 'text-white/80' : isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>{label}</p>
      <p className="text-2xl sm:text-3xl font-bold">{value}</p>
      {helper && <p className={`text-xs sm:text-sm ${helperClass}`}>{helper}</p>}
    </div>
  )
}

const Admin = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const { properties, bookings, payments, ownersById } = useMarketplace()
  const { getNotificationsForRole, markAsRead, markAllAsRead } = useNotifications()
  const [notificationFilter, setNotificationFilter] = useState('all')
  const [notificationCategory, setNotificationCategory] = useState('all')
  const [notificationPage, setNotificationPage] = useState(0)
  const NOTIFICATION_PAGE_SIZE = 6

  const stats = useMemo(() => {
    if (!properties.length) {
      return {
        totalProperties: 0,
        activeListings: 0,
        pendingListings: 0,
        topCity: null,
        citySpread: [],
        occupancyRate: 0,
        totalBookings: bookings.length,
        confirmedBookings: bookings.filter((booking) => booking.status === 'confirmed').length,
        revenue: payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
      }
    }

    const pendingListings = properties.filter((property) => property.status === 'pending').length
    const citySpreadMap = new Map()
    properties.forEach((property) => {
      const count = citySpreadMap.get(property.city) ?? 0
      citySpreadMap.set(property.city, count + 1)
    })
    const citySpread = Array.from(citySpreadMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)

    const topCity = citySpread[0] ?? null
    const confirmedBookings = bookings.filter((booking) => booking.status === 'confirmed')
    const occupancyRate = properties.length ? Math.min(100, Math.round((confirmedBookings.length / properties.length) * 100)) : 0
    const revenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)

    return {
      totalProperties: properties.length,
      activeListings: properties.filter((property) => property.status === 'available').length,
      pendingListings,
      topCity,
      citySpread,
      occupancyRate,
      totalBookings: bookings.length,
      confirmedBookings: confirmedBookings.length,
      revenue
    }
  }, [bookings, payments, properties])

  const ownerLeaderboard = useMemo(() => {
    const ownerCounts = new Map()
    properties.forEach((property) => {
      if (!ownerCounts.has(property.ownerId)) {
        ownerCounts.set(property.ownerId, { propertyCount: 0, bookingCount: 0 })
      }
      ownerCounts.get(property.ownerId).propertyCount += 1
    })

    bookings.forEach((booking) => {
      const property = properties.find((entry) => entry.id === booking.propertyId)
      if (!property) {
        return
      }
      const snapshot = ownerCounts.get(property.ownerId)
      if (snapshot) {
        snapshot.bookingCount += 1
      }
    })

    return Array.from(ownerCounts.entries())
      .map(([ownerId, counts]) => ({ ownerId, ...counts, owner: ownersById.get(ownerId) }))
      .filter((item) => item.owner)
      .sort((a, b) => b.propertyCount - a.propertyCount)
      .slice(0, 5)
  }, [bookings, ownersById, properties])

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))
      .slice(0, 6)
      .map((booking) => {
        const property = properties.find((entry) => entry.id === booking.propertyId)
        const payment = payments.find((entry) => entry.bookingId === booking.id)
        return {
          ...booking,
          property,
          payment
        }
      })
  }, [bookings, payments, properties])

  const notificationStats = useMemo(() => {
    const items = getNotificationsForRole('admin')
    const unread = items.filter((item) => !item.read)
    const classified = items.map((item) => ({ ...item, meta: classifyNotification(item) }))
    const critical = classified.filter((item) => item.meta.isCritical)
    const categoryCounts = classified.reduce(
      (accumulator, item) => {
        const key = item.meta.category
        accumulator[key] = (accumulator[key] ?? 0) + 1
        return accumulator
      },
      { general: 0, financial: 0, governance: 0, operations: 0, system: 0 }
    )

    return {
      total: items.length,
      unread: unread.length,
      critical: critical.length,
      categories: categoryCounts
    }
  }, [getNotificationsForRole])

  const notificationFeed = useMemo(() => {
    const items = getNotificationsForRole('admin')
      .slice()
      .map((item) => ({ ...item, meta: classifyNotification(item) }))
      .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))

    const filtered = items.filter((item) => {
      if (notificationFilter === 'unread' && item.read) {
        return false
      }
      if (notificationFilter === 'critical' && !item.meta.isCritical) {
        return false
      }
      if (notificationCategory !== 'all' && item.meta.category !== notificationCategory) {
        return false
      }
      return true
    })

    const start = notificationPage * NOTIFICATION_PAGE_SIZE
    return {
      total: filtered.length,
      pageItems: filtered.slice(start, start + NOTIFICATION_PAGE_SIZE)
    }
  }, [NOTIFICATION_PAGE_SIZE, getNotificationsForRole, notificationCategory, notificationFilter, notificationPage])

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className={isDark ? 'bg-slate-950 min-h-screen text-slate-100' : 'bg-slate-50 min-h-screen text-slate-900'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Admin Control Center</p>
            <h1 className={`text-3xl sm:text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Platform performance overview</h1>
            <p className={`text-sm sm:text-base max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Monitor portfolio health, approvals, and escalations in one place.
            </p>
          </div>
          <Link
            to="/profile"
            className={`inline-flex items-center justify-center px-5 py-2 rounded-lg border text-sm font-semibold transition-colors ${isDark ? 'border-white/15 text-emerald-200 hover:bg-slate-800' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
          >
            Manage admin profile
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total listings" value={stats.totalProperties} helper="Across residential & commercial" isDark={isDark} />
          <MetricCard label="Active inventory" value={stats.activeListings} helper="Listings available for booking" isDark={isDark} />
          <MetricCard label="Occupancy ratio" value={`${stats.occupancyRate}%`} helper="Confirmed bookings vs inventory" isDark={isDark} />
          <MetricCard label="Revenue captured" value={formatCurrency(stats.revenue)} helper="Payments processed to date" tone="highlight" isDark={isDark} />
          <MetricCard label="Notifications" value={notificationStats.total} helper={`${notificationStats.unread} unread • ${notificationStats.critical} critical`} isDark={isDark} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr),0.9fr]">
          <div className="space-y-6">
            <div className={`${isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200 shadow-sm'} rounded-2xl border p-6 sm:p-8 space-y-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Recent booking activity</h2>
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Track the latest reservations and payments.</p>
                </div>
                <Link to="/marketplace" className={`inline-flex items-center justify-center text-sm font-semibold ${isDark ? 'text-emerald-200 hover:text-white' : 'text-emerald-700 hover:text-emerald-900'}`}>
                  View marketplace →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y text-sm ${isDark ? 'divide-white/5' : 'divide-slate-200'}`}>
                  <thead className={isDark ? 'bg-slate-800/60' : 'bg-slate-100'}>
                    <tr className={`text-left text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      <th className="px-4 py-3">Booking</th>
                      <th className="px-4 py-3">Property</th>
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Payment</th>
                    </tr>
                  </thead>
                  <tbody className={isDark ? 'divide-y divide-white/5' : 'divide-y divide-slate-100'}>
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className={`${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'} transition-colors`}>
                        <td className={`px-4 py-3 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>#{booking.id}</td>
                        <td className={`px-4 py-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{booking.property?.title ?? '—'}</div>
                          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{booking.property?.city} • {booking.property?.location}</div>
                        </td>
                        <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{booking.startDate} → {booking.endDate}</td>
                        <td className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>{booking.status}</td>
                        <td className={`px-4 py-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {booking.payment ? (
                            <span className={`font-semibold ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>{formatCurrency(booking.payment.amount)}</span>
                          ) : (
                            <span className={`text-xs ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!recentBookings.length && (
                      <tr>
                        <td colSpan={5} className={`px-4 py-4 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          No bookings recorded yet. Encourage owners to publish listings.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`${isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200 shadow-sm'} rounded-2xl border p-6 sm:p-8 space-y-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Top performing owners</h2>
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Portfolio size and booking traction.</p>
                </div>
                <Link to="/owners" className={`inline-flex items-center justify-center text-sm font-semibold ${isDark ? 'text-emerald-200 hover:text-white' : 'text-emerald-700 hover:text-emerald-900'}`}>
                  Owner workspace →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y text-sm ${isDark ? 'divide-white/5' : 'divide-slate-200'}`}>
                  <thead className={isDark ? 'bg-slate-800/60' : 'bg-slate-100'}>
                    <tr className={`text-left text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Listings</th>
                      <th className="px-4 py-3">Bookings</th>
                    </tr>
                  </thead>
                  <tbody className={isDark ? 'divide-y divide-white/5' : 'divide-y divide-slate-100'}>
                    {ownerLeaderboard.map((entry) => (
                      <tr key={entry.ownerId} className={`${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'} transition-colors`}>
                        <td className={`px-4 py-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{entry.owner.name}</div>
                          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{entry.owner.email}</div>
                        </td>
                        <td className={`px-4 py-3 font-semibold ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>{entry.propertyCount}</td>
                        <td className={`px-4 py-3 font-semibold ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>{entry.bookingCount}</td>
                      </tr>
                    ))}
                    {!ownerLeaderboard.length && (
                      <tr>
                        <td colSpan={3} className={`px-4 py-4 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          No active owners yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`${isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200 shadow-sm'} rounded-2xl border p-6 sm:p-8 space-y-4`}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Latest notifications</h2>
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Stay ahead of disputes, approvals, and escalations.</p>
                  </div>
                  <div className={`text-sm font-semibold ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>Notifications</div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className={`inline-flex rounded-full p-1 text-xs font-semibold ${isDark ? 'bg-slate-800 text-emerald-100' : 'bg-slate-100 text-emerald-800'}`}>
                    {['all', 'unread', 'critical'].map((filterOption) => (
                      <button
                        key={filterOption}
                        type="button"
                        onClick={() => {
                          setNotificationPage(0)
                          setNotificationFilter(filterOption)
                        }}
                        className={`px-3 py-1 rounded-full transition-colors ${
                          notificationFilter === filterOption
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : isDark
                              ? 'text-emerald-100 hover:bg-slate-700'
                              : 'text-emerald-700 hover:bg-white'
                        }`}
                      >
                        {filterOption}
                      </button>
                    ))}
                  </div>
                  <div className={`flex flex-wrap gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {['all', 'financial', 'governance', 'operations', 'system'].map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setNotificationPage(0)
                          setNotificationCategory(category)
                        }}
                        className={`px-3 py-1 rounded-full border transition-colors ${
                          notificationCategory === category
                            ? isDark
                              ? 'border-emerald-400 text-white bg-emerald-500/10'
                              : 'border-emerald-300 text-emerald-800 bg-emerald-50'
                            : isDark
                              ? 'border-white/10 hover:border-emerald-400'
                              : 'border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {notificationFeed.pageItems.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-xl border p-4 shadow-sm flex items-start gap-3 ${isDark ? 'border-white/10 bg-slate-800/80' : 'border-slate-200 bg-white'}`}
                    >
                      <div className={`h-2 w-2 mt-1.5 rounded-full ${item.meta?.isCritical ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</p>
                          <span className={`text-[11px] uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.meta?.category ?? 'general'}</span>
                        </div>
                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{item.message}</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatTimestamp(item.createdAt)}</p>
                      </div>
                      {!item.read && (
                        <button
                          type="button"
                          onClick={() => markAsRead(item.id)}
                          className={`text-xs font-semibold ${isDark ? 'text-emerald-200 hover:underline' : 'text-emerald-700 hover:text-emerald-900'}`}
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  ))}

                  {!notificationFeed.pageItems.length && (
                    <div className={`rounded-xl border border-dashed p-4 text-sm text-center ${isDark ? 'border-white/15 bg-slate-800/60 text-slate-300' : 'border-slate-200 bg-white text-slate-600'}`}>
                      No notifications found for this filter.
                    </div>
                  )}
                </div>

                {notificationFeed.total > NOTIFICATION_PAGE_SIZE && (
                  <div className={`flex items-center justify-between text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span>
                      Page {notificationPage + 1} / {Math.ceil(notificationFeed.total / NOTIFICATION_PAGE_SIZE)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={notificationPage === 0}
                        onClick={() => setNotificationPage((page) => Math.max(0, page - 1))}
                        className={`px-3 py-1 rounded-lg border disabled:opacity-50 ${isDark ? 'border-white/10' : 'border-slate-200'}`}
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        disabled={(notificationPage + 1) * NOTIFICATION_PAGE_SIZE >= notificationFeed.total}
                        onClick={() => setNotificationPage((page) => page + 1)}
                        className={`px-3 py-1 rounded-lg border disabled:opacity-50 ${isDark ? 'border-white/10' : 'border-slate-200'}`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => markAllAsRead('admin')}
                    className={`text-xs font-semibold ${isDark ? 'text-emerald-200 hover:underline' : 'text-emerald-700 hover:text-emerald-900'}`}
                  >
                    Mark all read
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`${isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200 shadow-sm'} rounded-2xl border p-6 space-y-3`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Inbox highlights</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className={`${isDark ? 'bg-slate-800 border-white/10' : 'bg-slate-50 border-slate-200'} rounded-xl border p-3`}>
                  <p className={`text-xs uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Unread</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{notificationStats.unread}</p>
                </div>
                <div className={`${isDark ? 'bg-rose-500/15 border-rose-500/40' : 'bg-rose-50 border-rose-200'} rounded-xl border p-3`}>
                  <p className={`text-xs uppercase tracking-wide ${isDark ? 'text-rose-100' : 'text-rose-700'}`}>Critical</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-rose-100' : 'text-rose-700'}`}>{notificationStats.critical}</p>
                </div>
                <div className={`${isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'} rounded-xl border p-3 col-span-2`}>
                  <p className={`text-xs uppercase tracking-wide ${isDark ? 'text-emerald-100' : 'text-emerald-700'}`}>Categories</p>
                  <div className={`mt-2 grid grid-cols-2 gap-2 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    {Object.entries(notificationStats.categories).map(([category, count]) => (
                      <div key={category} className={`flex items-center justify-between rounded-lg px-3 py-2 ${isDark ? 'bg-slate-800 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-900'}`}>
                        <span className="font-semibold">{category}</span>
                        <span className={`${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={`${isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200 shadow-sm'} rounded-2xl border p-6 space-y-3`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Verification backlog</p>
              <div className={`space-y-2 text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                <div className="flex items-center justify-between">
                  <span>Pending listings</span>
                  <span className={`${isDark ? 'text-amber-200' : 'text-amber-700'} font-semibold`}>{stats.pendingListings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active listings</span>
                  <span className={`${isDark ? 'text-emerald-200' : 'text-emerald-700'} font-semibold`}>{stats.activeListings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total listings</span>
                  <span className={`${isDark ? 'text-white' : 'text-slate-900'} font-semibold`}>{stats.totalProperties}</span>
                </div>
              </div>
              <Link to="/admin/verifications" className={`text-sm font-semibold inline-flex items-center gap-2 ${isDark ? 'text-emerald-200 hover:text-white' : 'text-emerald-700 hover:text-emerald-900'}`}>
                Go to verification queue →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Admin
