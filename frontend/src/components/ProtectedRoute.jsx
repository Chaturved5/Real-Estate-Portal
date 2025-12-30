import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, hydrating } = useAuth()
  const location = useLocation()

  // Still restoring session from storage
  if (hydrating) {
    return (
      <div className="bg-amber-50 py-20">
        <div className="max-w-md mx-auto px-6 text-center">
          <p className="text-sm font-medium text-green-900">Verifying your access…</p>
        </div>
      </div>
    )
  }

  // Not logged in -> redirect to login and preserve intended path
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Logged in but missing the required role
  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Everything ok -> render nested route
  return <Outlet />
}

export default ProtectedRoute
