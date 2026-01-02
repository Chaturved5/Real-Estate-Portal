import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const AdminLogin = () => {
  const { loginAdmin, isAuthenticated, authLoading, authError, clearAuthError, hydrating, user, defaultRedirectByRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formState, setFormState] = useState({ email: 'admin@estateportal.com', password: 'Admin@123' })
  const [localError, setLocalError] = useState('')

  const destination = useMemo(() => {
    if (location.state?.from?.pathname) {
      return location.state.from.pathname
    }
    return defaultRedirectByRole?.admin || '/admin'
  }, [defaultRedirectByRole, location.state])

  useEffect(() => {
    if (!hydrating && isAuthenticated && user?.role === 'admin') {
      navigate(destination, { replace: true })
    }
  }, [destination, hydrating, isAuthenticated, navigate, user])

  useEffect(() => () => {
    clearAuthError()
    setLocalError('')
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
      setLocalError('Enter both email and password.')
      return
    }

    try {
      await loginAdmin({ email: trimmedEmail, password: trimmedPassword })
      navigate(destination, { replace: true })
    } catch (error) {
      setLocalError(error.message)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0">
        <img src="/assets/admin-control.jpg" alt="Admin control center" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-slate-900/70 to-emerald-900/70" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center text-white space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Admin Access</p>
            <h1 className="text-3xl font-bold">Sign in to Command</h1>
            <p className="text-sm text-white/80">Use dedicated admin credentials to access control center.</p>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 sm:p-8 space-y-5 border border-white/30">
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-800" htmlFor="email">Admin email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={formState.email}
                  onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder="admin@estateportal.com"
                  disabled={authLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-800" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={formState.password}
                  onChange={(event) => setFormState((prev) => ({ ...prev, password: event.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder="Admin password"
                  disabled={authLoading}
                />
              </div>

              {localError && (
                <p className="text-sm text-amber-800 bg-amber-100 border border-amber-200 rounded-lg px-3 py-2">{localError}</p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
              >
                {authLoading ? 'Signing in…' : 'Sign in as admin'}
              </button>
            </form>

            <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
              <p className="font-semibold text-slate-900">Admin credentials</p>
              <p>Email: admin@estateportal.com</p>
              <p>Password: Admin@123</p>
            </div>

            <p className="text-sm text-slate-200 text-center">
              Not an admin?{' '}
              <Link to="/login" className="text-emerald-200 font-semibold hover:underline">Go to member login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
