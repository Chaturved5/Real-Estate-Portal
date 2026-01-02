import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useMarketplace } from '../context/MarketplaceContext.jsx'

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const { properties, bookings, payments } = useMarketplace()

  const [profileForm, setProfileForm] = useState({ name: '', phone: '', company: '', bio: '' })
  const [profileStatus, setProfileStatus] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordStatus, setPasswordStatus] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        company: user.company || '',
        bio: user.bio || ''
      })
    }
  }, [user])

  const ownerInsights = useMemo(() => {
    if (!user || user.role !== 'owner') {
      return null
    }
    const ownedProperties = properties.filter((property) => property.ownerId === user.id)
    const ownedPropertyIds = new Set(ownedProperties.map((property) => property.id))
    const ownedBookings = bookings.filter((booking) => ownedPropertyIds.has(booking.propertyId))
    const ownedBookingIds = new Set(ownedBookings.map((booking) => booking.id))
    const ownedPayments = payments.filter((payment) => ownedBookingIds.has(payment.bookingId))

    const totalRevenue = ownedPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const upcomingBookings = ownedBookings.filter((booking) => booking.startDate >= new Date().toISOString().slice(0, 10))

    return {
      totalProperties: ownedProperties.length,
      totalBookings: ownedBookings.length,
      upcomingBookings: upcomingBookings.length,
      revenue: totalRevenue
    }
  }, [bookings, payments, properties, user])

  const agentInsights = useMemo(() => {
    if (!user || user.role !== 'agent') {
      return null
    }
    const assignedProperties = properties.filter((property) => property.agentId === user.id)
    const assignedPropertyIds = new Set(assignedProperties.map((property) => property.id))
    const assignedBookings = bookings.filter((booking) => assignedPropertyIds.has(booking.propertyId))

    return {
      assignedCount: assignedProperties.length,
      activeDeals: assignedBookings.filter((booking) => booking.status === 'pending').length,
      confirmedDeals: assignedBookings.filter((booking) => booking.status === 'confirmed').length
    }
  }, [bookings, properties, user])

  const buyerInsights = useMemo(() => {
    if (!user || user.role !== 'buyer') {
      return null
    }
    const myBookings = bookings.filter((booking) => booking.userId === user.id)
    const paidBookingIds = new Set(payments.filter((payment) => payment.status === 'captured').map((payment) => payment.bookingId))

    return {
      totalBookings: myBookings.length,
      confirmed: myBookings.filter((booking) => booking.status === 'confirmed').length,
      pendingPayments: myBookings.filter((booking) => !paidBookingIds.has(booking.id)).length
    }
  }, [bookings, payments, user])

  const adminInsights = useMemo(() => {
    if (!user || user.role !== 'admin') {
      return null
    }
    return {
      properties: properties.length,
      bookings: bookings.length,
      payments: payments.length
    }
  }, [bookings, payments, properties, user])

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setProfileStatus('')
    setProfileError('')

    if (!profileForm.name.trim()) {
      setProfileError('Name is required to continue.')
      return
    }

    setProfileSaving(true)
    try {
      await updateProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        company: profileForm.company.trim(),
        bio: profileForm.bio.trim()
      })
      setProfileStatus('Profile updated successfully.')
    } catch (error) {
      setProfileError(error.message)
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setPasswordStatus('')
    setPasswordError('')

    if (!passwordForm.currentPassword.trim() || !passwordForm.newPassword.trim()) {
      setPasswordError('Please provide your current and new password.')
      return
    }

    if (passwordForm.newPassword.trim().length < 8) {
      setPasswordError('New password must be at least 8 characters long.')
      return
    }

    if (passwordForm.newPassword.trim() !== passwordForm.confirmPassword.trim()) {
      setPasswordError('New passwords do not match.')
      return
    }

    setPasswordSaving(true)
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword.trim(),
        newPassword: passwordForm.newPassword.trim()
      })
      setPasswordStatus('Password updated successfully.')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setPasswordError(error.message)
    } finally {
      setPasswordSaving(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="bg-amber-50 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 sm:p-8 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-700">Account Profile</p>
            <h1 className="text-3xl font-bold text-green-900">Manage your identity</h1>
            <p className="text-sm text-gray-600 max-w-xl">
              Keep your contact details current so clients, partners, and platform notifications reach you instantly.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 space-y-1 w-full sm:w-72">
            <p className="font-semibold text-green-900">Current role</p>
            <p className="text-xs uppercase tracking-wide text-green-700">{user.role}</p>
            <p className="text-xs text-gray-600 break-all">{user.email}</p>
            {user.role !== 'admin' && (
              <Link
                to="/verification"
                className="inline-flex items-center justify-center mt-2 w-full rounded-lg bg-green-600 text-white text-xs font-semibold px-3 py-2 hover:bg-green-700"
              >
                Complete profile & KYC
              </Link>
            )}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr),320px]">
          <div className="space-y-6">
            <form className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 sm:p-8 space-y-5" onSubmit={handleProfileSubmit} noValidate>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-xl font-semibold text-green-900">Personal details</h2>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-colors disabled:opacity-60"
                >
                  {profileSaving ? 'Saving…' : 'Save changes'}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-green-900" htmlFor="name">
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={profileForm.name}
                    onChange={(event) => setProfileForm((previous) => ({ ...previous, name: event.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="Your display name"
                    disabled={profileSaving}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-green-900" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-100 text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-green-900" htmlFor="phone">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={profileForm.phone}
                    onChange={(event) => setProfileForm((previous) => ({ ...previous, phone: event.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="Contact number"
                    disabled={profileSaving}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-green-900" htmlFor="company">
                    Organisation
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={profileForm.company}
                    onChange={(event) => setProfileForm((previous) => ({ ...previous, company: event.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="Company or team"
                    disabled={profileSaving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-green-900" htmlFor="bio">
                  Bio / introduction
                </label>
                <textarea
                  id="bio"
                  value={profileForm.bio}
                  onChange={(event) => setProfileForm((previous) => ({ ...previous, bio: event.target.value.slice(0, 400) }))}
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Describe your focus areas, achievements, or expectations."
                  disabled={profileSaving}
                />
                <p className="text-xs text-gray-500">Visible on partner workflows and owner/buyer dashboards.</p>
              </div>

              {profileError && <p className="text-sm text-amber-700 bg-amber-100 border border-amber-200 rounded-lg px-3 py-2">{profileError}</p>}
              {profileStatus && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{profileStatus}</p>}
            </form>

            <form className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 sm:p-8 space-y-4" onSubmit={handlePasswordSubmit} noValidate>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-green-900">Security</h2>
                  <p className="text-sm text-gray-600">Update your password regularly to keep your workspace secure.</p>
                </div>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="inline-flex items-center justify-center px-5 py-2 rounded-lg border border-green-200 text-green-700 text-sm font-semibold hover:bg-green-50 transition-colors disabled:opacity-60"
                >
                  {passwordSaving ? 'Updating…' : 'Update password'}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-green-900" htmlFor="current-password">
                    Current password
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) => setPasswordForm((previous) => ({ ...previous, currentPassword: event.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="Enter current password"
                    disabled={passwordSaving}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-green-900" htmlFor="new-password">
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) => setPasswordForm((previous) => ({ ...previous, newPassword: event.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="Minimum 8 characters"
                    disabled={passwordSaving}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-green-900" htmlFor="confirm-password">
                    Confirm new password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm((previous) => ({ ...previous, confirmPassword: event.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="Re-enter new password"
                    disabled={passwordSaving}
                  />
                </div>
              </div>

              {passwordError && <p className="text-sm text-amber-700 bg-amber-100 border border-amber-200 rounded-lg px-3 py-2">{passwordError}</p>}
              {passwordStatus && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{passwordStatus}</p>}
            </form>
          </div>

          <aside className="space-y-6">
            {user.role !== 'admin' && (
              <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-green-900">Verification & KYC</h2>
                <p className="text-sm text-gray-600">Finish KYC to unlock bookings (buyers) or publishing/assignment (owners/agents).</p>
                <div className="flex flex-col gap-2 text-sm">
                  <Link to="/verification" className="inline-flex items-center justify-center rounded-lg bg-green-600 text-white px-4 py-2 font-semibold shadow-sm hover:bg-green-700">
                    Go to verification center
                  </Link>
                  <Link to="/verification/status" className="inline-flex items-center justify-center rounded-lg border border-green-200 text-green-800 px-4 py-2 font-semibold hover:bg-green-50">
                    View status
                  </Link>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-green-900">Performance snapshot</h2>
              {user.role === 'owner' && ownerInsights && (
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-center justify-between"><span>Total listings</span><span className="font-semibold text-green-800">{ownerInsights.totalProperties}</span></li>
                  <li className="flex items-center justify-between"><span>Bookings captured</span><span className="font-semibold text-green-800">{ownerInsights.totalBookings}</span></li>
                  <li className="flex items-center justify-between"><span>Upcoming check-ins</span><span className="font-semibold text-green-800">{ownerInsights.upcomingBookings}</span></li>
                  <li className="flex items-center justify-between"><span>Revenue to date</span><span className="font-semibold text-green-800">{formatCurrency(ownerInsights.revenue)}</span></li>
                  <li>
                    <Link to="/owners" className="text-xs text-green-700 font-semibold hover:underline">Open owner workspace →</Link>
                  </li>
                </ul>
              )}

              {user.role === 'agent' && agentInsights && (
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-center justify-between"><span>Assigned listings</span><span className="font-semibold text-green-800">{agentInsights.assignedCount}</span></li>
                  <li className="flex items-center justify-between"><span>Active deals</span><span className="font-semibold text-green-800">{agentInsights.activeDeals}</span></li>
                  <li className="flex items-center justify-between"><span>Confirmed closings</span><span className="font-semibold text-green-800">{agentInsights.confirmedDeals}</span></li>
                  <li>
                    <Link to="/brokers" className="text-xs text-green-700 font-semibold hover:underline">Open broker hub →</Link>
                  </li>
                </ul>
              )}

              {user.role === 'buyer' && buyerInsights && (
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-center justify-between"><span>Bookings placed</span><span className="font-semibold text-green-800">{buyerInsights.totalBookings}</span></li>
                  <li className="flex items-center justify-between"><span>Confirmed stays</span><span className="font-semibold text-green-800">{buyerInsights.confirmed}</span></li>
                  <li className="flex items-center justify-between"><span>Pending payments</span><span className="font-semibold text-green-800">{buyerInsights.pendingPayments}</span></li>
                  <li>
                    <Link to="/marketplace" className="text-xs text-green-700 font-semibold hover:underline">Resume property search →</Link>
                  </li>
                </ul>
              )}

              {user.role === 'admin' && adminInsights && (
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-center justify-between"><span>Total properties</span><span className="font-semibold text-green-800">{adminInsights.properties}</span></li>
                  <li className="flex items-center justify-between"><span>Total bookings</span><span className="font-semibold text-green-800">{adminInsights.bookings}</span></li>
                  <li className="flex items-center justify-between"><span>Payments processed</span><span className="font-semibold text-green-800">{adminInsights.payments}</span></li>
                  <li>
                    <Link to="/admin" className="text-xs text-green-700 font-semibold hover:underline">Go to admin console →</Link>
                  </li>
                </ul>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-green-900">Upcoming enhancements</h2>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Multi-factor authentication toggle.</li>
                <li>• Session history and device management.</li>
                <li>• Role upgrade requests and compliance workflows.</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </div>
  )
}

export default Profile
