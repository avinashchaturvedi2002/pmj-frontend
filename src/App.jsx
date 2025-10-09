import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import TripPlan from './pages/TripPlan'
import Suggestions from './pages/Suggestions'
import Pooling from './pages/Pooling'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
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
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
