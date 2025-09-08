import { useState, useEffect } from 'react'
import { useTripStore } from '../store/tripStore'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { 
  Plane, 
  Train, 
  Bus, 
  Hotel, 
  MapPin, 
  Star, 
  CheckCircle, 
  Circle,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves
} from 'lucide-react'
import { motion } from 'framer-motion'

const Suggestions = () => {
  const { currentTrip, suggestions, getSuggestions, togglePackingItem, isLoading } = useTripStore()
  const [activeTab, setActiveTab] = useState('transport')

  useEffect(() => {
    if (currentTrip) {
      getSuggestions(currentTrip.id)
    }
  }, [currentTrip, getSuggestions])

  const tabs = [
    { id: 'transport', label: 'Transport', icon: Plane },
    { id: 'accommodation', label: 'Accommodation', icon: Hotel },
    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
    { id: 'packing', label: 'Packing List', icon: CheckCircle }
  ]

  const getTransportIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'flight': return Plane
      case 'train': return Train
      case 'bus': return Bus
      default: return Car
    }
  }

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return Wifi
      case 'pool': return Waves
      case 'gym': return Dumbbell
      case 'restaurant': return Utensils
      default: return CheckCircle
    }
  }

  if (!currentTrip) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">No Trip Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please plan a trip first to see suggestions.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
          >
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your Trip to {currentTrip.destination}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {currentTrip.days} days • {currentTrip.people} people • ${currentTrip.budget} budget
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Button>
            )
          })}
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Transport Suggestions */}
            {activeTab === 'transport' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.transport.map((option) => {
                  const Icon = getTransportIcon(option.type)
                  return (
                    <Card key={option.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon className="h-6 w-6 text-primary" />
                            <CardTitle className="text-lg">{option.type}</CardTitle>
                          </div>
                          <Badge variant="secondary">{option.price}</Badge>
                        </div>
                        <CardDescription>{option.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{option.duration}</span>
                          </div>
                        </div>
                        <Button className="w-full mt-4">
                          Select This Option
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Accommodation Suggestions */}
            {activeTab === 'accommodation' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.accommodation.map((hotel) => (
                  <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{hotel.name}</CardTitle>
                        <Badge variant="secondary">{hotel.price}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{hotel.type}</Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{hotel.rating}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Amenities:</h4>
                          <div className="flex flex-wrap gap-2">
                            {hotel.amenities.map((amenity, index) => {
                              const Icon = getAmenityIcon(amenity)
                              return (
                                <div key={index} className="flex items-center space-x-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  <Icon className="h-3 w-3" />
                                  <span>{amenity}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        <Button className="w-full">
                          Book This Hotel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Itinerary */}
            {activeTab === 'itinerary' && (
              <div className="space-y-6">
                {suggestions.itinerary.map((day) => (
                  <Card key={day.day} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span>Day {day.day}: {day.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {day.activities.map((activity, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <span className="text-gray-700 dark:text-gray-300">{activity}</span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Packing List */}
            {activeTab === 'packing' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Packing Checklist</CardTitle>
                    <CardDescription>
                      Check off items as you pack them. Don't forget the essentials!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(
                        suggestions.packing.reduce((acc, item) => {
                          if (!acc[item.category]) {
                            acc[item.category] = []
                          }
                          acc[item.category].push(item)
                          return acc
                        }, {})
                      ).map(([category, items]) => (
                        <div key={category}>
                          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                            {category}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {items.map((item) => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                                  item.packed
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                                onClick={() => togglePackingItem(item.id)}
                              >
                                {item.packed ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-400" />
                                )}
                                <span className={`text-sm ${
                                  item.packed
                                    ? 'text-green-700 dark:text-green-300 line-through'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {item.item}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Suggestions
