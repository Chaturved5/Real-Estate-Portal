import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Login = () => {
  const { login, isAuthenticated, authLoading, authError, clearAuthError, hydrating, user, defaultRedirectByRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formState, setFormState] = useState({ email: '', password: '', remember: true })
  const [localError, setLocalError] = useState('')

  const destination = useMemo(() => {
    if (location.state?.from?.pathname) {
      return location.state.from.pathname
    }
    if (user?.role && defaultRedirectByRole[user.role]) {
      return defaultRedirectByRole[user.role]
    }
    return '/marketplace'
  }, [defaultRedirectByRole, location.state, user])

  useEffect(() => {
    if (!hydrating && isAuthenticated) {
      navigate(destination, { replace: true })
    }
  }, [destination, hydrating, isAuthenticated, navigate])

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

    const trimmedEmail = formState.email.trim()
    const trimmedPassword = formState.password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      setLocalError('Please enter both email and password.')
      return
    }

    try {
      await login({ email: trimmedEmail, password: trimmedPassword, remember: formState.remember })
      navigate(destination, { replace: true })
    } catch (error) {
      setLocalError(error.message)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/assets/living-room.jpg"
          alt="Sophisticated living room"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(47,63,45,0.82)] via-[rgba(163,177,138,0.55)] to-[rgba(245,229,210,0.85)] mix-blend-multiply" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center text-white space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-200">Account Access</p>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-sm text-white/85">Sign in to manage bookings, listings, and deals securely.</p>
          </div>

          <div className="glass-card p-6 sm:p-8 space-y-6 bg-white/85">
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-green-900" htmlFor="email">
                Email address
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

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-green-900" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={formState.password}
                onChange={(event) => setFormState((previous) => ({ ...previous, password: event.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Enter your password"
                disabled={authLoading}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formState.remember}
                  onChange={(event) => setFormState((previous) => ({ ...previous, remember: event.target.checked }))}
                  disabled={authLoading}
                  className="rounded border-gray-300 text-green-700 focus:ring-green-600"
                />
                <span>Remember this device</span>
              </label>
              <Link to="/contact" className="text-green-700 font-medium hover:underline">
                Need help logging in?
              </Link>
            </div>

            {localError && <p className="text-sm text-amber-700 bg-amber-100 border border-amber-200 rounded-lg px-3 py-2">{localError}</p>}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors disabled:opacity-60"
            >
              {authLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-left text-amber-900 space-y-2">
            <p className="font-semibold text-amber-900">Demo credentials (offline mode)</p>
            <ul className="space-y-1">
              <li><span className="font-semibold">Admin:</span> admin@estateportal.com / Admin@123</li>
              <li><span className="font-semibold">Owner:</span> neeraj@estateportal.com / Owner@123</li>
              <li><span className="font-semibold">Broker:</span> rohan@estateportal.com / Broker@123</li>
              <li><span className="font-semibold">Buyer:</span> buyer@estateportal.com / Buyer@123</li>
            </ul>
          </div>

            <p className="text-sm text-white/85 text-center">
              New to EstatePortal?{' '}
              <Link to="/signup" className="text-green-200 font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
