import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { verificationApi } from '../../services/verificationApi'
import { useTheme } from '../../context/ThemeContext.jsx'

const actionOptions = [
  { value: 'approved', label: 'Approve' },
  { value: 'rejected', label: 'Reject' },
  { value: 'needs_more_info', label: 'Needs more info' },
]

const VerificationRequestDetail = () => {
  const { isDark } = useTheme()
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [action, setAction] = useState('approved')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const data = await verificationApi.adminGet(id)
        if (active) setRequest(data)
      } catch (err) {
        if (active) setError(err.message || 'Failed to load request')
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
  }, [id])

  const handleAction = async () => {
    setError(null)
    try {
      setSaving(true)
      await verificationApi.adminUpdate(id, { status: action, reason })
      navigate('/admin/verifications')
    } catch (err) {
      setError(err.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`${isDark ? 'bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'} min-h-screen py-10`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Admin • Verifications</p>
          <h1 className="text-3xl font-bold">Request #{id}</h1>
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Review documents and decide.</p>
        </div>

        {error && <div className={`rounded-lg border px-4 py-3 text-sm ${isDark ? 'border-rose-500/40 bg-rose-500/10 text-rose-100' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>{error}</div>}
        {loading && <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Loading…</p>}

        {request && (
          <div className="space-y-5">
            <div className={`${isDark ? 'bg-slate-900/70 border border-white/10' : 'bg-white border border-slate-200 shadow-sm'} rounded-2xl p-5 shadow-sm space-y-3`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>Request</p>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{request.kind}</h2>
                </div>
                <StatusBadge status={request.status} />
              </div>
              <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Notes: {request.notes || '—'}</p>
            </div>

            <div className={`${isDark ? 'bg-slate-900/70 border border-white/10' : 'bg-white border border-slate-200 shadow-sm'} rounded-2xl p-5 shadow-sm space-y-2`}>
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>User</p>
              <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{request.user?.name} • {request.user?.email}</p>
            </div>

            <div className={`${isDark ? 'bg-slate-900/70 border border-white/10' : 'bg-white border border-slate-200 shadow-sm'} rounded-2xl p-5 shadow-sm space-y-3`}>
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Documents</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {request.documents?.map((doc) => (
                  <div key={doc.id} className={`rounded-lg border px-3 py-2 text-sm ${isDark ? 'text-slate-200 bg-slate-800/60 border-white/10' : 'text-slate-800 bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{doc.type}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{doc.mime} • {(doc.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <StatusBadge status={doc.status} />
                    </div>
                    <a
                      href={doc.url || doc.path}
                      target="_blank"
                      rel="noreferrer"
                      className={`text-xs font-semibold ${isDark ? 'text-emerald-200 hover:text-white' : 'text-emerald-700 hover:text-emerald-900'}`}
                    >
                      Open
                    </a>
                  </div>
                ))}
                {!request.documents?.length && <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>No documents attached.</p>}
              </div>
            </div>

            <div className={`${isDark ? 'bg-slate-900/70 border border-white/10' : 'bg-white border border-slate-200 shadow-sm'} rounded-2xl p-5 shadow-sm space-y-3`}>
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Decision</p>
              <div className="flex flex-wrap gap-3 text-sm">
                {actionOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAction(opt.value)}
                    className={`rounded-lg border px-4 py-2 font-semibold transition ${
                      action === opt.value
                        ? isDark
                          ? 'border-emerald-400 bg-emerald-500/10 text-white'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : isDark
                          ? 'border-white/10 text-slate-200 hover:border-emerald-300'
                          : 'border-slate-200 text-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <textarea
                className={`w-full rounded-lg px-3 py-2 text-sm ${isDark ? 'border border-white/10 bg-slate-950/60 text-slate-100' : 'border border-slate-200 bg-white text-slate-800'}`}
                rows={3}
                placeholder="Reason (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/admin/verifications')}
                  className={`text-sm font-semibold ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAction}
                  disabled={saving || !verificationApi.isEnabled}
                  className={`inline-flex items-center px-5 py-2 rounded-lg text-sm font-semibold shadow-sm disabled:opacity-50 ${
                    isDark ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {saving ? 'Saving…' : 'Apply decision'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerificationRequestDetail
