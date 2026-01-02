import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { verificationApi } from '../../services/verificationApi'

const OfflineNotice = () => (
  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
    Backend not configured. Set VITE_API_BASE_URL to enable verification APIs.
  </div>
)

const VerificationHome = () => {
  const { user } = useAuth()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const roleLabel = user?.role === 'owner' ? 'Owner' : user?.role === 'agent' ? 'Agent' : 'Buyer'

  const missingMessages = useMemo(() => {
    if (!status?.missing_requirements) return []
    return status.missing_requirements.map((item) => {
      if (item === 'kyc') return 'Complete identity verification to proceed.'
      if (item === 'role_verification') return 'Submit role verification to unlock publishing/assignment.'
      return item
    })
  }, [status])

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!verificationApi) return
      if (!verificationApi.getStatus || !verificationApi) return
      try {
        const data = await verificationApi.getStatus()
        if (active) setStatus(data)
      } catch (err) {
        if (active) setError(err.message || 'Unable to load status')
      } finally {
        if (active) setLoading(false)
      }
    }
    if (verificationApi) {
      load()
    }
    return () => {
      active = false
    }
  }, [])

  const kycStatus = status?.kyc_status ?? 'unsubmitted'
  const roleStatus = status?.role_verification_status ?? 'unsubmitted'

  const bookingLocked = user?.role === 'buyer' && kycStatus !== 'approved'
  const publishingLocked = ['owner', 'agent', 'broker'].includes(user?.role) && roleStatus !== 'approved'

  return (
    <div className="bg-amber-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-700">Profile verification</p>
          <h1 className="text-3xl font-bold text-green-900">{roleLabel} verification center</h1>
          <p className="text-sm text-gray-600 max-w-2xl">
            Secure your account and unlock key actions. Buyers must complete KYC before booking. Owners/Agents must clear role verification before publishing or being assigned.
          </p>
        </div>

        {!verificationApi?.getStatus && <OfflineNotice />}
        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Identity verification</p>
                <h2 className="text-lg font-semibold text-green-900">KYC status</h2>
              </div>
              <StatusBadge status={kycStatus} />
            </div>
            <p className="text-sm text-gray-600">Required for bookings and payments.</p>
            <div className="flex gap-2">
              <Link
                to="/verification/status"
                className="inline-flex items-center px-4 py-2 rounded-lg border border-green-200 text-green-800 text-sm font-semibold hover:bg-green-50"
              >
                View details
              </Link>
              <Link
                to="/verification/submit"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold shadow-sm hover:bg-green-700"
              >
                Submit / update
              </Link>
            </div>
            {bookingLocked && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                Booking locked until KYC is approved.
              </div>
            )}
          </div>

          {(user?.role === 'owner' || user?.role === 'agent' || user?.role === 'broker') && (
            <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Role verification</p>
                  <h2 className="text-lg font-semibold text-green-900">{roleLabel} clearance</h2>
                </div>
                <StatusBadge status={roleStatus} />
              </div>
              <p className="text-sm text-gray-600">Required to publish listings or be assigned as an agent.</p>
              <div className="flex gap-2">
                <Link
                  to="/verification/status"
                  className="inline-flex items-center px-4 py-2 rounded-lg border border-green-200 text-green-800 text-sm font-semibold hover:bg-green-50"
                >
                  View details
                </Link>
                <Link
                  to="/verification/submit"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold shadow-sm hover:bg-green-700"
                >
                  Submit / update
                </Link>
              </div>
              {publishingLocked && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                  Publishing or assignment locked until role verification is approved.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm space-y-2">
          <p className="text-sm font-semibold text-green-900">What you need</p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Government ID (front + back) or passport, plus selfie.</li>
            <li>Owners: add ownership proof (deed/tax/utility) if publishing.</li>
            <li>Agents: add license/RERA certificate if taking assignments.</li>
          </ul>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading status…</p>}
        {!loading && missingMessages.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 space-y-1">
            {missingMessages.map((msg) => (
              <div key={msg}>• {msg}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VerificationHome
