<<<<<<< Updated upstream
import { BrowserRouter, Route, Routes } from 'react-router-dom'
=======
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'

// Public pages
>>>>>>> Stashed changes
import LandingPage from './pages/LandingPage'
import MainLayout from './layouts/MainLayout'
import Brokers from './pages/brokers/Brokers'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import Unauthorized from './pages/Unauthorized'
import Admin from './pages/admin/Admin'
import Profile from './pages/Profile'
import MarketplacePage from './pages/buyers/MarketplacePage'
import PropertyDetailPage from './pages/buyers/PropertyDetailPage'
<<<<<<< Updated upstream
=======
import BuyerBookings from './pages/buyers/BuyerBookings'
import BuyerBookingDetail from './pages/buyers/BuyerBookingDetail'

// Owner
>>>>>>> Stashed changes
import OwnerDashboard from './pages/owners/OwnerDashboard'
import OwnerCreateListing from './pages/owners/OwnerCreateListing'
import OwnerListings from './pages/owners/OwnerListings'
import OwnerEditListing from './pages/owners/OwnerEditListing'

<<<<<<< Updated upstream
function App() {
  return (
    <BrowserRouter>
=======
// Broker
import Brokers from './pages/brokers/Brokers'

// Admin
import Admin from './pages/admin/Admin'
import VerificationQueue from './pages/admin/VerificationQueue'
import VerificationRequestDetail from './pages/admin/VerificationRequestDetail'
import AdminUsers from './pages/admin/AdminUsers'
import AdminProperties from './pages/admin/AdminProperties'
import AdminDisputes from './pages/admin/AdminDisputes'
import AdminAnalytics from './pages/admin/AdminAnalytics'

// Verification
import VerificationHome from './pages/verification/VerificationHome'
import SubmitVerification from './pages/verification/SubmitVerification'
import VerificationStatus from './pages/verification/VerificationStatus'

import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
>>>>>>> Stashed changes
      <Routes>
        <Route element={<MainLayout />}>
<<<<<<< Updated upstream
          <Route index element={<LandingPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="marketplace/:propertyId" element={<PropertyDetailPage />} />
          <Route
            path="owners"
            element={
              <ProtectedRoute roles={["owner"]}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="owners/create-listing"
            element={
              <ProtectedRoute roles={["owner"]}>
                <OwnerCreateListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="brokers"
            element={
              <ProtectedRoute roles={["agent", "broker"]}>
                <Brokers />
              </ProtectedRoute>
            }
          />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="unauthorized" element={<Unauthorized />} />
=======
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Authenticated for any role */}
          <Route element={<ProtectedRoute allowedRoles={["buyer", "owner", "broker", "admin", "agent"]} />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/verification" element={<VerificationHome />} />
            <Route path="/verification/submit" element={<SubmitVerification />} />
            <Route path="/verification/status" element={<VerificationStatus />} />
          </Route>

          {/* Buyer-only */}
          <Route element={<ProtectedRoute allowedRoles={["buyer"]} />}>
            <Route path="/buyer/bookings" element={<BuyerBookings />} />
            <Route path="/buyer/bookings/:id" element={<BuyerBookingDetail />} />
          </Route>

          {/* Public browse */}
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/property/:propertyId" element={<PropertyDetailPage />} />

          {/* Owner */}
          <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/listings" element={<OwnerListings />} />
            <Route path="/owner/listings/new" element={<OwnerCreateListing />} />
            <Route path="/owner/listings/:id/edit" element={<OwnerEditListing />} />
          </Route>

          {/* Broker / Agent */}
          <Route element={<ProtectedRoute allowedRoles={["broker", "agent"]} />}>
            <Route path="/brokers" element={<Brokers />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Admin />} />
              <Route path="verifications" element={<VerificationQueue />} />
              <Route path="verifications/:id" element={<VerificationRequestDetail />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="properties" element={<AdminProperties />} />
              <Route path="disputes" element={<AdminDisputes />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>
          </Route>

          {/* 404 */}
>>>>>>> Stashed changes
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App