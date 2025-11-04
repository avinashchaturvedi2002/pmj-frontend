import { useState, useEffect } from 'react'
import { busService } from '../services'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Bus, Users, DollarSign, Wifi, Loader } from 'lucide-react'
import { motion } from 'framer-motion'

const Buses = () => {
  const [buses, setBuses] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minCapacity: ''
  })

  useEffect(() => {
    fetchBuses()
  }, [])

  const fetchBuses = async () => {
    setIsLoading(true)
    try {
      const response = await busService.getAllBuses(filters)
      setBuses(response.data.buses || [])
    } catch (error) {
      console.error('Failed to fetch buses:', error)
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
    fetchBuses()
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
            Browse Buses
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find the perfect bus for your journey
          </p>
        </motion.div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Buses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="minPrice">Min Price (₹)</Label>
                <Input
                  id="minPrice"
                  name="minPrice"
                  type="number"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="500"
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
                  placeholder="2000"
                />
              </div>
              <div>
                <Label htmlFor="minCapacity">Min Capacity</Label>
                <Input
                  id="minCapacity"
                  name="minCapacity"
                  type="number"
                  value={filters.minCapacity}
                  onChange={handleFilterChange}
                  placeholder="30"
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

        {/* Bus Cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No buses found</p>
              </div>
            ) : (
              buses.map((bus, index) => (
                <motion.div
                  key={bus.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Bus className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{bus.busName}</CardTitle>
                          </div>
                          <Badge variant="secondary">{bus.busNumber}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4" />
                            <span>{bus.capacity} seats</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <span className="text-lg font-bold text-primary">₹{bus.pricePerSeat}</span>
                          </div>
                        </div>
                        
                        {bus.amenities && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 mb-2">Amenities:</p>
                            <div className="flex flex-wrap gap-1">
                              {bus.amenities.split(',').map((amenity, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  {amenity.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button className="w-full mt-2">
                          View Seats
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

export default Buses



