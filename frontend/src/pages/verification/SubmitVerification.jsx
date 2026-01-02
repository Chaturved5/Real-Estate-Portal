import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FileUploadField from '../../components/FileUploadField'
import StatusBadge from '../../components/StatusBadge'
import StepIndicator from '../../components/StepIndicator'
import { useAuth } from '../../context/AuthContext'
import { verificationApi } from '../../services/verificationApi'
import { kindForRole, verificationRequirements } from '../../data/verificationRequirements'

const steps = ['Select type', 'Upload documents', 'Review & submit']
const MAX_FILES = 5
const MAX_SIZE_MB = 5

const SubmitVerification = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedKind, setSelectedKind] = useState(kindForRole(user?.role)[0])
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const availableKinds = useMemo(() => kindForRole(user?.role || 'buyer'), [user?.role])
  const docsNeeded = useMemo(() => {
    const roleKey = (user?.role === 'broker' ? 'agent' : user?.role) || 'buyer'
    const config = verificationRequirements[roleKey] || {}
    if (selectedKind === 'identity') return config.identity || []
    return config.role || []
  }, [selectedKind, user?.role])

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)

    if (!verificationApi.isEnabled) {
      setError('Backend not configured. Set VITE_API_BASE_URL.')
      return
    }

    if (!files.length) {
      setError('Please upload at least one document.')
      return
    }

    const formData = new FormData()
    formData.append('kind', selectedKind === 'owner_role' ? 'owner_role' : selectedKind === 'agent_role' ? 'agent_role' : 'identity')
    files.forEach((file, idx) => {
      formData.append('documents[]', file)
      formData.append('document_types[]', file.name || `doc-${idx + 1}`)
    })

    try {
      setSubmitting(true)
      await verificationApi.submit(formData)
      setSuccess('Submitted for review. You will be notified once reviewed.')
      navigate('/verification/status')
    } catch (err) {
      setError(err.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStep = () => {
    if (currentStep === 0) {
      return (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Choose what you are submitting now.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {availableKinds.map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setSelectedKind(kind)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  selectedKind === kind ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'
                }`}
              >
                <p className="text-sm font-semibold text-green-900">
                  {kind === 'identity' ? 'Identity verification' : kind === 'owner_role' ? 'Owner role verification' : 'Agent role verification'}
                </p>
                <p className="text-xs text-gray-600">{kind === 'identity' ? 'Required for bookings and payments' : 'Required before publishing or assignments'}</p>
              </button>
            ))}
          </div>
        </div>
      )
    }

    if (currentStep === 1) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Upload clear scans/photos. Avoid glare and ensure all corners are visible.</p>
          <FileUploadField
            label="Documents"
            files={files}
            onChange={setFiles}
            maxFiles={MAX_FILES}
            maxSizeMb={MAX_SIZE_MB}
            hint="PDF, JPG, PNG allowed"
          />
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Required examples:
            <ul className="list-disc list-inside space-y-1 mt-1">
              {docsNeeded.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-green-100 bg-white px-4 py-3 text-sm text-gray-700">
          <p className="font-semibold text-green-900 mb-1">Review</p>
          <p>Type: <span className="font-semibold text-green-800">{selectedKind}</span></p>
          <p>Files: {files.length} selected.</p>
          <p className="text-xs text-gray-500">Submission will be sent for manual review. You can re-submit if rejected.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {files.map((file, idx) => (
            <StatusBadge key={idx} status="pending">{file.name}</StatusBadge>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-amber-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-700">Submit verification</p>
          <h1 className="text-3xl font-bold text-green-900">Upload your documents</h1>
          <p className="text-sm text-gray-600">We review submissions manually. Expect an update within 24-48h.</p>
        </div>

        {!verificationApi.isEnabled && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Backend not configured. Set VITE_API_BASE_URL to enable submission.
          </div>
        )}

        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm">{error}</div>}
        {success && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800 text-sm">{success}</div>}

        <div className="bg-white border border-green-100 rounded-2xl p-6 shadow-sm space-y-6">
          <StepIndicator steps={steps} current={currentStep} />

          {renderStep()}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0 || submitting}
              className="text-sm font-semibold text-gray-600 hover:text-green-800 disabled:opacity-40"
            >
              Back
            </button>
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold shadow-sm hover:bg-green-700"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !verificationApi.isEnabled}
                className="inline-flex items-center px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold shadow-sm hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit for review'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubmitVerification
