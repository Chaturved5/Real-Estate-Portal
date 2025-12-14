import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMarketplace } from '../../context/MarketplaceContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotifications } from '../../context/NotificationContext.jsx'

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

  const keywordBucket = (text) => {
    if (!text) {
      return ''
    }
    return text
  }

  const haystack = `${keywordBucket(lowered)} ${keywordBucket(messageLowered)}`

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

const MetricCard = ({ label, value, helper, tone = 'default' }) => {
  const palette = {
    default: 'bg-white',
    highlight: 'bg-green-600 text-white',
    warning: 'bg-amber-100'
  }

  return (
    <div className={`${palette[tone] ?? palette.default} rounded-2xl shadow-sm border border-green-100 p-5 sm:p-6 space-y-2`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${tone === 'highlight' ? 'text-white/80' : 'text-green-800'}`}>{label}</p>
      <p className="text-2xl sm:text-3xl font-bold">{value}</p>
      {helper && <p className={`text-xs sm:text-sm ${tone === 'highlight' ? 'text-white/80' : 'text-gray-500'}`}>{helper}</p>}
    </div>
  )
}

const Admin = () => {
  const { user } = useAuth()
  const { properties, bookings, payments, ownersById, agentsById } = useMarketplace()
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

  const agentPipeline = useMemo(() => {
    const map = new Map()
    properties.forEach((property) => {
      if (!property.agentId) {
        return
      }
      if (!map.has(property.agentId)) {
        map.set(property.agentId, { assignments: 0, confirmed: 0, pending: 0 })
      }
      map.get(property.agentId).assignments += 1
    })

    bookings.forEach((booking) => {
      const property = properties.find((entry) => entry.id === booking.propertyId)
      if (!property?.agentId) {
        return
      }
      const statsForAgent = map.get(property.agentId)
      if (!statsForAgent) {
        return
      }
      if (booking.status === 'confirmed') {
        statsForAgent.confirmed += 1
      } else {
        statsForAgent.pending += 1
      }
    })

    return Array.from(map.entries())
      .map(([agentId, metrics]) => ({ agentId, agent: agentsById.get(agentId), ...metrics }))
      .filter((entry) => entry.agent)
      .sort((a, b) => b.confirmed - a.confirmed)
      .slice(0, 5)
  }, [agentsById, bookings, properties])

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
      if (notificationFilter === 'unread') {
        if (item.read) {
          return false
        }
      }
      if (notificationFilter === 'critical') {
        if (!item.meta.isCritical) {
          return false
        }
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
    <div className="bg-amber-50 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-700">Admin Control Center</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-green-900">Platform performance overview</h1>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
                Monitor portfolio health, review approvals, and stay ahead of compliance or dispute escalations in one place.
              </p>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center justify-center px-5 py-2 rounded-lg border border-green-200 text-green-700 text-sm font-semibold hover:bg-green-50 transition-colors"
            >
              Manage admin profile
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total listings" value={stats.totalProperties} helper="Across residential & commercial" />
          <MetricCard label="Active inventory" value={stats.activeListings} helper="Listings available for booking" />
          <MetricCard label="Occupancy ratio" value={`${stats.occupancyRate}%`} helper="Confirmed bookings vs inventory" />
          <MetricCard label="Revenue captured" value={formatCurrency(stats.revenue)} helper="Payments processed to date" tone="highlight" />
          <MetricCard label="Notifications" value={notificationStats.total} helper={`${notificationStats.unread} unread • ${notificationStats.critical} critical`} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr),320px]">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-green-900">Recent booking activity</h2>
                  <p className="text-sm text-gray-600">Track the latest reservations and ensure payments are flowing.</p>
                </div>
                <Link to="/marketplace" className="inline-flex items-center justify-center text-sm font-semibold text-green-700 hover:underline">
                  View marketplace →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-amber-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-green-800">
                      <th className="px-4 py-3">Booking</th>
                      <th className="px-4 py-3">Property</th>
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-amber-50/60 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">#{booking.id}</td>
                        <td className="px-4 py-3 text-gray-700">
                          <div className="font-semibold text-green-900">{booking.property?.title ?? '—'}</div>
                          <div className="text-xs text-gray-500">{booking.property?.city} • {booking.property?.location}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{booking.startDate} → {booking.endDate}</td>
                        <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-green-700">{booking.status}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {booking.payment ? (
                            <span className="font-semibold text-green-800">{formatCurrency(booking.payment.amount)}</span>
                          ) : (
                            <span className="text-xs text-amber-700">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!recentBookings.length && (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">
                          No bookings recorded yet. Encourage owners to publish listings or run campaigns.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-green-900">Top performing owners</h2>
                  <p className="text-sm text-gray-600">Portfolio size and booking traction by owner.</p>
                </div>
                <Link to="/owners" className="inline-flex items-center justify-center text-sm font-semibold text-green-700 hover:underline">
                  Owner workspace →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-amber-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-green-800">
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Listings</th>
                      <th className="px-4 py-3">Bookings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ownerLeaderboard.map((entry) => (
                      <tr key={entry.ownerId} className="hover:bg-amber-50/60 transition-colors">
                        <td className="px-4 py-3 text-gray-700">
                          <div className="font-semibold text-green-900">{entry.owner.name}</div>
                          <div className="text-xs text-gray-500">{entry.owner.email}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-800">{entry.propertyCount}</td>
                        <td className="px-4 py-3 font-semibold text-green-800">{entry.bookingCount}</td>
                      </tr>
                    ))}
                    {!ownerLeaderboard.length && (
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-center text-sm text-gray-500">
                          No active owners yet. Approve onboarding requests to populate this view.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 sm:p-8 space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-green-900">Latest notifications</h2>
                    <p className="text-sm text-gray-600">Stay ahead of disputes, approvals, and escalations.</p>
                  </div>
                  <Link to="/profile" className="inline-flex items-center justify-center text-sm font-semibold text-green-700 hover:underline">
                    Notification settings →
                  </Link>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="inline-flex rounded-full bg-amber-50 p-1 text-xs font-semibold text-green-800">
                    {['all', 'unread', 'critical'].map((filterOption) => (
                      <button
                        key={filterOption}
                        type="button"
                        onClick={() => {
                          setNotificationPage(0)
                          setNotificationFilter(filterOption)
                        }}
                        className={`px-3 py-1 rounded-full transition-colors ${
                          notificationFilter === filterOption ? 'bg-green-600 text-white shadow-sm' : 'text-green-700 hover:bg-amber-100'
                        }`}
                      >
                        {filterOption === 'all' && `All ${notificationStats.total}`}
                        {filterOption === 'unread' && `Unread ${notificationStats.unread}`}
                        {filterOption === 'critical' && `Critical ${notificationStats.critical}`}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <select
                      value={notificationCategory}
                      onChange={(event) => {
                        setNotificationCategory(event.target.value)
                        setNotificationPage(0)
                      }}
                      className="text-xs font-semibold text-green-800 border border-amber-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="all">All categories</option>
                      <option value="operations">Operations ({notificationStats.categories.operations})</option>
                      <option value="financial">Financial ({notificationStats.categories.financial})</option>
                      <option value="governance">Governance ({notificationStats.categories.governance})</option>
                      <option value="system">System ({notificationStats.categories.system})</option>
                      <option value="general">General ({notificationStats.categories.general})</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => markAllAsRead('admin')}
                      className="self-start sm:self-auto inline-flex items-center justify-center text-xs font-semibold text-green-700 hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              </div>

              <ul className="space-y-3">
                {notificationFeed.pageItems.map((notification) => (
                  <li
                    key={notification.id}
                    className={`border border-amber-100 rounded-2xl p-4 sm:p-5 bg-white/60 ${notification.read ? '' : 'shadow-[0_8px_24px_-12px_rgba(22,101,52,0.35)]'}`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-green-900">{notification.title}</p>
                          <p className="text-xs text-gray-500">{formatTimestamp(notification.createdAt)}</p>
                        </div>
                        {!notification.read && (
                          <span className="inline-flex items-center rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{notification.message}</p>
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-wide font-semibold text-green-700">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
                          {notification.meta.category}
                        </span>
                        {notification.meta.isCritical && <span className="text-amber-700">Critical</span>}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        {notification.action ? (
                          <Link to={notification.action} className="text-green-700 font-semibold hover:underline">
                            Review action →
                          </Link>
                        ) : (
                          <span>—</span>
                        )}
                        {!notification.read ? (
                          <button
                            type="button"
                            onClick={() => markAsRead(notification.id)}
                            className="text-green-700 font-semibold hover:underline"
                          >
                            Mark as read
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-semibold">Acknowledged</span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
                {!notificationFeed.pageItems.length && (
                  <li className="text-sm text-gray-500">No alerts in your queue. Great job keeping operations tidy!</li>
                )}
              </ul>

              {notificationFeed.total > NOTIFICATION_PAGE_SIZE && (
                <div className="flex items-center justify-between pt-2 text-xs text-green-800">
                  <span>
                    Page {notificationPage + 1} of {Math.ceil(notificationFeed.total / NOTIFICATION_PAGE_SIZE)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNotificationPage((current) => Math.max(0, current - 1))}
                      disabled={notificationPage === 0}
                      className={`px-3 py-1 rounded-lg border border-amber-200 ${notificationPage === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-green-700 hover:bg-amber-100'}`}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNotificationPage((current) => {
                          const maxPage = Math.ceil(notificationFeed.total / NOTIFICATION_PAGE_SIZE) - 1
                          return Math.min(maxPage, current + 1)
                        })
                      }
                      disabled={(notificationPage + 1) * NOTIFICATION_PAGE_SIZE >= notificationFeed.total}
                      className={`px-3 py-1 rounded-lg border border-amber-200 ${(notificationPage + 1) * NOTIFICATION_PAGE_SIZE >= notificationFeed.total ? 'text-gray-400 cursor-not-allowed' : 'text-green-700 hover:bg-amber-100'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-green-900">Inventory distribution</h2>
              <ul className="space-y-3 text-sm text-gray-700">
                {stats.citySpread.map((item) => (
                  <li key={item.city} className="flex items-center justify-between">
                    <span>{item.city}</span>
                    <span className="font-semibold text-green-800">{item.count}</span>
                  </li>
                ))}
                {!stats.citySpread.length && (
                  <li className="text-sm text-gray-500">No listings yet. Imported properties will appear here by city.</li>
                )}
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-green-900">Broker pipeline</h2>
              <ul className="space-y-3 text-sm text-gray-700">
                {agentPipeline.map((entry) => (
                  <li key={entry.agentId} className="border border-amber-100 rounded-xl p-3 flex flex-col gap-1">
                    <div className="font-semibold text-green-900">{entry.agent.name}</div>
                    <div className="text-xs text-gray-500">{entry.agent.email}</div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Assignments</span>
                      <span className="font-semibold text-green-800">{entry.assignments}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Confirmed deals</span>
                      <span className="font-semibold text-green-800">{entry.confirmed}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>In pipeline</span>
                      <span className="font-semibold text-green-800">{entry.pending}</span>
                    </div>
                  </li>
                ))}
                {!agentPipeline.length && (
                  <li className="text-sm text-gray-500">Broker activity will surface once listings have assigned agents.</li>
                )}
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 space-y-3">
              <h2 className="text-lg font-semibold text-green-900">Operational priorities</h2>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Review pending listings and expedite approvals.</li>
                <li>• Audit payouts and schedule monthly reconciliations.</li>
                <li>• Configure dispute SLAs and escalation matrix.</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </div>
  )
}

export default Admin
