import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTripStore } from '../store/tripStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { MapPin, Calendar, Users, DollarSign, Plane, Loader } from 'lucide-react'
import { motion } from 'framer-motion'

const TripPlan = () => {
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    budget: '',
    days: '',
    people: ''
  })
  const [errors, setErrors] = useState({})
  
  const { planTrip, isLoading } = useTripStore()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.source.trim()) {
      newErrors.source = 'Source location is required'
    }
    
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required'
    }
    
    if (!formData.budget) {
      newErrors.budget = 'Budget is required'
    } else if (isNaN(formData.budget) || formData.budget <= 0) {
      newErrors.budget = 'Please enter a valid budget amount'
    }
    
    if (!formData.days) {
      newErrors.days = 'Number of days is required'
    } else if (isNaN(formData.days) || formData.days <= 0) {
      newErrors.days = 'Please enter a valid number of days'
    }
    
    if (!formData.people) {
      newErrors.people = 'Number of people is required'
    } else if (isNaN(formData.people) || formData.people <= 0) {
      newErrors.people = 'Please enter a valid number of people'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    const result = await planTrip(formData)
    
    if (result.success) {
      navigate('/suggestions')
    } else {
      setErrors({ general: result.error || 'Failed to plan trip' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Plan Your Trip
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Tell us about your travel preferences and we'll create a personalized plan for you
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plane className="h-6 w-6 text-primary" />
                <span>Trip Details</span>
              </CardTitle>
              <CardDescription>
                Fill in the details below to get started with your travel planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                    {errors.general}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="source">From (Source)</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="source"
                        name="source"
                        type="text"
                        required
                        className={`pl-10 ${errors.source ? 'border-red-500' : ''}`}
                        placeholder="Enter your starting location"
                        value={formData.source}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.source && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.source}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="destination">To (Destination)</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="destination"
                        name="destination"
                        type="text"
                        required
                        className={`pl-10 ${errors.destination ? 'border-red-500' : ''}`}
                        placeholder="Enter your destination"
                        value={formData.destination}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.destination && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.destination}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="budget">Budget (INR)</Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="budget"
                        name="budget"
                        type="number"
                        min="1"
                        required
                        className={`pl-10 ${errors.budget ? 'border-red-500' : ''}`}
                        placeholder="50000"
                        value={formData.budget}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.budget && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.budget}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="days">Number of Days</Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="days"
                        name="days"
                        type="number"
                        min="1"
                        max="30"
                        required
                        className={`pl-10 ${errors.days ? 'border-red-500' : ''}`}
                        placeholder="5"
                        value={formData.days}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.days && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.days}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="people">Number of People</Label>
                    <div className="relative mt-1">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="people"
                        name="people"
                        type="number"
                        min="1"
                        max="10"
                        required
                        className={`pl-10 ${errors.people ? 'border-red-500' : ''}`}
                        placeholder="2"
                        value={formData.people}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.people && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.people}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Planning Your Trip...
                      </>
                    ) : (
                      'Plan My Trip'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💡 Planning Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Be specific with locations for better recommendations</li>
                <li>• Include all travel expenses in your budget in INR (transport, accommodation, food, activities)</li>
                <li>• Consider travel time when planning your days</li>
                <li>• Group size affects accommodation and transport options</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default TripPlan
