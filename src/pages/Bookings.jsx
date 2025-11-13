import { useState, useEffect } from 'react';
import { useBookingStore } from '../store/bookingStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Calendar, 
  MapPin, 
  Bus, 
  Hotel, 
  DollarSign,
  Loader,
  XCircle,
  CheckCircle,
  CalendarDays
} from 'lucide-react';
import { motion } from 'framer-motion';
import ItineraryModal from '../components/ItineraryModal';
import { parseItinerary, hasItineraryContent } from '../utils/itinerary';

const Bookings = () => {
  const { bookings, isLoading, fetchBookings, cancelBooking } = useBookingStore();
  const [filter, setFilter] = useState('');
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    const result = await cancelBooking(bookingId);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.error);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (!filter) return true;
    return booking.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      case 'COMPLETED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
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

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

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
              filteredBookings.map((booking, index) => {
                const latestPayment = booking.payments?.[0] || null;
                const itineraryData = parseItinerary(latestPayment?.itinerary);
                const itineraryAvailable = hasItineraryContent(itineraryData);
                const itineraryGeneratedAt = latestPayment?.itineraryGeneratedAt;

                return (
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {booking.busBookings && booking.busBookings.length > 0 && (
                            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <Bus className="h-5 w-5 text-primary mt-0.5" />
                              <div className="flex-1">
                                <p className="font-medium text-sm">Bus Bookings</p>
                                {booking.busBookings.map((busBooking) => (
                                  <div key={busBooking.id} className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    <p className="font-semibold">{busBooking.bus?.busName || 'Bus'}</p>
                                    <p>Date: {formatDate(busBooking.bookingDate)}</p>
                                    <p>Seats: {busBooking.seatsBooked} × ₹{busBooking.pricePerSeat} = ₹{busBooking.totalPrice}</p>
                                    {busBooking.seatNumbers && <p>Seats: {JSON.parse(busBooking.seatNumbers).join(', ')}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {booking.hotelBookings && booking.hotelBookings.length > 0 && (
                            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <Hotel className="h-5 w-5 text-primary mt-0.5" />
                              <div className="flex-1">
                                <p className="font-medium text-sm">Hotel Bookings</p>
                                {booking.hotelBookings.map((hotelBooking) => (
                                  <div key={hotelBooking.id} className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    <p className="font-semibold">{hotelBooking.hotel?.name || 'Hotel'}</p>
                                    <p>Check-in: {formatDate(hotelBooking.checkIn)}</p>
                                    <p>Check-out: {formatDate(hotelBooking.checkOut)}</p>
                                    <p>Rooms: {hotelBooking.roomsBooked} × ₹{hotelBooking.pricePerRoom}/night = ₹{hotelBooking.totalPrice}</p>
                                    {hotelBooking.roomNumbers && <p>Rooms: {JSON.parse(hotelBooking.roomNumbers).join(', ')}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-sm font-medium">Total Price:</span>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-gray-600" />
                            <span className="text-xl font-bold text-primary">₹{booking.totalPrice}</span>
                          </div>
                        </div>

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

                        {itineraryAvailable && (
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full md:w-auto"
                            onClick={() => {
                              setSelectedItinerary({
                                itinerary: itineraryData,
                                generatedAt: itineraryGeneratedAt,
                                title: `Suggested Itinerary • ${booking.trip?.destination || 'Trip'}`
                              });
                              setIsItineraryModalOpen(true);
                            }}
                          >
                            <CalendarDays className="h-4 w-4 mr-2" />
                            View Itinerary
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>
      </div>

      <ItineraryModal
        open={isItineraryModalOpen && hasItineraryContent(selectedItinerary?.itinerary)}
        onClose={() => {
          setIsItineraryModalOpen(false);
          setSelectedItinerary(null);
        }}
        itinerary={selectedItinerary?.itinerary}
        generatedAt={selectedItinerary?.generatedAt}
        title={selectedItinerary?.title}
      />
    </>
  );
};

export default Bookings;
