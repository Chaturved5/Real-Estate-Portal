import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import MainLayout from './layouts/MainLayout'
import Marketplace from './pages/Marketplace'
import Owners from './pages/Owners'
import Brokers from './pages/Brokers'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'
import PropertyDetail from './pages/PropertyDetail'
import ProtectedRoute from './components/ProtectedRoute'
import Unauthorized from './pages/Unauthorized'
import Admin from './pages/Admin'
import Profile from './pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="marketplace/:propertyId" element={<PropertyDetail />} />
          <Route
            path="owners"
            element={
              <ProtectedRoute roles={["owner"]}>
                <Owners />
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