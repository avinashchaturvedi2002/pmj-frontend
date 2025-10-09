import { useState, useEffect } from 'react'
import { useBookingStore } from '../store/bookingStore'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { 
  Calendar, 
  MapPin, 
  Bus, 
  Hotel, 
  DollarSign,
  Loader,
  XCircle,
  CheckCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

const Bookings = () => {
  const { bookings, isLoading, fetchBookings, cancelBooking } = useBookingStore()
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    const result = await cancelBooking(bookingId)
    if (result.success) {
      alert(result.message)
    } else {
      alert(result.error)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (!filter) return true
    return booking.status === filter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'default'
      case 'PENDING':
        return 'secondary'
      case 'CANCELLED':
        return 'destructive'
      case 'COMPLETED':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            My Bookings
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            View and manage all your travel bookings
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={filter === '' ? 'default' : 'outline'}
            onClick={() => setFilter('')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === 'PENDING' ? 'default' : 'outline'}
            onClick={() => setFilter('PENDING')}
            size="sm"
          >
            Pending
          </Button>
          <Button
            variant={filter === 'CONFIRMED' ? 'default' : 'outline'}
            onClick={() => setFilter('CONFIRMED')}
            size="sm"
          >
            Confirmed
          </Button>
          <Button
            variant={filter === 'CANCELLED' ? 'default' : 'outline'}
            onClick={() => setFilter('CANCELLED')}
            size="sm"
          >
            Cancelled
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Bookings List */}
        {!isLoading && (
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No bookings found
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">
                              {booking.trip?.source} → {booking.trip?.destination}
                            </CardTitle>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDate(booking.trip?.startDate)} - {formatDate(booking.trip?.endDate)}
                            </span>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Booking Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {booking.busSeat && (
                            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <Bus className="h-5 w-5 text-primary mt-0.5" />
                              <div className="flex-1">
                                <p className="font-medium text-sm">Bus</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {booking.busSeat.bus?.busName}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  Seat: {booking.busSeat.seatNumber}
                                </p>
                              </div>
                            </div>
                          )}

                          {booking.hotelRoom && (
                            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <Hotel className="h-5 w-5 text-primary mt-0.5" />
                              <div className="flex-1">
                                <p className="font-medium text-sm">Hotel</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {booking.hotelRoom.hotel?.name}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  Room: {booking.hotelRoom.roomNumber} ({booking.hotelRoom.roomType})
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Total Price */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-sm font-medium">Total Price:</span>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-gray-600" />
                            <span className="text-xl font-bold text-primary">₹{booking.totalPrice}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        {booking.status === 'PENDING' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Booking
                          </Button>
                        )}

                        {booking.status === 'CONFIRMED' && (
                          <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Booking Confirmed!</span>
                          </div>
                        )}
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

export default Bookings


