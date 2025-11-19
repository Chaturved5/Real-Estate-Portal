import { Link } from 'react-router-dom'

const Unauthorized = () => (
  <div className="bg-amber-50 py-16">
    <div className="max-w-lg mx-auto px-4 text-center space-y-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-700">Access Restricted</p>
      <h1 className="text-3xl font-bold text-green-900">You don&apos;t have permission to view this page</h1>
      <p className="text-sm text-gray-600">
        Switch to a role with the right permissions or reach out to support if you believe this is an error.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-green-200 text-green-800 text-sm font-semibold hover:bg-green-50 transition-colors"
        >
          Back to home
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-colors"
        >
          Sign in with another account
        </Link>
      </div>
    </div>
  </div>
)

export default Unauthorized
