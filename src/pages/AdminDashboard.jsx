import { useState, useEffect } from 'react'
import { adminService, poolingService, packageService } from '../services'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { 
  Users, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Loader,
  Shield,
  UserCheck,
  UserX,
  Package,
  Clock,
  DollarSign,
  Lock,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Navigate } from 'react-router-dom'

const POOL_STATUS_OPTIONS = ['OPEN', 'CLOSED', 'LOCKED']
const MEMBER_STATUS_BADGE = {
  PENDING: 'outline',
  APPROVED: 'secondary',
  PAYMENT_PENDING: 'secondary',
  PAID: 'default',
  PAYMENT_FAILED: 'destructive',
  REJECTED: 'destructive',
  CANCELLED: 'destructive'
}

const AdminDashboard = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [poolGroups, setPoolGroups] = useState([])
  const [poolStatusFilter, setPoolStatusFilter] = useState('OPEN')
  const [poolGroupsLoading, setPoolGroupsLoading] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [groupDetailsLoading, setGroupDetailsLoading] = useState(false)
  const [packageOptions, setPackageOptions] = useState([])
  const [packageForm, setPackageForm] = useState({
    packageId: '',
    perPersonCost: '',
    paymentDeadline: ''
  })
  const [paymentSummary, setPaymentSummary] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [enforcingDeadline, setEnforcingDeadline] = useState(false)

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
    } else if (activeTab === 'pool-groups') {
      fetchPoolGroups(poolStatusFilter)
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'pool-groups') {
      fetchPoolGroups(poolStatusFilter)
    }
  }, [poolStatusFilter])

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

  const fetchPoolGroups = async (status) => {
    setPoolGroupsLoading(true)
    try {
      const response = await poolingService.getAllPoolGroups({ status })
      const groups = response.data?.poolGroups || []
      setPoolGroups(groups)

      if (selectedGroupId && !groups.some((group) => group.id === selectedGroupId)) {
        setSelectedGroupId(null)
        setSelectedGroup(null)
        setPaymentSummary(null)
      }
    } catch (error) {
      console.error('Failed to fetch pool groups:', error)
    } finally {
      setPoolGroupsLoading(false)
    }
  }

  const fetchGroupDetails = async (groupId) => {
    setGroupDetailsLoading(true)
    setPaymentSummary(null)
    try {
      const response = await poolingService.getPoolGroupById(groupId)
      const group = response.data?.poolGroup

      if (group) {
        setSelectedGroupId(groupId)
        setSelectedGroup(group)

        try {
          const packageResponse = await packageService.getAllPackages({
            tripId: group.tripId,
            isActive: true,
            limit: 50
          })
          const packageData =
            packageResponse.data?.packages ||
            packageResponse.data?.data?.packages ||
            packageResponse.data?.data ||
            []
          setPackageOptions(Array.isArray(packageData) ? packageData : [])
        } catch (packageError) {
          console.error('Failed to fetch packages for trip:', packageError)
          setPackageOptions([])
        }

        setPackageForm({
          packageId: group.selectedPackageId || '',
          perPersonCost: group.perPersonCost ? String(group.perPersonCost) : '',
          paymentDeadline: group.paymentDeadline
            ? formatDateTimeForInput(group.paymentDeadline)
            : ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch pool group details:', error)
    } finally {
      setGroupDetailsLoading(false)
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

  const handleMemberStatusChange = async (groupId, memberId, status) => {
    setActionLoading(true)
    try {
      await poolingService.updateMemberStatus(groupId, memberId, status)
      await fetchGroupDetails(groupId)
      await fetchPoolGroups(poolStatusFilter)
      alert(`Member ${status.toLowerCase()} successfully`)
    } catch (error) {
      alert(error?.response?.data?.message || error.message || 'Failed to update member status')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePackageFormChange = (field, value) => {
    setPackageForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSetGroupPackage = async () => {
    if (!selectedGroupId) return

    if (!packageForm.packageId || !packageForm.perPersonCost) {
      alert('Please select a package and set per-person cost')
      return
    }

    const perPersonCostValue = parseInt(packageForm.perPersonCost, 10)
    if (Number.isNaN(perPersonCostValue) || perPersonCostValue <= 0) {
      alert('Please enter a valid per-person cost')
      return
    }

    setActionLoading(true)
    try {
      await poolingService.setGroupPackage(selectedGroupId, {
        packageId: packageForm.packageId,
        perPersonCost: perPersonCostValue,
        paymentDeadline: packageForm.paymentDeadline
          ? new Date(packageForm.paymentDeadline).toISOString()
          : null
      })
      alert('Package set successfully')
      await fetchGroupDetails(selectedGroupId)
      await fetchPoolGroups(poolStatusFilter)
    } catch (error) {
      alert(error?.response?.data?.message || error.message || 'Failed to set package')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckPayments = async () => {
    if (!selectedGroupId) return

    setActionLoading(true)
    try {
      const response = await poolingService.checkGroupPaymentStatus(selectedGroupId)
      setPaymentSummary(response.data)
    } catch (error) {
      alert(error?.response?.data?.message || error.message || 'Failed to fetch payment status')
    } finally {
      setActionLoading(false)
    }
  }

  const handleLockGroup = async () => {
    if (!selectedGroupId) return

    setActionLoading(true)
    try {
      await poolingService.lockGroup(selectedGroupId)
      alert('Group locked successfully')
      await fetchGroupDetails(selectedGroupId)
      await fetchPoolGroups(poolStatusFilter)
    } catch (error) {
      alert(error?.response?.data?.message || error.message || 'Failed to lock group')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEnforceDeadline = async () => {
    if (!selectedGroupId) return

    setEnforcingDeadline(true)
    try {
      await poolingService.enforcePaymentDeadline(selectedGroupId)
      alert('Payment deadline enforced. Overdue members removed.')
      await fetchGroupDetails(selectedGroupId)
      await fetchPoolGroups(poolStatusFilter)
    } catch (error) {
      alert(error?.response?.data?.message || error.message || 'Failed to enforce payment deadline')
    } finally {
      setEnforcingDeadline(false)
    }
  }

  const handleRefreshGroup = () => {
    if (selectedGroupId) {
      fetchGroupDetails(selectedGroupId)
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
          <Button
            variant={activeTab === 'pool-groups' ? 'default' : 'outline'}
            onClick={() => setActiveTab('pool-groups')}
          >
            Pool Groups
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

        {!isLoading && activeTab === 'pool-groups' && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Pool Groups</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage approvals, packages, and payments for all pool groups
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POOL_STATUS_OPTIONS.map((status) => (
                    <Button
                      key={status}
                      variant={poolStatusFilter === status ? 'default' : 'outline'}
                      onClick={() => setPoolStatusFilter(status)}
                    >
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {poolGroupsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : poolGroups.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No pool groups found for this filter.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {poolGroups.map((group) => (
                      <Button
                        key={group.id}
                        variant={selectedGroupId === group.id ? 'default' : 'outline'}
                        className="justify-start h-auto py-4 px-4"
                        onClick={() => fetchGroupDetails(group.id)}
                      >
                        <div className="w-full text-left space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">
                              {group.trip?.destination || 'Unknown Destination'}
                            </span>
                            <Badge variant="outline">{group.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {group.trip?.source} → {group.trip?.destination}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                            <span>Members: {group.currentSize}/{group.groupSize}</span>
                            <span>{formatDateTimeDisplay(group.createdAt)}</span>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedGroup && (
              <Card>
                <CardHeader className="space-y-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <CardTitle>Group Details</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshGroup}
                        disabled={groupDetailsLoading}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCheckPayments}
                        disabled={actionLoading || groupDetailsLoading}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Check Payments
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEnforceDeadline}
                        disabled={enforcingDeadline || groupDetailsLoading || !selectedGroup.paymentDeadline}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Enforce Deadline
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleLockGroup}
                        disabled={
                          actionLoading ||
                          groupDetailsLoading ||
                          !(paymentSummary?.summary?.allPaid)
                        }
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Lock Group
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedGroup.trip?.source} → {selectedGroup.trip?.destination}
                    </span>
                    <span>Group Size: {selectedGroup.currentSize}/{selectedGroup.groupSize}</span>
                    <span>Status: {selectedGroup.status}</span>
                    {selectedGroup.paymentDeadline && (
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Deadline: {formatDateTimeDisplay(selectedGroup.paymentDeadline)}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {groupDetailsLoading ? (
                    <div className="flex justify-center items-center py-6">
                      <Loader className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Members
                        </h3>
                        <div className="space-y-3">
                          {selectedGroup.members?.map((member) => (
                            <div
                              key={member.id}
                              className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border border-gray-200 dark:border-gray-700 rounded-md p-3"
                            >
                              <div>
                                <p className="font-medium">{member.user?.name || 'Unknown User'}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {member.user?.email}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <Badge variant={getMemberBadgeVariant(member.status)}>
                                    {member.status}
                                  </Badge>
                                  {member.paymentStatus && (
                                    <Badge variant={member.paymentStatus === 'SUCCESS' ? 'default' : 'outline'}>
                                      {member.paymentStatus}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {member.status === 'PENDING' && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    disabled={actionLoading}
                                    onClick={() =>
                                      handleMemberStatusChange(selectedGroup.id, member.id, 'APPROVED')
                                    }
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={actionLoading}
                                    onClick={() =>
                                      handleMemberStatusChange(selectedGroup.id, member.id, 'REJECTED')
                                    }
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Package & Payment
                        </h3>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Package</label>
                              <select
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                                value={packageForm.packageId}
                                onChange={(e) => handlePackageFormChange('packageId', e.target.value)}
                                disabled={actionLoading}
                              >
                                <option value="">Select a package</option>
                                {packageOptions.map((pkg) => (
                                  <option key={pkg.id} value={pkg.id}>
                                    {pkg.name || 'Unnamed Package'}
                                  </option>
                                ))}
                              </select>
                              {packageOptions.length === 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  No packages found for this trip. Create one in the admin panel first.
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Per-Person Cost (₹)</label>
                              <Input
                                type="number"
                                min="0"
                                value={packageForm.perPersonCost}
                                onChange={(e) => handlePackageFormChange('perPersonCost', e.target.value)}
                                placeholder="Enter amount"
                                disabled={actionLoading}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Payment Deadline</label>
                              <Input
                                type="datetime-local"
                                value={packageForm.paymentDeadline}
                                onChange={(e) => handlePackageFormChange('paymentDeadline', e.target.value)}
                                disabled={actionLoading}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Leave empty to use the default 24-hour deadline.
                              </p>
                            </div>
                            <Button
                              onClick={handleSetGroupPackage}
                              disabled={
                                actionLoading ||
                                (selectedGroup.currentSize || 0) < (selectedGroup.groupSize || 0)
                              }
                            >
                              {selectedGroup.selectedPackageId ? 'Update Package' : 'Set Package'}
                            </Button>
                            {(selectedGroup.currentSize || 0) < (selectedGroup.groupSize || 0) && (
                              <p className="text-xs text-red-500">
                                Approve pending members before offering a package.
                              </p>
                            )}
                          </div>

                          <div className="space-y-4">
                            {selectedGroup.selectedPackage && (
                              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 space-y-2">
                                <h4 className="font-semibold">{selectedGroup.selectedPackage.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Bus: {selectedGroup.selectedPackage.bus?.busName || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Hotel: {selectedGroup.selectedPackage.hotel?.name || 'N/A'}
                                </p>
                                <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <DollarSign className="h-4 w-4" />
                                  Per Person: {formatCurrency(selectedGroup.perPersonCost)}
                                </p>
                                {selectedGroup.paymentDeadline && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Deadline: {formatDateTimeDisplay(selectedGroup.paymentDeadline)}
                                  </p>
                                )}
                              </div>
                            )}

                            {paymentSummary && (
                              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 space-y-2">
                                <h4 className="font-semibold flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4" />
                                  Payment Summary
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Total Members: {paymentSummary.summary?.totalMembers || 0}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Paid: {paymentSummary.summary?.paidMembers || 0}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Pending: {paymentSummary.summary?.pendingMembers || 0}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Failed: {paymentSummary.summary?.failedMembers || 0}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Total Collected: {formatCurrency(paymentSummary.summary?.totalCollected || 0)}
                                </p>
                                <Badge variant={paymentSummary.summary?.allPaid ? 'default' : 'outline'}>
                                  {paymentSummary.summary?.allPaid ? 'All Members Paid' : 'Awaiting Payments'}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const formatDateTimeForInput = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

const formatDateTimeDisplay = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (amount) => {
  if (!amount) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

const getMemberBadgeVariant = (status) => MEMBER_STATUS_BADGE[status] || 'outline'

export default AdminDashboard


