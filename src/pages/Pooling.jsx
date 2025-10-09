import { useState, useEffect } from 'react'
import { usePoolingStore } from '../store/poolingStore'
import { useTripStore } from '../store/tripStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Search,
  Filter,
  MessageCircle,
  UserPlus,
  Loader
} from 'lucide-react'
import { motion } from 'framer-motion'

const Pooling = () => {
  const [activeTab, setActiveTab] = useState('browse')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDestination, setFilterDestination] = useState('')
  
  const { poolGroups, myPoolGroups, isLoading, fetchPoolGroups, fetchMyPoolGroups, createPoolGroup, joinPoolGroup } = usePoolingStore()
  const { trips, fetchTrips } = useTripStore()

  const [createForm, setCreateForm] = useState({
    tripId: '',
    groupSize: '',
    description: ''
  })

  useEffect(() => {
    // Fetch pool groups and user trips on mount
    fetchPoolGroups({ status: 'OPEN' })
    fetchTrips()
  }, [fetchPoolGroups, fetchTrips])

  useEffect(() => {
    if (activeTab === 'my-trips') {
      fetchMyPoolGroups()
    }
  }, [activeTab, fetchMyPoolGroups])

  const filteredTrips = (activeTab === 'browse' ? poolGroups : myPoolGroups).filter(trip => {
    const matchesSearch = trip.trip?.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = !filterDestination || trip.trip?.destination.toLowerCase().includes(filterDestination.toLowerCase())
    return matchesSearch && matchesFilter
  })

  const handleCreateTrip = async (e) => {
    e.preventDefault()
    
    const result = await createPoolGroup(createForm)
    
    if (result.success) {
      setShowCreateForm(false)
      setCreateForm({
        tripId: '',
        groupSize: '',
        description: ''
      })
      // Refresh pool groups
      fetchPoolGroups({ status: 'OPEN' })
      fetchMyPoolGroups()
    } else {
      alert(result.error || 'Failed to create pool group')
    }
  }

  const handleJoinTrip = async (groupId) => {
    const result = await joinPoolGroup(groupId)
    
    if (result.success) {
      alert(result.message || 'Join request sent successfully!')
      fetchPoolGroups({ status: 'OPEN' })
    } else {
      alert(result.error || 'Failed to join group')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCreateForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Travel Pooling
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with fellow travelers and share your journey
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button onClick={() => setShowCreateForm(true)} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Trip</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex space-x-4 mb-8"
        >
          <Button
            variant={activeTab === 'browse' ? 'default' : 'outline'}
            onClick={() => setActiveTab('browse')}
          >
            Browse Trips
          </Button>
          <Button
            variant={activeTab === 'my-trips' ? 'default' : 'outline'}
            onClick={() => setActiveTab('my-trips')}
          >
            My Trips
          </Button>
        </motion.div>

        {/* Search and Filter */}
        {activeTab === 'browse' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search destinations or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Filter by destination..."
                  value={filterDestination}
                  onChange={(e) => setFilterDestination(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Trip Cards */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTrips.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {activeTab === 'browse' 
                    ? 'No pool groups available. Create one to get started!' 
                    : 'You haven\'t created or joined any pool groups yet.'}
                </p>
              </div>
            ) : (
              filteredTrips.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <CardTitle className="text-lg">{group.trip?.destination || 'N/A'}</CardTitle>
                          </div>
                          <div className="flex flex-col space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {formatDate(group.trip?.startDate)} - {formatDate(group.trip?.endDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={group.status === 'OPEN' ? "default" : "secondary"}>
                          {group.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span>{group.currentSize}/{group.groupSize} people</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span>₹{group.trip?.budget || 'N/A'}</span>
                          </div>
                        </div>
                        
                        {group.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {group.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {group.createdBy?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Organized by {group.createdBy?.name || 'Unknown'}
                          </span>
                        </div>
                        
                        <div className="flex space-x-2">
                          {activeTab === 'my-trips' ? (
                            <Button variant="outline" className="flex-1" disabled>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Your Group
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleJoinTrip(group.id)}
                                disabled={group.status !== 'OPEN'}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Join Trip
                              </Button>
                              <Button variant="outline" size="icon">
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Create Trip Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Create New Pool Group</CardTitle>
                  <CardDescription>
                    Share your travel plans and find like-minded travelers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTrip} className="space-y-4">
                    <div>
                      <Label htmlFor="tripId">Select Your Trip</Label>
                      <select
                        id="tripId"
                        name="tripId"
                        value={createForm.tripId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">Choose a trip...</option>
                        {trips.map(trip => (
                          <option key={trip.id} value={trip.id}>
                            {trip.source} → {trip.destination} ({formatDate(trip.startDate)})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Don't have a trip? <a href="/plan-trip" className="text-primary">Create one first</a>
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="groupSize">Max Group Size</Label>
                      <Input
                        id="groupSize"
                        name="groupSize"
                        type="number"
                        min="2"
                        max="10"
                        value={createForm.groupSize}
                        onChange={handleInputChange}
                        placeholder="4"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        name="description"
                        value={createForm.description}
                        onChange={handleInputChange}
                        placeholder="Tell others about your trip plans and what you're looking for..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                        rows="3"
                      />
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                      <Button type="submit" className="flex-1" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Pool Group'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default Pooling
