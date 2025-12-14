import { BrowserRouter, Route, Routes } from 'react-router-dom'
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
import OwnerDashboard from './pages/owners/OwnerDashboard'
import OwnerCreateListing from './pages/owners/OwnerCreateListing'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
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
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App