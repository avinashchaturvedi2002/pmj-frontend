import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { MapPin, Star, Users, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

const Home = () => {
  const popularDestinations = [
    {
      id: 1,
      name: 'Goa, India',
      description: 'Sun-kissed beaches, vibrant nightlife, and Portuguese heritage in India\'s party capital.',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop',
      rating: 4.8,
      travelers: 12500,
      price: '₹25,000',
      duration: '5 days'
    },
    {
      id: 2,
      name: 'Kashmir, India',
      description: 'Paradise on Earth with snow-capped mountains, pristine lakes, and breathtaking valleys.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop',
      rating: 4.9,
      travelers: 8900,
      price: '₹35,000',
      duration: '7 days'
    },
    {
      id: 3,
      name: 'Kerala, India',
      description: 'God\'s Own Country with backwaters, tea plantations, and rich cultural heritage.',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=500&h=300&fit=crop',
      rating: 4.7,
      travelers: 15600,
      price: '₹20,000',
      duration: '6 days'
    },
    {
      id: 4,
      name: 'Rajasthan, India',
      description: 'Land of kings with magnificent palaces, forts, and the golden Thar Desert.',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=500&h=300&fit=crop',
      rating: 4.6,
      travelers: 22100,
      price: '₹30,000',
      duration: '8 days'
    },
    {
      id: 5,
      name: 'Paris, France',
      description: 'The City of Light, famous for its art, fashion, and iconic landmarks like the Eiffel Tower.',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=500&h=300&fit=crop',
      rating: 4.5,
      travelers: 18900,
      price: '₹1,20,000',
      duration: '5 days'
    },
    {
      id: 6,
      name: 'Singapore',
      description: 'Modern city-state with futuristic architecture, diverse cuisine, and vibrant culture.',
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=500&h=300&fit=crop',
      rating: 4.4,
      travelers: 11200,
      price: '₹80,000',
      duration: '4 days'
    }
  ]

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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
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
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Start Planning
                </Button>
              </Link>
              <Link to="/pooling">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Find Travel Buddies
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Popular Destinations
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Explore India's most beautiful destinations and international favorites, handpicked by our travel community
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {popularDestinations.map((destination) => (
              <motion.div key={destination.id} variants={itemVariants}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{destination.rating}</span>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <CardTitle className="text-xl">{destination.name}</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      {destination.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{destination.travelers.toLocaleString()} travelers</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{destination.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {destination.price}
                      </span>
                      <Button size="sm">
                        Explore
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
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
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
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
            </motion.div>

            <motion.div
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
            </motion.div>

            <motion.div
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
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
