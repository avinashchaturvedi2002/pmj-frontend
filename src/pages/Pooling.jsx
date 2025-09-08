import { useState } from 'react'
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
  UserPlus
} from 'lucide-react'
import { motion } from 'framer-motion'

const Pooling = () => {
  const [activeTab, setActiveTab] = useState('browse')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDestination, setFilterDestination] = useState('')

  const [createForm, setCreateForm] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    maxPeople: '',
    budget: '',
    description: ''
  })

  // Mock data for existing trips
  const existingTrips = [
    {
      id: 1,
      destination: 'Goa, India',
      startDate: '2024-03-15',
      endDate: '2024-03-20',
      currentPeople: 2,
      maxPeople: 4,
      budget: '₹25,000',
      description: 'Looking for travel buddies to explore Goa\'s beaches and nightlife! We love adventure and photography.',
      organizer: 'Priya S.',
      organizerAvatar: 'https://via.placeholder.com/40',
      joined: false
    },
    {
      id: 2,
      destination: 'Kashmir, India',
      startDate: '2024-04-10',
      endDate: '2024-04-17',
      currentPeople: 1,
      maxPeople: 3,
      budget: '₹35,000',
      description: 'First time visiting Kashmir! Looking for fellow travelers to share houseboat and shikara experiences.',
      organizer: 'Arjun M.',
      organizerAvatar: 'https://via.placeholder.com/40',
      joined: false
    },
    {
      id: 3,
      destination: 'Kerala, India',
      startDate: '2024-05-05',
      endDate: '2024-05-12',
      currentPeople: 3,
      maxPeople: 6,
      budget: '₹20,000',
      description: 'Backwater cruise and tea plantation tours! Perfect for nature lovers and budget travelers.',
      organizer: 'Sneha L.',
      organizerAvatar: 'https://via.placeholder.com/40',
      joined: true
    },
    {
      id: 4,
      destination: 'Rajasthan, India',
      startDate: '2024-06-01',
      endDate: '2024-06-08',
      currentPeople: 1,
      maxPeople: 2,
      budget: '₹30,000',
      description: 'Palace tours, desert safari, and cultural experiences! Perfect for history and culture enthusiasts.',
      organizer: 'Raj K.',
      organizerAvatar: 'https://via.placeholder.com/40',
      joined: false
    },
    {
      id: 5,
      destination: 'Singapore',
      startDate: '2024-07-01',
      endDate: '2024-07-05',
      currentPeople: 2,
      maxPeople: 4,
      budget: '₹80,000',
      description: 'City tour, Sentosa Island, and amazing food! Looking for foodie travel companions.',
      organizer: 'Anita P.',
      organizerAvatar: 'https://via.placeholder.com/40',
      joined: false
    }
  ]

  const filteredTrips = existingTrips.filter(trip => {
    const matchesSearch = trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = !filterDestination || trip.destination.toLowerCase().includes(filterDestination.toLowerCase())
    return matchesSearch && matchesFilter
  })

  const handleCreateTrip = (e) => {
    e.preventDefault()
    // Mock trip creation
    console.log('Creating trip:', createForm)
    setShowCreateForm(false)
    setCreateForm({
      destination: '',
      startDate: '',
      endDate: '',
      maxPeople: '',
      budget: '',
      description: ''
    })
    // Show success message or redirect
  }

  const handleJoinTrip = (tripId) => {
    // Mock join trip functionality
    console.log('Joining trip:', tripId)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCreateForm(prev => ({
      ...prev,
      [name]: value
    }))
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

        {/* Trip Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTrips.map((trip, index) => (
            <motion.div
              key={trip.id}
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
                        <CardTitle className="text-lg">{trip.destination}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{trip.startDate} - {trip.endDate}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={trip.joined ? "default" : "secondary"}>
                      {trip.joined ? "Joined" : "Available"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{trip.currentPeople}/{trip.maxPeople} people</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>{trip.budget}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {trip.description}
                    </p>
                    
                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <img
                        src={trip.organizerAvatar}
                        alt={trip.organizer}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Organized by {trip.organizer}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      {trip.joined ? (
                        <Button variant="outline" className="flex-1" disabled>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Chat
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleJoinTrip(trip.id)}
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
          ))}
        </motion.div>

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
                  <CardTitle>Create New Trip</CardTitle>
                  <CardDescription>
                    Share your travel plans and find like-minded travelers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTrip} className="space-y-4">
                    <div>
                      <Label htmlFor="destination">Destination</Label>
                      <Input
                        id="destination"
                        name="destination"
                        value={createForm.destination}
                        onChange={handleInputChange}
                        placeholder="e.g., Paris, France"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          name="startDate"
                          type="date"
                          value={createForm.startDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          name="endDate"
                          type="date"
                          value={createForm.endDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="maxPeople">Max People</Label>
                        <Input
                          id="maxPeople"
                          name="maxPeople"
                          type="number"
                          min="2"
                          max="10"
                          value={createForm.maxPeople}
                          onChange={handleInputChange}
                          placeholder="4"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="budget">Budget per Person</Label>
                        <Input
                          id="budget"
                          name="budget"
                          value={createForm.budget}
                          onChange={handleInputChange}
                          placeholder="₹25,000"
                          required
                        />
                      </div>
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
                        required
                      />
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                      <Button type="submit" className="flex-1">
                        Create Trip
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

export default Pooling

