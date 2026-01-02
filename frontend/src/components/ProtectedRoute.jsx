import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

<<<<<<< Updated upstream
const ProtectedRoute = ({ roles, children }) => {
=======
const normalizeRole = (role) => (role === 'broker' ? 'agent' : role)

const ProtectedRoute = ({ allowedRoles }) => {
>>>>>>> Stashed changes
  const { user, isAuthenticated, hydrating } = useAuth()
  const location = useLocation()

  if (hydrating) {
    return (
      <div className="bg-amber-50 py-20">
        <div className="max-w-md mx-auto px-6 text-center">
          <p className="text-sm font-medium text-green-900">Verifying your access…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

<<<<<<< Updated upstream
  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
=======
  // Logged in but missing the required role
  if (allowedRoles?.length) {
    const normalizedUserRole = normalizeRole(user.role)
    const normalizedAllowed = allowedRoles.map(normalizeRole)
    if (!normalizedAllowed.includes(normalizedUserRole)) {
      return <Navigate to="/unauthorized" replace />
    }
>>>>>>> Stashed changes
  }

  return children
}

export default ProtectedRoute
