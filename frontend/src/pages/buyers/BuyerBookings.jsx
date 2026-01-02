import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMarketplace } from '../../context/MarketplaceContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const statusColors = {
  pending: 'bg-amber-100 text-amber-900 border-amber-200',
  accepted: 'bg-green-100 text-green-800 border-green-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200'
}

const typeLabel = (booking) => booking.bookingType === 'visit' ? 'Visit' : 'Rental'

const BuyerBookings = () => {
  const { bookings, properties } = useMarketplace()
  const { user } = useAuth()

  const buyerId = user?.id || 'BUY-4001'
  const [statusFilter, setStatusFilter] = useState('all')

  const scoped = useMemo(() => bookings.filter((b) => b.userId === buyerId), [bookings, buyerId])

  const enriched = useMemo(() => {
    return scoped.map((booking) => {
      const property = properties.find((p) => p.id === booking.propertyId)
      const bookingType = booking.bookingType || (booking.startDate && booking.endDate ? 'rental' : 'visit')
      return { ...booking, bookingType, property }
    })
  }, [scoped, properties])

  const filtered = useMemo(() => {
    return enriched.filter((booking) => statusFilter === 'all' ? true : booking.status === statusFilter)
  }, [enriched, statusFilter])

  return (
    <div className="bg-amber-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-700">Buyer workspace</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-green-900">My bookings</h1>
              <p className="text-sm text-gray-600">Track your visit and rental requests in one place.</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="border border-amber-200 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </header>

        <div className="page-panel p-6 space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center space-y-3 py-10">
              <p className="text-sm text-gray-600">No bookings yet. Explore properties and schedule your first visit.</p>
              <Link to="/marketplace" className="inline-flex items-center justify-center bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800">
                Browse marketplace
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-amber-100">
              {filtered.map((booking) => (
                <li key={booking.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-amber-100 flex items-center justify-center text-xs font-semibold text-amber-800">
                      {booking.property?.images?.[0] ? (
                        <img src={booking.property.images[0]} alt={booking.property.title} className="h-full w-full object-cover" />
                      ) : (
                        <span>{typeLabel(booking)}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-900">{booking.property?.title || 'Property'}</p>
                      <p className="text-xs text-gray-500">{booking.property?.city} • {booking.property?.location}</p>
                      <p className="text-xs text-gray-500">
                        {booking.bookingType === 'visit'
                          ? `${booking.startDate || booking.endDate} • ${booking.timeSlot || 'Slot TBC'}`
                          : `${booking.startDate} → ${booking.endDate}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${statusColors[booking.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {booking.status}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                      {typeLabel(booking)}
                    </span>
                    <Link
                      to={`/buyer/bookings/${booking.id}`}
                      className="text-sm font-semibold text-green-700 hover:text-green-800"
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default BuyerBookings
