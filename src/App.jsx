import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import TripPlan from './pages/TripPlan'
import Suggestions from './pages/Suggestions'
import Pooling from './pages/Pooling'
import Buses from './pages/Buses'
import Hotels from './pages/Hotels'
import Bookings from './pages/Bookings'
import AdminDashboard from './pages/AdminDashboard'
import PackageSelection from './pages/PackageSelection'
import PaymentStatus from './pages/PaymentStatus'
import GroupAdmin from './pages/GroupAdmin'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <div>
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes with Layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route
            path="plan-trip"
            element={
              <ProtectedRoute>
                <TripPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="suggestions"
            element={
              <ProtectedRoute>
                <Suggestions />
              </ProtectedRoute>
            }
          />
          <Route
            path="pooling"
            element={
              <ProtectedRoute>
                <Pooling />
              </ProtectedRoute>
            }
          />
          <Route
            path="group-admin/:groupId"
            element={
              <ProtectedRoute>
                <GroupAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="packages/:tripId"
            element={
              <ProtectedRoute>
                <PackageSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="payment-success/:paymentId"
            element={
              <ProtectedRoute>
                <PaymentStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="payment-failure/:paymentId"
            element={
              <ProtectedRoute>
                <PaymentStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="buses"
            element={
              <ProtectedRoute>
                <Buses />
              </ProtectedRoute>
            }
          />
          <Route
            path="hotels"
            element={
              <ProtectedRoute>
                <Hotels />
              </ProtectedRoute>
            }
          />
          <Route
            path="bookings"
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          />
        </Route>


       {/* <Route
            path="admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          /> */}

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </div>
  )
}

export default App
