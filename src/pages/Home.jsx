import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { MapPin, Users, Calendar, Search, Filter, Loader2 } from 'lucide-react'
import { motion as Motion } from 'framer-motion'
import { Input } from '../components/ui/Input'
import { usePoolingStore } from '../store/poolingStore'

const Home = () => {
  console.log('Home component rendering')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDestination, setFilterDestination] = useState('')
  const poolGroups = usePoolingStore((state) => state.poolGroups)
  const isLoading = usePoolingStore((state) => state.isLoading)
  const error = usePoolingStore((state) => state.error)
  const fetchPoolGroups = usePoolingStore((state) => state.fetchPoolGroups)
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/') {
      fetchPoolGroups({ status: 'OPEN', limit: 6 })
    }
  }, [fetchPoolGroups, location.pathname])

  useEffect(() => {
    const handleFocus = () => {
      if (location.pathname === '/') {
        fetchPoolGroups({ status: 'OPEN', limit: 6 })
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchPoolGroups, location.pathname])

  const destinationImages = useMemo(() => ({
    goa: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop',
    kashmir: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop',
    kerala: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=500&h=300&fit=crop',
    rajasthan: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=500&h=300&fit=crop',
    paris: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=500&h=300&fit=crop',
    singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=500&h=300&fit=crop'
  }), [])

  const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }), [])

  const getDestinationImage = (destination) => {
    if (!destination) {
      return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=300&fit=crop'
    }

    const key = destination.toLowerCase()
    return destinationImages[key] || `https://source.unsplash.com/featured/500x300/?travel,${encodeURIComponent(destination)}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Dates TBD'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return 'Flexible dates'
    }
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '₹0'
    return currencyFormatter.format(amount)
  }

  const buildGroupDescription = (group) => {
    const parts = []

    if (group.createdBy?.name) {
      parts.push(`Organized by ${group.createdBy.name}`)
    }

    if (typeof group.currentSize === 'number' && typeof group.groupSize === 'number') {
      parts.push(`${group.currentSize}/${group.groupSize} joined`)
    }

    if (typeof group._count?.members === 'number') {
      const membersLabel = group._count.members === 1 ? 'member approved' : 'members approved'
      parts.push(`${group._count.members} ${membersLabel}`)
    }

    if (parts.length === 0) {
      return 'Explore this pool group with fellow travelers from our community.'
    }

    return parts.join(' • ')
  }

  const filteredGroups = useMemo(() => {
    return poolGroups.filter((group) => {
      const destination = group.trip?.destination?.toLowerCase() || ''
      const searchValues = [
        group.trip?.destination,
        group.trip?.source,
        group.description,
        group.createdBy?.name
      ]

      const destinationMatch = destination.includes(filterDestination.toLowerCase())
      const searchMatch = searchValues.some((value) => value?.toLowerCase().includes(searchTerm.toLowerCase()))

      return (!filterDestination || destinationMatch) && (!searchTerm || searchMatch)
    })
  }, [poolGroups, searchTerm, filterDestination])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
   <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Hero Section with Background Image */}
<section
  className="relative text-white bg-cover bg-center dark:text-gray-100"
  style={{ backgroundImage: "url('/images/home-bg.jpg')" }}
>
  <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>


        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Plan Your Perfect Journey
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Discover incredible destinations across India and abroad, find travel buddies, and create unforgettable memories
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/plan-trip">
                <Button size="lg" className="bg-white/60 text-black hover:bg-gray-100  hover:scale-105 transform transition hover:bg-white/60">
                  Start Planning
                </Button>
              </Link>
              <Link to="/pooling">
                <Button size="lg"  className="bg-white/60 text-black hover:bg-gray-100  hover:scale-105 transform transition hover:bg-white/60">
                  Find Travel Buddies
                </Button>
              </Link>
            </div>
          </Motion.div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Popular Destinations and Pools to Explore
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Explore India's most beautiful destinations and international favorites, handpicked by our travel community
            </p>
          </Motion.div>









          <Motion.div
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
          </Motion.div>












          <Motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {isLoading && (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {!isLoading && error && (
              <div className="col-span-full text-center text-sm text-red-500 dark:text-red-400">
                {error}
              </div>
            )}

            {!isLoading && !error && filteredGroups.length === 0 && (
              <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
                No pool groups found. Try adjusting your search or create a new trip from the planner.
              </div>
            )}

            {!isLoading && !error && filteredGroups.map((group) => (
              <Motion.div key={group.id} variants={itemVariants}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative">
                    <img
                      src={getDestinationImage(group.trip?.destination)}
                      alt={group.trip?.destination}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        {group.status}
                      </span>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <CardTitle className="text-xl">
                        {group.trip?.source} → {group.trip?.destination}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      {buildGroupDescription(group)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{group.currentSize ?? '—'}/{group.groupSize ?? '—'} people</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateRange(group.trip?.startDate, group.trip?.endDate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {group.perPersonCost
                          ? `${formatCurrency(group.perPersonCost)} / person`
                          : formatCurrency(group.trip?.budget)}
                      </span>
                      <Button asChild size="sm">
                        <Link to="/pooling">
                          View Pool Group
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Motion.div>
            ))}
          </Motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Plan My Journey?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We make travel planning simple, social, and affordable for Indian travelers
            </p>
          </Motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-blue-100 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Planning</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get personalized recommendations for transport, accommodation, and activities based on your preferences.
              </p>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-green-100 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Travel Pooling</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with fellow travelers, share costs, and make new friends on your journey.
              </p>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-purple-100 dark:bg-purple-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Detailed Itineraries</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get day-by-day itineraries with packing lists and local tips for a stress-free trip.
              </p>
            </Motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
