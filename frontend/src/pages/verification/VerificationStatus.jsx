import { useEffect, useState } from 'react'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { verificationApi } from '../../services/verificationApi'

const VerificationStatus = () => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const result = await verificationApi.getStatus()
        if (active) setData(result)
      } catch (err) {
        if (active) setError(err.message || 'Failed to load status')
      } finally {
        if (active) setLoading(false)
      }
    }
    if (verificationApi.isEnabled) {
      load()
    } else {
      setError('Backend not configured. Set VITE_API_BASE_URL.')
      setLoading(false)
    }
    return () => {
      active = false
    }
  }, [])

  const kycStatus = data?.kyc_status ?? 'unsubmitted'
  const roleStatus = data?.role_verification_status ?? 'unsubmitted'

  return (
    <div className="bg-amber-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-700">Verification status</p>
          <h1 className="text-3xl font-bold text-green-900">Your review progress</h1>
          <p className="text-sm text-gray-600">Track identity and role verification outcomes.</p>
        </div>

        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm">{error}</div>}
        {loading && <p className="text-sm text-gray-500">Loading…</p>}

        {!loading && (
          <div className="space-y-4">
            <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Identity verification</p>
                  <h2 className="text-lg font-semibold text-green-900">KYC</h2>
                </div>
                <StatusBadge status={kycStatus} />
              </div>
              {data?.kyc_rejection_reason && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
                  Rejection reason: {data.kyc_rejection_reason}
                </div>
              )}
            </div>

            {(user?.role === 'owner' || user?.role === 'agent' || user?.role === 'broker') && (
              <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Role verification</p>
                    <h2 className="text-lg font-semibold text-green-900">Role clearance</h2>
                  </div>
                  <StatusBadge status={roleStatus} />
                </div>
                {data?.role_verification_rejection_reason && (
                  <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
                    Rejection reason: {data.role_verification_rejection_reason}
                  </div>
                )}
              </div>
            )}

            {Array.isArray(data?.missing_requirements) && data.missing_requirements.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 space-y-1">
                <p className="font-semibold text-amber-900">Still required:</p>
                {data.missing_requirements.map((item) => (
                  <div key={item}>• {item}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VerificationStatus
