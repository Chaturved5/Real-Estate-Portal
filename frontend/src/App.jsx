import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'

// Public pages
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Contact from './pages/Contact'
import Unauthorized from './pages/Unauthorized'
import NotFound from './pages/NotFound'

// Shared authenticated
import Profile from './pages/Profile'

// Buyer
import MarketplacePage from './pages/buyers/MarketplacePage'
import PropertyDetailPage from './pages/buyers/PropertyDetailPage'

// Owner
import OwnerDashboard from './pages/owners/OwnerDashboard'
import OwnerCreateListing from './pages/owners/OwnerCreateListing'

// Broker
import Brokers from './pages/brokers/Brokers'

// Admin
import Admin from './pages/admin/Admin'

import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        {/* All routes share main layout */}
        <Route element={<MainLayout />}>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Authenticated for any role */}
          <Route element={<ProtectedRoute allowedRoles={["buyer", "owner", "broker", "admin", "agent"]} />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Public browse */}
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/property/:propertyId" element={<PropertyDetailPage />} />

          {/* Owner */}
          <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/listings/new" element={<OwnerCreateListing />} />
          </Route>

          {/* Broker / Agent */}
          <Route element={<ProtectedRoute allowedRoles={["broker", "agent"]} />}>
            <Route path="/brokers" element={<Brokers />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App