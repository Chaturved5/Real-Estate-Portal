import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMarketplace } from '../../context/MarketplaceContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const formatDateRange = (booking) => {
  if (booking.bookingType === 'visit') {
    return `${booking.startDate || booking.endDate} • ${booking.timeSlot || 'Slot TBC'}`
  }
  return `${booking.startDate} → ${booking.endDate}`
}

const badgeColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-900 border-amber-200'
    case 'confirmed':
    case 'accepted':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'cancelled':
      return 'bg-slate-100 text-slate-700 border-slate-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

const BuyerBookingDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { bookings, properties, updateBooking } = useMarketplace()
  const { user } = useAuth()

  const buyerId = user?.id || 'BUY-4001'

  const booking = useMemo(() => {
    const found = bookings.find((entry) => entry.id === id)
    if (!found) return null
    const bookingType = found.bookingType || (found.startDate && found.endDate ? 'rental' : 'visit')
    return { ...found, bookingType }
  }, [bookings, id])

  const property = useMemo(() => properties.find((p) => p.id === booking?.propertyId), [properties, booking])

  if (!booking || booking.userId !== buyerId) {
    return (
      <div className="bg-amber-50 min-h-screen flex items-center justify-center px-4">
        <div className="bg-white border border-amber-100 rounded-xl p-6 text-center space-y-3">
          <p className="text-sm text-gray-600">Booking not found.</p>
          <Link to="/buyer/bookings" className="text-sm font-semibold text-green-700">Back to bookings</Link>
        </div>
      </div>
    )
  }

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking request?')) return
    await updateBooking(booking.id, { status: 'cancelled' })
    navigate('/buyer/bookings')
  }

  return (
    <div className="bg-amber-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center gap-3 text-sm text-green-700">
          <Link to="/buyer/bookings" className="hover:underline">← Back to bookings</Link>
        </div>

        <div className="page-panel p-6 space-y-6">
          <header className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${badgeColor(booking.status)}`}>
                {booking.status}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                {booking.bookingType === 'visit' ? 'Visit' : 'Rental'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-green-900">Booking #{booking.id}</h1>
            <p className="text-sm text-gray-600">{formatDateRange(booking)}</p>
          </header>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-900">Property</p>
              <p className="text-sm font-semibold text-green-900">{property?.title || 'Property'}</p>
              <p className="text-xs text-gray-500">{property?.city} • {property?.location}</p>
              {property?.images?.[0] && (
                <img src={property.images[0]} alt={property.title} className="mt-2 h-32 w-full object-cover rounded-lg" />
              )}
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-900">Details</p>
              <p className="text-sm text-gray-700">Status: {booking.status}</p>
              {booking.notes && <p className="text-sm text-gray-700">Your note: {booking.notes}</p>}
              {booking.timeSlot && <p className="text-sm text-gray-700">Time slot: {booking.timeSlot}</p>}
              {booking.amount ? <p className="text-sm text-gray-700">Deposit/Amount: ₹{Number(booking.amount).toLocaleString('en-IN')}</p> : null}
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            {booking.status === 'pending' && (
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-amber-200 text-amber-800 text-sm font-semibold bg-white hover:bg-amber-50"
              >
                Cancel request
              </button>
            )}
            <Link
              to="/marketplace"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800"
            >
              Continue browsing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuyerBookingDetail
