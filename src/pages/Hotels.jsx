import { useState, useEffect } from 'react'
import { hotelService } from '../services'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Hotel, MapPin, Star, DollarSign, Loader } from 'lucide-react'
import { motion } from 'framer-motion'

const Hotels = () => {
  const [hotels, setHotels] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    minRating: ''
  })

  useEffect(() => {
    fetchHotels()
  }, [])

  const fetchHotels = async () => {
    setIsLoading(true)
    try {
      const response = await hotelService.getAllHotels(filters)
      setHotels(response.data.hotels || [])
    } catch (error) {
      console.error('Failed to fetch hotels:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleApplyFilters = () => {
    fetchHotels()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Browse Hotels
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find the perfect accommodation for your stay
          </p>
        </motion.div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Hotels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="e.g., Goa"
                />
              </div>
              <div>
                <Label htmlFor="minPrice">Min Price (₹)</Label>
                <Input
                  id="minPrice"
                  name="minPrice"
                  type="number"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="2000"
                />
              </div>
              <div>
                <Label htmlFor="maxPrice">Max Price (₹)</Label>
                <Input
                  id="maxPrice"
                  name="maxPrice"
                  type="number"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="10000"
                />
              </div>
              <div>
                <Label htmlFor="minRating">Min Rating</Label>
                <Input
                  id="minRating"
                  name="minRating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={filters.minRating}
                  onChange={handleFilterChange}
                  placeholder="4.0"
                />
              </div>
            </div>
            <Button onClick={handleApplyFilters} className="mt-4">
              Apply Filters
            </Button>
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Hotel Cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No hotels found</p>
              </div>
            ) : (
              hotels.map((hotel, index) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Hotel className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{hotel.name}</CardTitle>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{hotel.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{hotel.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {hotel.totalRooms} rooms
                          </span>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              ₹{hotel.pricePerRoom}
                            </div>
                            <span className="text-xs text-gray-500">per night</span>
                          </div>
                        </div>

                        {hotel.amenities && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 mb-2">Amenities:</p>
                            <div className="flex flex-wrap gap-1">
                              {hotel.amenities.split(',').slice(0, 4).map((amenity, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  {amenity.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button className="w-full mt-2">
                          View Rooms
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Hotels


