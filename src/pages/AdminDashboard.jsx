import { useState, useEffect } from 'react'
import { adminService, poolingService, packageService, busService, hotelService } from '../services'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { cn } from '../lib/utils'
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
  AlertCircle,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Bus,
  Hotel
} from 'lucide-react'
import { Navigate } from 'react-router-dom'

const POOL_STATUS_OPTIONS = ['OPEN', 'CLOSED', 'LOCKED']
const USER_PAGE_SIZE = 10
const MAX_RECOMMENDED_PACKAGES = 5
const ROOM_OCCUPANCY = 2
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
  const [poolingTab, setPoolingTab] = useState('requests')
  const [poolGroups, setPoolGroups] = useState([])
  const [groupStatusFilter, setGroupStatusFilter] = useState('OPEN')
  const [poolGroupsLoading, setPoolGroupsLoading] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [groupDetailsLoading, setGroupDetailsLoading] = useState(false)
  const [packageRecommendations, setPackageRecommendations] = useState([])
  const [packageRecommendationsLoading, setPackageRecommendationsLoading] = useState(false)
  const [packageRecommendationsError, setPackageRecommendationsError] = useState(null)
  const [selectedPackageRecommendation, setSelectedPackageRecommendation] = useState(null)
  const [packageForm, setPackageForm] = useState({
    packageId: '',
    perPersonCost: '',
    paymentDeadline: ''
  })
  const [paymentSummary, setPaymentSummary] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [enforcingDeadline, setEnforcingDeadline] = useState(false)
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [paymentSnapshots, setPaymentSnapshots] = useState({})
  const [paymentSnapshotLoading, setPaymentSnapshotLoading] = useState({})
  const [usersLoading, setUsersLoading] = useState(false)
  const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: USER_PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  })

  const overviewData = stats?.overview || {}
  const revenueData = stats?.revenue || {}
  const recentBookings = stats?.recentBookings || []
  const overviewMetrics = [
    {
      label: 'Total Users',
      value: overviewData.totalUsers ?? 0
    },
    {
      label: 'Total Trips',
      value: overviewData.totalTrips ?? 0
    },
    {
      label: 'Total Bookings',
      value: overviewData.totalBookings ?? 0
    },
    {
      label: 'Pool Groups',
      value: overviewData.totalPoolGroups ?? 0
    },
    {
      label: 'Pending Requests',
      value: overviewData.pendingRequests ?? 0
    },
    {
      label: 'Total Buses',
      value: overviewData.totalBuses ?? 0
    },
    {
      label: 'Total Hotels',
      value: overviewData.totalHotels ?? 0
    },
    {
      label: 'Total Packages',
      value: overviewData.totalPackages ?? 0
    }
  ]

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      return
    }
    if (activeTab === 'overview') {
      fetchDashboardStats()
    } else if (activeTab === 'users') {
      fetchUsers(1)
    }
  }, [activeTab, user])

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      return
    }
    if (activeTab !== 'pooling') {
      return
    }

    if (poolingTab === 'requests') {
      fetchPendingRequests()
    } else {
      fetchPoolGroups(groupStatusFilter)
    }
  }, [activeTab, poolingTab, groupStatusFilter, user])

  const fetchDashboardStats = async () => {
    setIsLoading(true)
    try {
      const response = await adminService.getDashboardStats()
      const payload = response?.data?.data ?? response?.data ?? null
      setStats(payload)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async (page = 1) => {
    setUsersLoading(true)
    try {
      const response = await adminService.getAllUsers({
        page,
        limit: USER_PAGE_SIZE
      })
      const responseData = response?.data ?? {}
      const payload = responseData.data ?? responseData ?? {}
      const list =
        payload.users ||
        payload?.data?.users ||
        []
      const pagination =
      response.pagination ||
        responseData.pagination ||
        payload.pagination ||
        responseData?.meta ||
        {}

      const normalizedUsers = Array.isArray(list) ? list : []

      const toPositiveNumber = (value) => {
        const parsed = Number(value)
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
      }

      const currentPage =
        toPositiveNumber(pagination.page) ??
        toPositiveNumber(responseData.page) ??
        page
      const limit =
        toPositiveNumber(pagination.limit) ??
        toPositiveNumber(responseData.limit) ??
        USER_PAGE_SIZE
      const resolvedTotal =
        toPositiveNumber(pagination.total) ??
        toPositiveNumber(responseData.total)
      const resolvedTotalPages =
        toPositiveNumber(pagination.totalPages) ??
        (resolvedTotal && limit ? Math.ceil(resolvedTotal / limit) : undefined)
      const totalPages = resolvedTotalPages ?? currentPage

      setUsers(normalizedUsers)
      setUserPagination({
        page: currentPage,
        limit,
        total: resolvedTotal ?? normalizedUsers.length,
        totalPages,
        hasNextPage: pagination.hasNextPage ?? currentPage < totalPages,
        hasPrevPage: pagination.hasPrevPage ?? currentPage > 1
      })
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  const fetchPendingRequests = async () => {
    setRequestsLoading(true)
    try {
      const response = await adminService.getPendingRequests()
      const payload = response?.data?.data ?? response?.data ?? {}
      const requests = payload.requests || payload?.data?.requests || []
      setPendingRequests(Array.isArray(requests) ? requests : [])
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    } finally {
      setRequestsLoading(false)
    }
  }

  const fetchPoolGroups = async (status) => {
    setPoolGroupsLoading(true)
    try {
      const response = await poolingService.getAllPoolGroups({ status })
      const payload = response?.data?.data ?? response?.data ?? {}
      const rawGroups = payload.poolGroups || payload?.data?.poolGroups || []
      const normalizedGroups = Array.isArray(rawGroups) ? rawGroups : []
      setPoolGroups(normalizedGroups)

      if (selectedGroupId && !normalizedGroups.some((group) => group.id === selectedGroupId)) {
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
      const group = response.data?.poolGroup || response.data?.data?.poolGroup || response.data

      if (group) {
        console.log('Fetched group details:', {
          id: group.id,
          membersCount: group.members?.length || 0,
          members: group.members
        })

        setSelectedGroupId(groupId)
        setSelectedGroup(group)
        setSelectedPackageRecommendation(null)

        await loadPackageRecommendations(group)

        if (group.selectedPackageId && group.paymentDeadline) {
          await loadPaymentSummary(groupId)
        }

        setPackageForm({
          packageId: group.selectedPackageId || '',
          perPersonCost: group.perPersonCost ? String(group.perPersonCost) : '',
          paymentDeadline: group.paymentDeadline
            ? formatDateTimeForInput(group.paymentDeadline)
            : ''
        })
      } else {
        console.warn('No group data found in response:', response)
      }
    } catch (error) {
      console.error('Failed to fetch pool group details:', error)
    } finally {
      setGroupDetailsLoading(false)
    }
  }

  const loadPackageRecommendations = async (group) => {
    if (!group?.trip) {
      setPackageRecommendations([])
      setPackageRecommendationsError('Trip details are unavailable for this group.')
      return
    }

    setPackageRecommendationsLoading(true)
    setPackageRecommendationsError(null)
    setPackageRecommendations([])

    const groupSize = Math.max(Number(group.groupSize) || 0, Number(group.currentSize) || 0)
    const totalBudget = Number(group.trip?.budget) || 0
    const perPersonBudget = groupSize > 0 ? totalBudget / groupSize : 0
    const nights = calculateTripNights(group.trip?.startDate, group.trip?.endDate)

    if (!perPersonBudget || perPersonBudget <= 0) {
      setPackageRecommendationsError('Group budget details are missing, so packages cannot be generated.')
      setPackageRecommendationsLoading(false)
      return
    }

    if (!groupSize) {
      setPackageRecommendationsError('Group size is missing or zero, so packages cannot be generated.')
      setPackageRecommendationsLoading(false)
      return
    }

    try {
      const busFilters = { limit: 50 }
      if (groupSize > 0) {
        busFilters.minCapacity = groupSize
      }

      const hotelFilters = { limit: 50 }
      if (group.trip?.destination) {
        hotelFilters.location = group.trip.destination
      }

      const [busesResponse, hotelsResponse] = await Promise.all([
        busService.getAllBuses(busFilters),
        hotelService.getAllHotels(hotelFilters)
      ])

      const busesPayload = busesResponse?.data?.data ?? busesResponse?.data ?? {}
      const hotelsPayload = hotelsResponse?.data?.data ?? hotelsResponse?.data ?? {}

      const rawBuses =
        busesPayload.buses ||
        busesPayload?.data?.buses ||
        busesResponse?.data?.buses ||
        []

      const rawHotels =
        hotelsPayload.hotels ||
        hotelsPayload?.data?.hotels ||
        hotelsResponse?.data?.hotels ||
        []

      const recommendations = buildPackageRecommendations({
        buses: Array.isArray(rawBuses) ? rawBuses : [],
        hotels: Array.isArray(rawHotels) ? rawHotels : [],
        group,
        groupSize,
        perPersonBudget,
        nights
      })

      setPackageRecommendations(recommendations)

      if (recommendations.length === 0) {
        setPackageRecommendationsError('No packages found within the per-person budget.')
      }
    } catch (error) {
      console.error('Failed to load package recommendations:', error)
      setPackageRecommendations([])
      setPackageRecommendationsError(
        error?.response?.data?.message || error.message || 'Failed to load packages'
      )
    } finally {
      setPackageRecommendationsLoading(false)
    }
  }

  const handleUpdateRole = async (userId, newRole) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return

    try {
      await adminService.updateUserRole(userId, newRole)
      alert('User role updated successfully')
      fetchUsers(userPagination.page)
    } catch (error) {
      alert(error.message || 'Failed to update user role')
    }
  }

  const handleUsersPrevPage = () => {
    if (userPagination.hasPrevPage) {
      fetchUsers(Math.max(1, userPagination.page - 1))
    }
  }

  const handleUsersNextPage = () => {
    if (userPagination.hasNextPage) {
      fetchUsers(userPagination.page + 1)
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
      await fetchPoolGroups(groupStatusFilter)
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
    if (!selectedGroupId) {
      console.error('No group selected')
      alert('No group selected. Please select a group first.')
      return
    }

    if (!selectedPackageRecommendation && !packageForm.packageId && !selectedGroup?.selectedPackageId) {
      console.error('No package selected')
      alert('Please select a package option above to set a new package, or update the deadline if a package is already set.')
      return
    }

    if (!packageForm.paymentDeadline) {
      console.error('No payment deadline set')
      alert('Please set a payment deadline for group members.')
      return
    }

    const deadlineDate = new Date(packageForm.paymentDeadline)
    if (Number.isNaN(deadlineDate.getTime())) {
      console.error('Invalid deadline date')
      alert('Invalid payment deadline date. Please select a valid date and time.')
      return
    }


    const perPersonCostValue = parseInt(packageForm.perPersonCost, 10)
    if (Number.isNaN(perPersonCostValue) || perPersonCostValue <= 0) {
      console.error('Invalid per person cost:', packageForm.perPersonCost)
      alert('Unable to determine a valid per-person cost for the selected package.')
      return
    }

    console.log('Setting package with:', {
      selectedGroupId,
      packageId: packageForm.packageId,
      selectedPackageRecommendation: selectedPackageRecommendation?.id,
      perPersonCost: perPersonCostValue,
      paymentDeadline: packageForm.paymentDeadline
    })

    setActionLoading(true)
    try {
      let packageId = packageForm.packageId || selectedGroup?.selectedPackageId

      if (selectedPackageRecommendation) {
        if (!packageId || packageId !== selectedPackageRecommendation.id) {
          console.log('Creating new package from recommendation')
          const recommendation = selectedPackageRecommendation
          const packageName = `${recommendation.bus?.busName || 'Bus'} + ${recommendation.hotel?.name || 'Hotel'}`

          const createResponse = await packageService.createPackage({
            name: `${selectedGroup?.trip?.destination || 'Group Trip'} - ${packageName}`,
            description: `Auto-generated package for pool group ${selectedGroupId}`,
            tripId: selectedGroup?.tripId,
            poolGroupId: selectedGroupId,
            busId: recommendation.bus.id,
            hotelId: recommendation.hotel.id,
            price: recommendation.pricing.totalGroupCost,
            discount: 0
          })

          const createdPackage =
            createResponse?.data?.data?.package ||
            createResponse?.data?.package ||
            createResponse?.data

          packageId = createdPackage?.id

          if (!packageId) {
            console.error('Failed to create package:', createResponse)
            throw new Error('Package could not be created. Please try again.')
          }

          console.log('Package created with ID:', packageId)
          setPackageForm((prev) => ({
            ...prev,
            packageId
          }))
        }
      }

      if (!packageId) {
        throw new Error('No package ID available. Please select a package.')
      }

      console.log('Setting/updating group package with packageId:', packageId)
      const isUpdate = !!selectedGroup?.selectedPackageId
      await poolingService.setGroupPackage(selectedGroupId, {
        packageId,
        perPersonCost: perPersonCostValue,
        paymentDeadline: new Date(packageForm.paymentDeadline).toISOString()
      })
      alert(isUpdate 
        ? 'Package and payment deadline updated successfully.' 
        : 'Package and payment deadline set successfully. Members must complete payment before the deadline.')
      await fetchGroupDetails(selectedGroupId)
      await fetchPoolGroups(groupStatusFilter)
    } catch (error) {
      console.error('Error setting package:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to set package'
      alert(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSelectPackageRecommendation = (recommendation) => {
    if (!recommendation) return

    setSelectedPackageRecommendation(recommendation)
    setPackageForm((prev) => ({
      ...prev,
      packageId: '',
      perPersonCost: String(recommendation.pricing.perPersonCost)
    }))
  }

  const loadPaymentSummary = async (groupId) => {
    if (!groupId) return null

    setPaymentSnapshotLoading((prev) => ({
      ...prev,
      [groupId]: true
    }))

    try {
      const response = await poolingService.checkGroupPaymentStatus(groupId)
      const snapshot = response.data
      setPaymentSnapshots((prev) => ({
        ...prev,
        [groupId]: snapshot
      }))
      return snapshot
    } catch (error) {
      console.error('Failed to fetch payment summary:', error)
      return null
    } finally {
      setPaymentSnapshotLoading((prev) => ({
        ...prev,
        [groupId]: false
      }))
    }
  }

  const handleCheckPayments = async () => {
    if (!selectedGroupId) return

    setActionLoading(true)
    const snapshot = await loadPaymentSummary(selectedGroupId)
    if (!snapshot) {
      alert('Failed to fetch payment status')
    } else {
      setPaymentSummary(snapshot)
    }
    setActionLoading(false)
  }

  const handleLoadPaymentSnapshot = async (groupId) => {
    const snapshot = await loadPaymentSummary(groupId)
    if (!snapshot) {
      alert('Failed to fetch payment status')
    }
  }

  const handleLockGroup = async () => {
    if (!selectedGroupId) return

    const isGroupFull = (selectedGroup?.currentSize || 0) >= (selectedGroup?.groupSize || 0)
    if (!isGroupFull) {
      alert(`Group is not full yet. Current size: ${selectedGroup?.currentSize || 0}/${selectedGroup?.groupSize || 0}. Please wait until the group is full before locking.`)
      return
    }

    if (!paymentSummary?.summary?.allPaid) {
      const paidCount = paymentSummary?.summary?.paidMembers || 0
      const totalCount = paymentSummary?.summary?.totalMembers || 0
      alert(`Not all members have completed payment. ${paidCount}/${totalCount} members have paid. Please wait until all members have paid before locking the group.`)
      return
    }

    if (!confirm('Are you sure you want to lock this group? This will finalize the group and create bookings. This action cannot be undone.')) {
      return
    }

    setActionLoading(true)
    try {
      await poolingService.lockGroup(selectedGroupId)
      alert('Group locked successfully. Bookings have been created for all members.')
      await fetchGroupDetails(selectedGroupId)
      await fetchPoolGroups(groupStatusFilter)
    } catch (error) {
      alert(error?.response?.data?.message || error.message || 'Failed to lock group')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEnforceDeadline = async () => {
    if (!selectedGroupId) return

    if (!selectedGroup?.paymentDeadline) {
      alert('No payment deadline set for this group.')
      return
    }

    const deadlineDate = new Date(selectedGroup.paymentDeadline)
    if (deadlineDate > new Date()) {
      alert('Payment deadline has not passed yet. You can only enforce the deadline after it has passed.')
      return
    }

    if (!confirm('Are you sure you want to remove all members who have not completed payment? This action cannot be undone.')) {
      return
    }

    setEnforcingDeadline(true)
    try {
      const response = await poolingService.enforcePaymentDeadline(selectedGroupId)
      const removedCount = response?.data?.removedMembers?.length || 0
      alert(`Payment deadline enforced. ${removedCount} member(s) who did not pay have been removed from the group.`)
      await fetchGroupDetails(selectedGroupId)
      await fetchPoolGroups(groupStatusFilter)
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

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        

        <div className="flex flex-wrap gap-3 mb-8">
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
            variant={activeTab === 'pooling' ? 'default' : 'outline'}
            onClick={() => setActiveTab('pooling')}
          >
            Pooling
          </Button>
        </div>

        {isLoading && activeTab !== 'pooling' && (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {overviewMetrics.map(({ label, value }) => (
                <Card key={label}>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {formatNumber(value)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Revenue</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Aggregated totals from confirmed bookings
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(revenueData.total)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500 dark:text-gray-400">Average Per Booking</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(revenueData.average)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Latest confirmed bookings with traveller and destination details
                  </p>
                </CardHeader>
                <CardContent>
                  {recentBookings.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No recent bookings found.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recentBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-200 dark:border-gray-700 rounded-md p-3"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {booking.user?.name || 'Unknown Traveller'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Destination: {booking.trip?.destination || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDateTimeDisplay(booking.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{booking.status || 'PENDING'}</Badge>
                            <span className="text-sm font-semibold text-primary">
                              {formatCurrency(booking.totalPrice)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {stats?.recentUsers && stats.recentUsers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Registrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentUsers.map((recentUser) => (
                      <div
                        key={recentUser.id}
                        className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                      >
                        <div>
                          <p className="font-medium">{recentUser.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{recentUser.email}</p>
                        </div>
                        <Badge variant="secondary">{recentUser.role}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage registered users and promote team members to admins.
              </p>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No users found.
                </p>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border border-gray-200 dark:border-gray-700 rounded-md p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Joined: {new Date(user.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
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
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page {userPagination.page} of {Math.max(1, userPagination.totalPages)}
                  {userPagination.total ? ` • ${formatNumber(userPagination.total)} users` : ''}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUsersPrevPage}
                    disabled={!userPagination.hasPrevPage || usersLoading}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUsersNextPage}
                    disabled={!userPagination.hasNextPage || usersLoading}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'pooling' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={poolingTab === 'requests' ? 'default' : 'outline'}
                onClick={() => setPoolingTab('requests')}
              >
                Requests
              </Button>
              <Button
                variant={poolingTab === 'groups' ? 'default' : 'outline'}
                onClick={() => setPoolingTab('groups')}
              >
                Groups
              </Button>
              <Button
                variant={poolingTab === 'payments' ? 'default' : 'outline'}
                onClick={() => setPoolingTab('payments')}
              >
                Payments
              </Button>
            </div>

            {poolingTab === 'requests' && (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Pool Group Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {requestsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
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
                  )}
                </CardContent>
              </Card>
            )}

            {poolingTab === 'groups' && (
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
                          variant={groupStatusFilter === status ? 'default' : 'outline'}
                          onClick={() => setGroupStatusFilter(status)}
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
                              (selectedGroup?.currentSize || 0) < (selectedGroup?.groupSize || 0) ||
                              !(paymentSummary?.summary?.allPaid)
                            }
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            Lock Group
                          </Button>
                          {((selectedGroup?.currentSize || 0) < (selectedGroup?.groupSize || 0) || !paymentSummary?.summary?.allPaid) && (
                            <p className="text-xs text-gray-500 mt-1">
                              {!(selectedGroup?.currentSize || 0) >= (selectedGroup?.groupSize || 0) && 'Group must be full. '}
                              {!paymentSummary?.summary?.allPaid && 'All members must complete payment. '}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {selectedGroup.trip?.source} → {selectedGroup.trip?.destination}
                        </span>
                        <span>
                          Group Size: {selectedGroup.currentSize || 0}/{selectedGroup.groupSize || 0}
                          {selectedGroup.members && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({selectedGroup.members.filter(m => m.status === 'APPROVED').length} approved, {selectedGroup.members.length} total)
                            </span>
                          )}
                        </span>
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
                              {selectedGroup.members && (
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                  ({selectedGroup.members.length} total)
                                </span>
                              )}
                            </h3>
                            {!selectedGroup.members || selectedGroup.members.length === 0 ? (
                              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                No members found in this group.
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {selectedGroup.members.map((member) => {
                                  const isPaid = member.status === 'PAID' || member.paymentStatus === 'SUCCESS'
                                  const isPendingPayment = ['APPROVED', 'PAYMENT_PENDING'].includes(member.status)
                                  const isOverdue = selectedGroup.paymentDeadline && 
                                    new Date(selectedGroup.paymentDeadline) < new Date() && 
                                    !isPaid && 
                                    isPendingPayment
                                  const isCancelled = member.status === 'CANCELLED' || member.status === 'REJECTED'

                                  return (
                                    <div
                                      key={member.id}
                                      className={cn(
                                        'flex flex-col gap-3 md:flex-row md:items-center md:justify-between border rounded-md p-3',
                                        isPaid 
                                          ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                                          : isOverdue
                                            ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                                            : 'border-gray-200 dark:border-gray-700'
                                      )}
                                    >
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <p className="font-medium">{member.user?.name || 'Unknown User'}</p>
                                          {isPaid && (
                                            <Badge variant="default" className="bg-green-600">
                                              Paid
                                            </Badge>
                                          )}
                                          {isOverdue && (
                                            <Badge variant="destructive">
                                              Overdue
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          {member.user?.email || 'No email'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                          Joined: {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('en-IN') : 'N/A'}
                                          {member.paidAt && (
                                            <span className="ml-2 text-green-600 dark:text-green-400">
                                              • Paid: {new Date(member.paidAt).toLocaleDateString('en-IN')}
                                            </span>
                                          )}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                          <Badge variant={getMemberBadgeVariant(member.status)}>
                                            {member.status}
                                          </Badge>
                                          {member.paymentStatus && 
                                           member.status !== 'PAYMENT_PENDING' && 
                                           member.status !== 'PAID' && 
                                           member.status !== 'PAYMENT_FAILED' && (
                                            <Badge variant={member.paymentStatus === 'SUCCESS' ? 'default' : member.paymentStatus === 'FAILED' ? 'destructive' : 'outline'}>
                                              Payment: {member.paymentStatus}
                                            </Badge>
                                          )}
                                          {member.amountPaid && (
                                            <Badge variant="outline" className="text-green-600 dark:text-green-400">
                                              ₹{formatNumber(member.amountPaid)} paid
                                            </Badge>
                                          )}
                                          {selectedGroup.perPersonCost && !isPaid && !isCancelled && (
                                            <Badge variant="outline" className="text-orange-600 dark:text-orange-400">
                                              Due: ₹{formatNumber(selectedGroup.perPersonCost)}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {member.status === 'PENDING' && (
                                          <>
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
                                          </>
                                        )}
                                        {isOverdue && (
                                          <Badge variant="destructive" className="text-xs">
                                            Will be removed on deadline enforcement
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Package & Payment
                            </h3>
                            <div className="grid gap-6 md:grid-cols-2">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Recommended Packages
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Select a bus and hotel combination within the group budget
                                    {selectedGroup?.trip?.budget && selectedGroup?.groupSize
                                      ? ` (${formatCurrency((selectedGroup.trip.budget || 0) / (selectedGroup.groupSize || 1))} per member)`
                                      : ''}.
                                  </p>
                                </div>

                                {packageRecommendationsLoading ? (
                                  <div className="flex justify-center items-center py-6">
                                    <Loader className="h-5 w-5 animate-spin text-primary" />
                                  </div>
                                ) : packageRecommendations.length > 0 ? (
                                  <div className="space-y-3">
                                    {packageRecommendations.map((recommendation) => {
                                      const isSelected = selectedPackageRecommendation?.id === recommendation.id
                                      return (
                                        <Card
                                          key={recommendation.id}
                                          className={cn(
                                            'border border-gray-200 dark:border-gray-700 transition cursor-pointer',
                                            isSelected ? 'border-primary ring-1 ring-primary/40' : 'hover:border-gray-300 dark:hover:border-gray-600'
                                          )}
                                          onClick={() => handleSelectPackageRecommendation(recommendation)}
                                        >
                                          <CardContent className="p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                              <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                  {recommendation.bus?.busName || 'Bus Option'} +{' '}
                                                  {recommendation.hotel?.name || 'Hotel Option'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                  {recommendation.pricing.nights} night(s) • Rooms needed:{' '}
                                                  {recommendation.pricing.roomsNeeded}
                                                </p>
                                              </div>
                                              <Badge variant="outline">
                                                {formatCurrency(recommendation.pricing.perPersonCost)}
                                              </Badge>
                                            </div>

                                            <div className="grid gap-2 text-xs text-gray-600 dark:text-gray-400 sm:grid-cols-2">
                                              <div className="flex items-center gap-2">
                                                <Bus className="h-4 w-4" />
                                                <span>{recommendation.bus?.busName || 'Bus'}</span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                <span>Seats: {recommendation.bus?.capacity || '-'}</span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <Hotel className="h-4 w-4" />
                                                <span>{recommendation.hotel?.name || 'Hotel'}</span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                <span>
                                                  Bus: ₹{formatNumber(recommendation.pricing.perPersonBusCost)} • Hotel:{' '}
                                                  ₹{formatNumber(recommendation.pricing.perPersonHotelCost)} per member
                                                </span>
                                              </div>
                                            </div>

                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                              <div className="text-sm text-gray-700 dark:text-gray-200">
                                                Total per member:{' '}
                                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                  {formatCurrency(recommendation.pricing.perPersonCost)}
                                                </span>
                                              </div>
                                              <Button
                                                size="sm"
                                                variant={isSelected ? 'default' : 'outline'}
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  handleSelectPackageRecommendation(recommendation)
                                                }}
                                                disabled={actionLoading}
                                              >
                                                {isSelected ? 'Selected' : 'Select'}
                                              </Button>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  <div className="rounded-md border border-dashed border-gray-300 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">
                                    {packageRecommendationsError ||
                                      'No package combinations meet the current budget constraints.'}
                                  </div>
                                )}

                                {(selectedPackageRecommendation || selectedGroup?.selectedPackageId) && (
                                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    {selectedGroup?.selectedPackageId && !selectedPackageRecommendation && (
                                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                          Current Package Selected
                                        </p>
                                        <p className="text-xs text-blue-700 dark:text-blue-300">
                                          To change the package, select a different option above. To only update the deadline, set a new deadline below.
                                        </p>
                                      </div>
                                    )}
                                    <div>
                                      <label className="block text-sm font-medium mb-1">
                                        Payment Deadline <span className="text-red-500">*</span>
                                      </label>
                                      <Input
                                        type="datetime-local"
                                        value={packageForm.paymentDeadline}
                                        onChange={(e) => handlePackageFormChange('paymentDeadline', e.target.value)}
                                        disabled={actionLoading}
                                        required
                                        min={new Date().toISOString().slice(0, 16)}
                                      />
                                      <p className="text-xs text-gray-500 mt-1">
                                        Set or update the payment deadline. Members who don't pay by this deadline will be automatically removed from the group.
                                      </p>
                                      {packageForm.paymentDeadline && (
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                          Deadline: {formatDateTimeDisplay(packageForm.paymentDeadline)}
                                        </p>
                                      )}
                                      {selectedGroup?.paymentDeadline && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Current deadline: {formatDateTimeDisplay(selectedGroup.paymentDeadline)}
                                        </p>
                                      )}
                                    </div>
                                    <div className="space-y-2">
                                      <Button
                                        onClick={handleSetGroupPackage}
                                        disabled={
                                          actionLoading ||
                                          !packageForm.paymentDeadline ||
                                          (!selectedPackageRecommendation && !selectedGroup?.selectedPackageId)
                                        }
                                        className="w-full"
                                      >
                                        {actionLoading 
                                          ? 'Updating...' 
                                          : selectedGroup?.selectedPackageId 
                                            ? (selectedPackageRecommendation ? 'Change Package & Update Deadline' : 'Update Payment Deadline')
                                            : 'Set Package & Payment Deadline'}
                                      </Button>
                                      {!selectedPackageRecommendation && !selectedGroup?.selectedPackageId && (
                                        <p className="text-xs text-orange-500">
                                          Please select a package option above to set a new package, or update the deadline if a package is already set.
                                        </p>
                                      )}
                                      {!packageForm.paymentDeadline && (
                                        <p className="text-xs text-orange-500">
                                          Payment deadline is required.
                                        </p>
                                      )}
                                      {selectedPackageRecommendation && selectedGroup?.selectedPackageId && (
                                        <p className="text-xs text-blue-500">
                                          You are changing the package. The new package will replace the current one.
                                        </p>
                                      )}
                                      {selectedGroup?.selectedPackageId && !selectedPackageRecommendation && (
                                        <p className="text-xs text-green-500">
                                          You can update the payment deadline or select a new package above to change it.
                                        </p>
                                      )}
                                    </div>
                                  </div>
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

            {poolingTab === 'payments' && (
              <Card>
                <CardHeader className="flex flex-col gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Group Payment Snapshots
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Review payment progress across all pool groups and drill into details as needed.
                  </p>
                </CardHeader>
                <CardContent>
                  {poolGroupsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : poolGroups.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No pool groups found. Adjust the status filter on the Groups tab before viewing payments.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {poolGroups.map((group) => {
                        const snapshot = paymentSnapshots[group.id]
                        const loading = paymentSnapshotLoading[group.id]

                        return (
                          <div
                            key={group.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-md p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">
                                  {group.trip?.destination || 'Unknown Destination'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Members: {group.currentSize}/{group.groupSize}
                                </p>
                              </div>
                              <Badge variant="outline">{group.status}</Badge>
                            </div>

                            {snapshot ? (
                              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <p>Total Members: {snapshot.summary?.totalMembers || 0}</p>
                                <p>Paid: {snapshot.summary?.paidMembers || 0}</p>
                                <p>Pending: {snapshot.summary?.pendingMembers || 0}</p>
                                <p>Failed: {snapshot.summary?.failedMembers || 0}</p>
                                <p>
                                  Collected: {formatCurrency(snapshot.summary?.totalCollected || 0)}
                                </p>
                                <Badge variant={snapshot.summary?.allPaid ? 'default' : 'outline'}>
                                  {snapshot.summary?.allPaid ? 'All Paid' : 'Pending Payments'}
                                </Badge>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                Payment summary not loaded yet. Refresh to pull the latest data.
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleLoadPaymentSnapshot(group.id)}
                                disabled={Boolean(loading)}
                                className="flex items-center gap-2"
                              >
                                {loading && <Loader className="h-4 w-4 animate-spin" />}
                                Refresh Summary
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fetchGroupDetails(group.id)}
                              >
                                Manage Group
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
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

const formatNumber = (value) => {
  const number = Number(value || 0)
  if (Number.isNaN(number)) {
    return '0'
  }
  return new Intl.NumberFormat('en-IN').format(number)
}

const formatCurrency = (amount) => {
  const number = Number(amount || 0)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(number)
}

const getMemberBadgeVariant = (status) => MEMBER_STATUS_BADGE[status] || 'outline'

const calculateTripNights = (start, end) => {
  const startDate = start ? new Date(start) : null
  const endDate = end ? new Date(end) : null

  if (!startDate || Number.isNaN(startDate.getTime())) {
    return 1
  }

  if (!endDate || Number.isNaN(endDate.getTime())) {
    return 1
  }

  const diffMs = endDate.getTime() - startDate.getTime()
  if (diffMs <= 0) {
    return 1
  }

  const nights = Math.round(diffMs / (1000 * 60 * 60 * 24))
  return nights > 0 ? nights : 1
}

const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildPackageRecommendations({ buses, hotels, groupSize, perPersonBudget, nights }) {
  if (!Array.isArray(buses) || !Array.isArray(hotels) || groupSize <= 0) {
    return []
  }

  const roomsNeeded = Math.max(1, Math.ceil(groupSize / ROOM_OCCUPANCY))
  const candidates = []

  buses.forEach((bus) => {
    const busId = bus?.id
    const busCapacity = toNumber(bus?.capacity)
    const pricePerSeat = toNumber(bus?.pricePerSeat)

    if (!busId || !pricePerSeat || busCapacity < groupSize) {
      return
    }

    const perPersonBusCost = pricePerSeat * 2

    hotels.forEach((hotel) => {
      const hotelId = hotel?.id
      const pricePerRoom = toNumber(hotel?.pricePerRoom)
      const totalRooms = toNumber(hotel?.totalRooms)

      if (!hotelId || !pricePerRoom) {
        return
      }

      if (totalRooms && totalRooms < roomsNeeded) {
        return
      }

      const perPersonHotelCost = Math.ceil((pricePerRoom * nights) / ROOM_OCCUPANCY)
      const perPersonCost = Math.ceil(perPersonBusCost + perPersonHotelCost)

      if (perPersonCost > perPersonBudget) {
        return
      }

      const totalGroupCost = perPersonCost * groupSize
      const perPersonSavings = Math.max(0, Math.floor(perPersonBudget - perPersonCost))

      candidates.push({
        id: `${busId}-${hotelId}`,
        bus,
        hotel,
        pricing: {
          perPersonCost,
          perPersonBusCost,
          perPersonHotelCost,
          totalGroupCost,
          perPersonBudget,
          perPersonSavings,
          nights,
          roomsNeeded
        }
      })
    })
  })

  candidates.sort((a, b) => a.pricing.perPersonCost - b.pricing.perPersonCost)

  const uniqueRecommendations = []
  const usedBusIds = new Set()
  const usedHotelIds = new Set()
  const usedCombinations = new Set()

  for (const candidate of candidates) {
    if (uniqueRecommendations.length >= MAX_RECOMMENDED_PACKAGES) {
      break
    }

    const combinationKey = `${candidate.bus.id}-${candidate.hotel.id}`
    if (usedCombinations.has(combinationKey)) {
      continue
    }

    if (usedBusIds.has(candidate.bus.id) && usedHotelIds.has(candidate.hotel.id)) {
      continue
    }

    uniqueRecommendations.push(candidate)
    usedBusIds.add(candidate.bus.id)
    usedHotelIds.add(candidate.hotel.id)
    usedCombinations.add(combinationKey)
  }

  if (uniqueRecommendations.length < MAX_RECOMMENDED_PACKAGES) {
    for (const candidate of candidates) {
      if (uniqueRecommendations.length >= MAX_RECOMMENDED_PACKAGES) {
        break
      }

      const combinationKey = `${candidate.bus.id}-${candidate.hotel.id}`
      if (usedCombinations.has(combinationKey)) {
        continue
      }

      uniqueRecommendations.push(candidate)
      usedCombinations.add(combinationKey)
    }
  }

  return uniqueRecommendations
}

export default AdminDashboard


