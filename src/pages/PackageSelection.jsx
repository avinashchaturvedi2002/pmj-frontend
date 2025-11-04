import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { packageService, bookingService } from '../services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import RazorpayCheckout from '../components/RazorpayCheckout';
import { 
  Bus, 
  Hotel, 
  IndianRupee, 
  Users, 
  Calendar,
  MapPin,
  Star,
  Wifi,
  Coffee,
  Loader,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const PackageSelection = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Filters (removed client-side filtering since we do server-side pagination)
  const [sortBy, setSortBy] = useState('price'); // price, rating
  
  // Booking state
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => {
    fetchSuggestions(currentPage);
  }, [tripId, currentPage]);

  const fetchSuggestions = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching package suggestions for trip: ${tripId}, page: ${page}`);
      const response = await packageService.getSuggestions(tripId, page, 10); // 10 items per page
      console.log('Package suggestions response:', response);
      
      const data = response.data || response; // Handle both response formats
      
      setTrip(data.trip);
      setSuggestions(data.suggestions || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
      
      console.log(`Loaded ${data.suggestions?.length || 0} package suggestions (Page ${data.pagination?.page}/${data.pagination?.totalPages})`);
      
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
      const errorMessage = err.message || err.response?.data?.message || 'Failed to load package suggestions. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePreviousPage = () => {
    if (pagination.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    console.log('✅ PAYMENT SUCCESS HANDLER CALLED');
    console.log('Payment Data:', paymentData);
    
    try {
      setBookingInProgress(true);
      
      console.log(`Navigating to success page: /payment-success/${paymentData.paymentId}`);
      // Navigate to success page
      navigate(`/payment-success/${paymentData.paymentId}`);
    } catch (err) {
      console.error('❌ Payment success handling error:', err);
      alert('Payment successful but there was an error. Please contact support.');
    } finally {
      setBookingInProgress(false);
      setSelectedPackage(null);
    }
  };

  const handlePaymentFailure = (error) => {
    console.error('❌ PAYMENT FAILURE HANDLER CALLED');
    console.error('Error object:', error);
    console.error('Error type:', typeof error);
    console.error('Error keys:', error ? Object.keys(error) : 'null');
    
    const errorMessage = error?.description || error?.message || 'Payment failed. Please try again.';
    console.error('Showing alert with message:', errorMessage);
    
    alert(errorMessage);
    setSelectedPackage(null);
  };

  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return Wifi;
    if (amenityLower.includes('coffee') || amenityLower.includes('breakfast')) return Coffee;
    return CheckCircle;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading package suggestions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Packages</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={() => navigate('/plan-trip')}>Plan New Trip</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!trip || suggestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Packages Available</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No packages found within your budget for the selected dates. Try adjusting your trip details.
            </p>
            <Button onClick={() => navigate('/plan-trip')}>Modify Trip</Button>
          </CardContent>
        </Card>
      </div>
    );
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
              Available Packages for Your Trip
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{trip.source} → {trip.destination}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{trip.travelers} traveler(s)</span>
              </div>
              <div className="flex items-center space-x-2">
                <IndianRupee className="h-4 w-4" />
                <span>Budget: ₹{trip.budget.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Package Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {suggestions.map((pkg, index) => (
            <motion.div
              key={`${pkg.bus.id}-${pkg.hotel.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">Complete Travel Package</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">
                          ₹{pkg.pricing.totalCost.toLocaleString()}
                        </Badge>
                        <Badge variant="outline">
                          ₹{pkg.pricing.perPersonCost.toLocaleString()}/person
                        </Badge>
                      </div>
                    </div>
                    {pkg.withinBudget && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Within Budget
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Bus Details */}
                  <div className="border-b pb-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Bus className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Bus (Round Trip)</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Bus Name:</span>
                        <span className="font-medium">{pkg.bus.busName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Bus Number:</span>
                        <span className="font-medium">{pkg.bus.busNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Available Seats:</span>
                        <span className="font-medium">{pkg.bus.availableSeats}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                        <span className="font-medium">₹{pkg.pricing.busRoundTripCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hotel Details */}
                  <div className="border-b pb-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Hotel className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Hotel ({pkg.pricing.nights} night(s))</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600 dark:text-gray-400">Hotel Name:</span>
                        <div className="text-right">
                          <div className="font-medium">{pkg.hotel.name}</div>
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs">{pkg.hotel.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Location:</span>
                        <span className="font-medium">{pkg.hotel.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Available Rooms:</span>
                        <span className="font-medium">{pkg.hotel.availableRooms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Rooms Needed:</span>
                        <span className="font-medium">{pkg.pricing.roomsNeeded}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                        <span className="font-medium">₹{pkg.pricing.hotelCost.toLocaleString()}</span>
                      </div>
                      {pkg.hotel.amenities && (
                        <div className="mt-2">
                          <span className="text-gray-600 dark:text-gray-400 text-xs">Amenities:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {JSON.parse(pkg.hotel.amenities || '[]').slice(0, 4).map((amenity, idx) => {
                              const Icon = getAmenityIcon(amenity);
                              return (
                                <div key={idx} className="flex items-center space-x-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  <Icon className="h-3 w-3" />
                                  <span>{amenity}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between font-semibold text-base">
                        <span>Total Package Cost:</span>
                        <span className="text-primary">₹{pkg.pricing.totalCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Per Person:</span>
                        <span>₹{pkg.pricing.perPersonCost.toLocaleString()}</span>
                      </div>
                      {pkg.withinBudget && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span>Savings:</span>
                          <span>₹{pkg.budgetRemaining.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Book Button */}
                  <RazorpayCheckout
                    amount={pkg.pricing.totalCost}
                    bookingId={null} // Will be created after payment
                    tripId={trip.id}
                    packageId={pkg.packageId || null}
                    busId={pkg.bus.id}
                    hotelId={pkg.hotel.id}
                    onSuccess={handlePaymentSuccess}
                    onFailure={handlePaymentFailure}
                    buttonText={`Book Package - ₹${pkg.pricing.totalCost.toLocaleString()}`}
                    buttonVariant="default"
                    buttonSize="lg"
                    disabled={bookingInProgress}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex items-center justify-center gap-2"
          >
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={!pagination.hasPrevPage}
              className="gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === pagination.page ? 'default' : 'outline'}
                  onClick={() => handlePageChange(pageNum)}
                  className="min-w-[40px]"
                >
                  {pageNum}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage}
              className="gap-2"
            >
              Next
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </motion.div>
        )}

        {/* Results Summary */}
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} packages
        </div>

        {suggestions.length === 0 && !loading && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No packages available. Try adjusting your budget or dates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageSelection;

