import { Link } from 'react-router-dom'

const NotFound = () => (
  <div className="bg-amber-50 py-16 sm:py-24">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
      <h1 className="text-5xl sm:text-6xl font-bold text-green-900 mb-4">404</h1>
      <p className="text-gray-600 text-base sm:text-lg mb-8">
        The page you were looking for has moved or no longer exists. Let&apos;s get you back to exploring properties.
      </p>
      <Link
        to="/"
        className="inline-block bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-green-800 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  </div>
)

export default NotFound
