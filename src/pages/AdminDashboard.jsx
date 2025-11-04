import { useState, useEffect } from 'react'
import { adminService } from '../services'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { 
  Users, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Loader,
  Shield,
  UserCheck,
  UserX
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Navigate } from 'react-router-dom'

const AdminDashboard = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Redirect if not admin
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchDashboardStats()
    } else if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'requests') {
      fetchPendingRequests()
    }
  }, [activeTab])

  const fetchDashboardStats = async () => {
    setIsLoading(true)
    try {
      const response = await adminService.getDashboardStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await adminService.getAllUsers()
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPendingRequests = async () => {
    setIsLoading(true)
    try {
      const response = await adminService.getPendingRequests()
      setPendingRequests(response.data.requests || [])
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateRole = async (userId, newRole) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return

    try {
      await adminService.updateUserRole(userId, newRole)
      alert('User role updated successfully')
      fetchUsers()
    } catch (error) {
      alert(error.message || 'Failed to update user role')
    }
  }

  const handleApproveRequest = async (requestId) => {
    try {
      await adminService.approveRequest(requestId)
      alert('Request approved successfully')
      fetchPendingRequests()
    } catch (error) {
      alert(error.message || 'Failed to approve request')
    }
  }

  const handleRejectRequest = async (requestId) => {
    try {
      await adminService.rejectRequest(requestId)
      alert('Request rejected successfully')
      fetchPendingRequests()
    } catch (error) {
      alert(error.message || 'Failed to reject request')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage users, bookings, and system statistics
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('users')}
          >
            Users
          </Button>
          <Button
            variant={activeTab === 'requests' ? 'default' : 'outline'}
            onClick={() => setActiveTab('requests')}
          >
            Requests
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Overview Tab */}
        {!isLoading && activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTrips || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Planned trips
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Pool Groups</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activePoolGroups || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Open for joining
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    All bookings
                  </p>
                </CardContent>
              </Card>
            </div>

            {stats.recentUsers && stats.recentUsers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Registrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                        <Badge variant="secondary">{user.role}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Users Tab */}
        {!isLoading && activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No users found</p>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Joined: {new Date(user.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        {user.role !== 'ADMIN' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateRole(user.id, 'ADMIN')}
                          >
                            Make Admin
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requests Tab */}
        {!isLoading && activeTab === 'requests' && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Pool Group Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingRequests.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending requests</p>
                ) : (
                  pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{request.user?.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Group: {request.poolGroup?.trip?.destination || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Requested: {new Date(request.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApproveRequest(request.id)}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard


