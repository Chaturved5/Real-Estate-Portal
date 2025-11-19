import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useMarketplace } from "../context/MarketplaceContext.jsx"

const formatCurrency = (value) => `₹${value.toLocaleString("en-IN")}`
const formatPriceCr = (value) => `₹${(value / 10000000).toFixed(2)} Cr`

const MetricCard = ({ label, value, helper, tone = "default" }) => {
  const palette = {
    default: "bg-white",
    highlight: "bg-green-600 text-white",
    warning: "bg-amber-100"
  }

  return (
    <div className={`${palette[tone] ?? palette.default} rounded-2xl shadow-sm p-5 sm:p-6 space-y-2`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${tone === "highlight" ? "text-white/80" : "text-green-800"}`}>{label}</p>
      <p className="text-2xl sm:text-3xl font-bold">{value}</p>
      {helper && <p className={`text-xs sm:text-sm ${tone === "highlight" ? "text-white/80" : "text-gray-500"}`}>{helper}</p>}
    </div>
  )
}

const Owners = () => {
  const { properties, bookings, payments, ownersById, agentsById } = useMarketplace()

  const ownerRoster = useMemo(() => {
    const entries = Array.from(ownersById.values())
      .map((owner) => ({
        ...owner,
        totalListings: properties.filter((property) => property.ownerId === owner.id).length
      }))
      .filter((owner) => owner.totalListings > 0)
    return entries.sort((a, b) => a.name.localeCompare(b.name))
  }, [ownersById, properties])

  const [selectedOwnerId, setSelectedOwnerId] = useState(() => ownerRoster[0]?.id ?? "")

  const selectedOwner = useMemo(
    () => ownerRoster.find((owner) => owner.id === selectedOwnerId) ?? ownerRoster[0],
    [ownerRoster, selectedOwnerId]
  )

  const { ownerProperties, ownerPropertyIds } = useMemo(() => {
    if (!selectedOwner) {
      return { ownerProperties: [], ownerPropertyIds: new Set() }
    }
    const listingSet = properties.filter((property) => property.ownerId === selectedOwner.id)
    return { ownerProperties: listingSet, ownerPropertyIds: new Set(listingSet.map((property) => property.id)) }
  }, [properties, selectedOwner])

  const { ownerBookings, ownerBookingIds } = useMemo(() => {
    const scopedBookings = bookings.filter((booking) => ownerPropertyIds.has(booking.propertyId))
    return { ownerBookings: scopedBookings, ownerBookingIds: new Set(scopedBookings.map((booking) => booking.id)) }
  }, [bookings, ownerPropertyIds])

  const ownerPayments = useMemo(
    () => payments.filter((payment) => ownerBookingIds.has(payment.bookingId)),
    [payments, ownerBookingIds]
  )

  const totalRevenue = ownerPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const averageListingRating = ownerProperties.length
    ? (ownerProperties.reduce((accumulator, property) => accumulator + property.rating, 0) / ownerProperties.length).toFixed(1)
    : "—"

  const agentPartners = useMemo(() => {
    const ids = new Set(ownerProperties.map((property) => property.agentId).filter(Boolean))
    return Array.from(ids)
      .map((agentId) => agentsById.get(agentId))
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [agentsById, ownerProperties])

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const upcomingBookings = useMemo(
    () =>
      ownerBookings
        .filter((booking) => booking.startDate >= today)
        .sort((a, b) => (a.startDate < b.startDate ? -1 : 1))
        .slice(0, 5),
    [ownerBookings, today]
  )

  const revenueHighlights = useMemo(() => ownerPayments.slice(0, 5), [ownerPayments])

  if (!ownerRoster.length) {
    return (
      <div className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="page-panel text-center space-y-4 p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-green-900">Owner Workspace</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Add your first property listing to unlock the owner dashboard with booking metrics, earnings insights, and agent collaboration tools.
            </p>
            <div>
              <Link
                to="/owners/create-listing"
                className="inline-flex items-center justify-center bg-green-700 text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors"
              >
                + Create Listing
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="page-panel p-6 sm:p-8 lg:p-10 space-y-8">
        <header className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700">Owner Workspace</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-green-900">Manage Listings & Earnings</h1>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
                Monitor listing performance, track bookings, and collaborate with verified brokers. Select an owner profile to view tailored insights.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 w-full sm:w-auto">
              <label className="block text-xs font-semibold uppercase tracking-wide text-green-900 mb-2" htmlFor="owner-selector">
                Switch Owner Profile
              </label>
              <select
                id="owner-selector"
                value={selectedOwner?.id ?? ""}
                onChange={(event) => setSelectedOwnerId(event.target.value)}
                className="w-full sm:w-64 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                {ownerRoster.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} • {owner.totalListings} listings
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Active Listings"
            value={ownerProperties.length || "0"}
            helper="Across residential and commercial portfolios"
          />
          <MetricCard
            label="Upcoming Bookings"
            value={upcomingBookings.length || "0"}
            helper="Confirmed check-ins on the calendar"
          />
          <MetricCard
            label="Average Listing Rating"
            value={averageListingRating}
            helper="Aggregate review score across published listings"
          />
          <MetricCard
            label="Lifetime Revenue"
            tone="highlight"
            value={formatCurrency(totalRevenue)}
            helper="Payments captured via EstatePortal"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr),320px]">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-green-900">Portfolio Overview</h2>
                  <p className="text-sm text-gray-500">Snapshot of every property currently managed under {selectedOwner?.name || "this owner"}.</p>
                </div>
                <Link
                  to="/owners/create-listing"
                  className="inline-flex items-center justify-center bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
                >
                  + Add Listing
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-amber-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-green-800">
                      <th className="px-4 py-3">Property</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Rating</th>
                      <th className="px-4 py-3">Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ownerProperties.map((property) => {
                      const agent = property.agentId ? agentsById.get(property.agentId) : null
                      return (
                        <tr key={property.id} className="hover:bg-amber-50/60 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{property.title}</div>
                            <div className="text-xs text-gray-500">{property.city} • {property.location}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 uppercase text-xs">{property.type}</td>
                          <td className="px-4 py-3 text-gray-700">{formatPriceCr(property.price)}</td>
                          <td className="px-4 py-3 text-gray-700">⭐ {property.rating.toFixed(1)}</td>
                          <td className="px-4 py-3 text-gray-700">{agent ? agent.name : "—"}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-green-900">Upcoming Check-ins</h2>
                  <p className="text-sm text-gray-500">Stay ahead of coordination and guest experiences.</p>
                </div>
                <Link
                  to="/owners/bookings"
                  className="inline-flex items-center justify-center border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
                >
                  View All Bookings
                </Link>
              </div>

              {upcomingBookings.length ? (
                <ul className="space-y-4 text-sm text-gray-700">
                  {upcomingBookings.map((booking) => {
                    const property = ownerProperties.find((entry) => entry.id === booking.propertyId)
                    return (
                      <li key={booking.id} className="border border-amber-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="font-semibold text-green-900">{property?.title ?? "Property"}</p>
                          <p className="text-xs text-gray-500">Booking #{booking.id} • {booking.startDate} → {booking.endDate}</p>
                        </div>
                        <div className="text-sm font-medium text-green-700">{formatCurrency(booking.amount)}</div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 bg-amber-50 rounded-xl p-4 text-center">
                  No upcoming bookings. Promote your listings or engage brokers to boost occupancy.
                </p>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-green-900">Revenue Activity</h2>
              {ownerPayments.length ? (
                <ul className="space-y-3 text-sm text-gray-700">
                  {revenueHighlights.map((payment) => {
                    const booking = ownerBookings.find((entry) => entry.id === payment.bookingId)
                    const property = ownerProperties.find((entry) => entry.id === booking?.propertyId)
                    return (
                      <li key={payment.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{property?.title ?? "Booking"}</p>
                          <p className="text-xs text-gray-500">Payment #{payment.id} • {payment.status}</p>
                        </div>
                        <span className="font-semibold text-green-700">{formatCurrency(payment.amount)}</span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Payments will surface here once bookings are captured.</p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-green-900">Broker & Agent Partners</h2>
              {agentPartners.length ? (
                <ul className="space-y-3 text-sm text-gray-700">
                  {agentPartners.map((agent) => (
                    <li key={agent.id} className="flex flex-col">
                      <span className="font-medium text-gray-900">{agent.name}</span>
                      <span className="text-xs text-gray-500">{agent.email} • {agent.phone}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No partner agents linked yet. Invite a verified broker to scale outreach.</p>
              )}
              <Link
                to="/brokers"
                className="inline-flex items-center justify-center border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
              >
                Browse Verified Brokers
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
              <h2 className="text-lg font-semibold text-green-900">Recommended Actions</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Upload new media galleries to keep listings fresh.</li>
                <li>• Enable virtual tour links for premium buyers.</li>
                <li>• Configure payout preferences before month end.</li>
              </ul>
            </div>
          </aside>
        </section>
        </div>
      </div>
    </div>
  )
}

export default Owners
