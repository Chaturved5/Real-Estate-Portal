import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const roleOptions = [
  { label: 'Buyer / Renter', value: 'buyer', helper: 'Reserve properties and manage your bookings.' },
  { label: 'Property Owner', value: 'owner', helper: 'List properties, track earnings, and manage guests.' },
  { label: 'Broker / Agent', value: 'agent', helper: 'Support owners and close deals with clients.' }
]

const Signup = () => {
  const { search } = useLocation()
  const navigate = useNavigate()
  const query = useMemo(() => new URLSearchParams(search), [search])
  const preselectedRole = query.get('role') || 'buyer'

  const { register, authLoading, authError, clearAuthError, isAuthenticated, user, hydrating, defaultRedirectByRole } = useAuth()

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: roleOptions.some((option) => option.value === preselectedRole) ? preselectedRole : 'buyer',
    acceptTerms: false
  })

  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (!hydrating && isAuthenticated) {
      const fallback = user?.role && defaultRedirectByRole[user.role] ? defaultRedirectByRole[user.role] : '/marketplace'
      navigate(fallback, { replace: true })
    }
  }, [defaultRedirectByRole, hydrating, isAuthenticated, navigate, user])

  useEffect(() => {
    return () => {
      clearAuthError()
      setLocalError('')
    }
  }, [clearAuthError])

  useEffect(() => {
    if (authError) {
      setLocalError(authError)
    }
  }, [authError])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError('')

    const trimmedName = formState.name.trim()
    const trimmedEmail = formState.email.trim()
    const trimmedPassword = formState.password.trim()
    const trimmedConfirm = formState.confirmPassword.trim()

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      setLocalError('All fields are required to create your account.')
      return
    }

    if (trimmedPassword.length < 8) {
      setLocalError('Passwords must be at least 8 characters long.')
      return
    }

    if (trimmedPassword !== trimmedConfirm) {
      setLocalError('Passwords do not match.')
      return
    }

    if (!formState.acceptTerms) {
      setLocalError('Please accept the terms of service to continue.')
      return
    }

    try {
      const newUser = await register({
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
        role: formState.role
      })

      const redirectTarget = (newUser?.role && defaultRedirectByRole[newUser.role]) || '/marketplace'
      navigate(redirectTarget, { replace: true })
    } catch (error) {
      setLocalError(error.message)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/assets/living-room.jpg"
          alt="Sunlit villa interior"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(47,63,45,0.82)] via-[rgba(163,177,138,0.55)] to-[rgba(245,229,210,0.85)] mix-blend-multiply" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-5xl space-y-10">
          <div className="text-center text-white space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-200">Join EstatePortal</p>
            <h1 className="text-3xl sm:text-4xl font-bold">Create your account</h1>
            <p className="text-sm sm:text-base text-white/85">
              Choose your role to unlock tailored workflows and dashboards.
            </p>
          </div>

          <div className="glass-card bg-white/85 p-6 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
              <form className="grid gap-6" onSubmit={handleSubmit} noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-green-900" htmlFor="name">
                      Full name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formState.name}
                      onChange={(event) => setFormState((previous) => ({ ...previous, name: event.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                      placeholder="e.g. Priya Sinha"
                      disabled={authLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-green-900" htmlFor="email">
                      Work email
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={formState.email}
                      onChange={(event) => setFormState((previous) => ({ ...previous, email: event.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                      placeholder="you@example.com"
                      disabled={authLoading}
                    />
                  </div>
                </div>

                <fieldset className="border border-green-100 rounded-xl p-4 space-y-3 bg-green-50/40">
                  <legend className="text-xs font-semibold uppercase tracking-wide text-green-900 px-1">Select your role</legend>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {roleOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`cursor-pointer border rounded-xl p-4 text-sm transition-all duration-200 shadow-sm ${
                          formState.role === option.value
                            ? 'border-green-400 bg-white/90 ring-2 ring-green-300'
                            : 'border-gray-200 bg-white/60 hover:border-green-300 hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={option.value}
                          checked={formState.role === option.value}
                          onChange={(event) => setFormState((previous) => ({ ...previous, role: event.target.value }))}
                          disabled={authLoading}
                          className="sr-only"
                        />
                        <span className="font-semibold text-green-900 block">{option.label}</span>
                        <span className="text-xs text-gray-500">{option.helper}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-green-900" htmlFor="password">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      value={formState.password}
                      onChange={(event) => setFormState((previous) => ({ ...previous, password: event.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                      placeholder="Minimum 8 characters"
                      disabled={authLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-green-900" htmlFor="confirm-password">
                      Confirm password
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      value={formState.confirmPassword}
                      onChange={(event) => setFormState((previous) => ({ ...previous, confirmPassword: event.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                      placeholder="Re-enter password"
                      disabled={authLoading}
                    />
                  </div>
                </div>

                <label className="flex items-start gap-3 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={formState.acceptTerms}
                    onChange={(event) => setFormState((previous) => ({ ...previous, acceptTerms: event.target.checked }))}
                    disabled={authLoading}
                    className="mt-0.5 rounded border-gray-300 text-green-700 focus:ring-green-600"
                  />
                  <span>
                    I agree to the{' '}
                    <Link to="/terms" className="text-green-700 font-semibold hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-green-700 font-semibold hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                {localError && (
                  <p className="text-sm text-amber-700 bg-amber-100 border border-amber-200 rounded-lg px-3 py-2">{localError}</p>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full sm:w-auto px-6 py-3 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors disabled:opacity-60"
                >
                  {authLoading ? 'Creating account…' : 'Create account'}
                </button>
              </form>

              <aside className="space-y-6 text-sm text-gray-600">
                <div className="rounded-2xl bg-white/70 border border-green-100/70 p-6 space-y-3 shadow-sm">
                  <h2 className="text-lg font-semibold text-green-900">Why join us?</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 text-green-700">🌿</span>
                      <span>Unified workspace to manage listings, bookings, reviews, and payouts.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 text-green-700">🔐</span>
                      <span>Secure payments with real-time tracking and role-based access.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 text-green-700">🤝</span>
                      <span>Collaborate with verified owners, agents, and buyers in one place.</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 text-amber-900 space-y-3 shadow-sm">
                  <p className="font-semibold">Getting started checklist</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Owners: keep KYC documents handy for verification.</li>
                    <li>Brokers: update your RERA details post sign-up.</li>
                    <li>Buyers: enable notifications to track booking alerts.</li>
                  </ul>
                </div>
              </aside>
            </div>

            <p className="text-sm text-white/85 text-center mt-8">
              Already have an account?{' '}
              <Link to="/login" className="text-green-200 font-semibold hover:underline">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
