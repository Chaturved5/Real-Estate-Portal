import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useMarketplace } from "../../context/MarketplaceContext.jsx"

const COMMISSION_RATE = 0.025

const formatCurrency = (value) => `₹${value.toLocaleString("en-IN")}`
const formatPriceCr = (value) => `₹${(value / 10000000).toFixed(2)} Cr`

const MetricCard = ({ label, value, helper }) => (
  <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 space-y-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-green-800">{label}</p>
    <p className="text-2xl sm:text-3xl font-bold text-green-900">{value}</p>
    {helper && <p className="text-xs sm:text-sm text-gray-500">{helper}</p>}
  </div>
)

const Brokers = () => {
  const { properties, bookings, payments, agentsById, ownersById } = useMarketplace()

  const agentRoster = useMemo(() => {
    const entries = Array.from(agentsById.values()).map((agent) => ({
      ...agent,
      totalListings: properties.filter((property) => property.agentId === agent.id).length
    }))

    return entries.sort((a, b) => b.totalListings - a.totalListings)
  }, [agentsById, properties])

  const [selectedAgentId, setSelectedAgentId] = useState(() => agentRoster[0]?.id ?? "")

  const selectedAgent = useMemo(
    () => agentRoster.find((agent) => agent.id === selectedAgentId) ?? agentRoster[0],
    [agentRoster, selectedAgentId]
  )

  const assignedListings = useMemo(
    () => (selectedAgent ? properties.filter((property) => property.agentId === selectedAgent.id) : []),
    [properties, selectedAgent]
  )

  const assignedPropertyIds = useMemo(() => new Set(assignedListings.map((property) => property.id)), [assignedListings])

  const agentBookings = useMemo(
    () => bookings.filter((booking) => assignedPropertyIds.has(booking.propertyId)),
    [bookings, assignedPropertyIds]
  )

  const confirmedBookings = agentBookings.filter((booking) => booking.status === "confirmed")
  const pendingBookings = agentBookings.filter((booking) => booking.status !== "confirmed")

  const agentPayments = useMemo(
    () => payments.filter((payment) => agentBookings.some((booking) => booking.id === payment.bookingId)),
    [payments, agentBookings]
  )

  const commissionEarned = agentPayments.reduce((sum, payment) => sum + payment.amount * COMMISSION_RATE, 0)
  const pipelineValue = pendingBookings.reduce((sum, booking) => sum + booking.amount, 0)

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const upcomingTours = useMemo(
    () =>
      agentBookings
        .filter((booking) => booking.startDate >= today)
        .sort((a, b) => (a.startDate < b.startDate ? -1 : 1))
        .slice(0, 5),
    [agentBookings, today]
  )

  const ownerPartners = useMemo(() => {
    const ownerIds = new Set(assignedListings.map((property) => property.ownerId))
    return Array.from(ownerIds)
      .map((ownerId) => ownersById.get(ownerId))
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [assignedListings, ownersById])

  if (!agentRoster.length) {
    return (
      <div className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="page-panel text-center space-y-4 p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-green-900">Broker / Agent Hub</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Onboard your first broker to view performance metrics, commission summaries, and collaborative tools.
            </p>
            <Link
              to="/brokers/invite"
              className="inline-flex items-center justify-center bg-green-700 text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors"
            >
              Invite Broker
            </Link>
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700">Broker / Agent Hub</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-green-900">Coordinate Listings & Deals</h1>
              <p className="text-sm sm:text-base text-gray-600 max-w-3xl">
                Track assigned portfolios, monitor tour schedules, and view commission-ready payments. Choose an agent to load their workspace.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 w-full sm:w-auto">
              <label className="block text-xs font-semibold uppercase tracking-wide text-green-900 mb-2" htmlFor="broker-selector">
                Switch Agent
              </label>
              <select
                id="broker-selector"
                value={selectedAgent?.id ?? ""}
                onChange={(event) => setSelectedAgentId(event.target.value)}
                className="w-full sm:w-64 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                {agentRoster.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} • {agent.totalListings} listings
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Assigned Listings"
            value={assignedListings.length || "0"}
            helper="Across residential and commercial inventory"
          />
          <MetricCard
            label="Confirmed Bookings"
            value={confirmedBookings.length || "0"}
            helper="Check-ins attributed to this agent"
          />
          <MetricCard
            label="Open Pipeline"
            value={pendingBookings.length || "0"}
            helper={`₹${pipelineValue.toLocaleString("en-IN") || "0"} expected receipts`}
          />
          <MetricCard
            label="Commission Earned"
            value={formatCurrency(Math.round(commissionEarned))}
            helper={`@ ${(COMMISSION_RATE * 100).toFixed(1)}% on captured payments`}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr),320px]">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-green-900">Portfolio Assignments</h2>
                  <p className="text-sm text-gray-500">Listings currently represented by {selectedAgent?.name || "this agent"}.</p>
                </div>
                <Link
                  to="/owners"
                  className="inline-flex items-center justify-center border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
                >
                  View Owner Workspace
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-amber-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-green-800">
                      <th className="px-4 py-3">Property</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {assignedListings.map((property) => {
                      const owner = ownersById.get(property.ownerId)
                      return (
                        <tr key={property.id} className="hover:bg-amber-50/60 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{property.title}</div>
                            <div className="text-xs text-gray-500">{property.city} • {property.location}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 uppercase text-xs">{property.type}</td>
                          <td className="px-4 py-3 text-gray-700">{formatPriceCr(property.price)}</td>
                          <td className="px-4 py-3 text-gray-700">{owner ? owner.name : "—"}</td>
                          <td className="px-4 py-3 text-gray-700">⭐ {property.rating.toFixed(1)}</td>
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
                  <h2 className="text-xl font-semibold text-green-900">Tour & Booking Schedule</h2>
                  <p className="text-sm text-gray-500">Keep buyers engaged and ensure smooth handovers.</p>
                </div>
                <Link
                  to="/broker/calendar"
                  className="inline-flex items-center justify-center bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
                >
                  Open Calendar
                </Link>
              </div>

              {upcomingTours.length ? (
                <ul className="space-y-4 text-sm text-gray-700">
                  {upcomingTours.map((booking) => {
                    const property = assignedListings.find((entry) => entry.id === booking.propertyId)
                    return (
                      <li key={booking.id} className="border border-amber-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="font-semibold text-green-900">{property?.title ?? "Property"}</p>
                          <p className="text-xs text-gray-500">Booking #{booking.id} • {booking.startDate} → {booking.endDate}</p>
                        </div>
                        <div className="text-xs font-semibold text-green-700 uppercase tracking-wide">{booking.status}</div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 bg-amber-50 rounded-xl p-4 text-center">
                  No scheduled tours. Line up buyer visits or follow up on pending enquiries.
                </p>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-green-900">Commission Tracker</h2>
              {agentPayments.length ? (
                <ul className="space-y-3 text-sm text-gray-700">
                  {agentPayments.slice(0, 5).map((payment) => {
                    const booking = agentBookings.find((entry) => entry.id === payment.bookingId)
                    const property = assignedListings.find((entry) => entry.id === booking?.propertyId)
                    const commission = payment.amount * COMMISSION_RATE
                    return (
                      <li key={payment.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{property?.title ?? "Booking"}</p>
                          <p className="text-xs text-gray-500">Payment #{payment.id} • {payment.status}</p>
                        </div>
                        <span className="font-semibold text-green-700">{formatCurrency(Math.round(commission))}</span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Commission will populate once payments are captured.</p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-green-900">Owner Partnerships</h2>
              {ownerPartners.length ? (
                <ul className="space-y-3 text-sm text-gray-700">
                  {ownerPartners.map((owner) => (
                    <li key={owner.id} className="flex flex-col">
                      <span className="font-medium text-gray-900">{owner.name}</span>
                      <span className="text-xs text-gray-500">{owner.email}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No owner relationships linked yet. Connect with property owners to gain listing inventory.</p>
              )}
              <Link
                to="/owners"
                className="inline-flex items-center justify-center border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
              >
                Explore Owner Listings
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
              <h2 className="text-lg font-semibold text-green-900">Recommended Actions</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Share new market insights with active buyers.</li>
                <li>• Coordinate 360° tour shoots for marquee listings.</li>
                <li>• Review pending enquiries within 12 hours.</li>
              </ul>
            </div>
          </aside>
        </section>
        </div>
      </div>
    </div>
  )
}

export default Brokers
