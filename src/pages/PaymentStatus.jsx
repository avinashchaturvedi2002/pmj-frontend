import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../services';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  CheckCircle, 
  XCircle, 
  Loader, 
  Download,
  Home,
  Calendar,
  MapPin,
  IndianRupee,
  Bus,
  Hotel,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import ItineraryModal from '../components/ItineraryModal';
import { parseItinerary, hasItineraryContent } from '../utils/itinerary';

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 12;

const PaymentStatus = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);
  const [isItineraryPolling, setIsItineraryPolling] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);
  const [hasShownItineraryModal, setHasShownItineraryModal] = useState(false);
  const itinerary = useMemo(() => parseItinerary(payment?.itinerary), [payment]);

  const fetchPaymentDetails = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      const { data } = await paymentService.getPaymentById(paymentId);
      setPayment(data.payment);
      return data.payment;
    } catch (err) {
      console.error('Failed to fetch payment details:', err);
      if (!silent) {
        setError(err.response?.data?.message || 'Failed to load payment details');
      }
      throw err;
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [paymentId]);

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetails();
    }
  }, [paymentId, fetchPaymentDetails]);

  useEffect(() => {
    setPollAttempts(0);
  }, [paymentId]);

  useEffect(() => {
    if (!paymentId) return;
    const isPaymentSuccess = payment?.status === 'SUCCESS';
    if (!isPaymentSuccess) {
      setIsItineraryPolling(false);
      return;
    }
    if (hasItineraryContent(itinerary)) {
      setIsItineraryPolling(false);
      if (!hasShownItineraryModal) {
        setHasShownItineraryModal(true);
        setIsItineraryModalOpen(true);
      }
      return;
    }
    if (pollAttempts >= MAX_POLL_ATTEMPTS) {
      setIsItineraryPolling(false);
      return;
    }

    setIsItineraryPolling(true);
    const timeout = setTimeout(async () => {
      try {
        await fetchPaymentDetails({ silent: true });
      } catch (pollError) {
        console.error('Itinerary poll failed:', pollError);
      } finally {
        setPollAttempts((prev) => prev + 1);
      }
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timeout);
  }, [
    paymentId,
    payment,
    itinerary,
    pollAttempts,
    hasShownItineraryModal,
    fetchPaymentDetails
  ]);

  const handleDownloadReceipt = () => {
    alert('Receipt download feature coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Error</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Button onClick={() => navigate('/')}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaymentSuccess = payment?.status === 'SUCCESS';

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-6">
              <CardContent className="pt-6">
              <div className="text-center mb-6">
                {isPaymentSuccess ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    >
                      <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Payment Successful!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your booking has been confirmed. Thank you for choosing Plan My Journey!
                    </p>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    >
                      <XCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Payment Failed
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {payment?.failureReason || 'Your payment could not be processed. Please try again.'}
                    </p>
                  </>
                )}
              </div>

              {payment && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                  <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Payment ID</p>
                      <p className="font-medium">{payment.id}</p>
                    </div>
                    
                    {payment.razorpayPaymentId && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</p>
                        <p className="font-medium font-mono text-sm">{payment.razorpayPaymentId}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Amount Paid</p>
                      <p className="font-medium text-lg text-primary">
                        ₹{(payment.amount / 100).toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
                      <p className="font-medium capitalize">{payment.paymentMethod || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <p className={`font-medium ${isPaymentSuccess ? 'text-green-600' : 'text-red-600'}`}>
                        {payment.status}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                      <p className="font-medium">
                        {new Date(payment.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {payment?.booking && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 space-y-4">
                  <h2 className="text-lg font-semibold mb-4">Booking Information</h2>
                  
                  {payment.booking.trip && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Trip Route</p>
                          <p className="font-medium">
                            {payment.booking.trip.source} <ArrowRight className="inline h-4 w-4" /> {payment.booking.trip.destination}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Travel Dates</p>
                          <p className="font-medium">
                            {new Date(payment.booking.trip.startDate).toLocaleDateString()} - {new Date(payment.booking.trip.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {payment.booking.busSeat && (
                    <div className="flex items-start space-x-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <Bus className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bus Details</p>
                        <p className="font-medium">{payment.booking.busSeat.bus?.busName}</p>
                        <p className="text-sm">Seat: {payment.booking.busSeat.seatNumber}</p>
                      </div>
                    </div>
                  )}

                  {payment.booking.hotelRoom && (
                    <div className="flex items-start space-x-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <Hotel className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Hotel Details</p>
                        <p className="font-medium">{payment.booking.hotelRoom.hotel?.name}</p>
                        <p className="text-sm">Room: {payment.booking.hotelRoom.roomNumber} ({payment.booking.hotelRoom.roomType})</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {payment?.groupMember && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 space-y-4">
                  <h2 className="text-lg font-semibold mb-4">Group Travel Information</h2>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Group Trip</p>
                    <p className="font-medium mb-3">
                      {payment.groupMember.poolGroup?.trip?.source} <ArrowRight className="inline h-4 w-4" /> {payment.groupMember.poolGroup?.trip?.destination}
                    </p>
                    <p className="text-sm">
                      Your payment has been recorded. The group admin will finalize the booking once all members have paid.
                    </p>
                  </div>
                </div>
              )}

              {isPaymentSuccess && itinerary && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">Suggested Itinerary</h2>
                      {payment.itineraryGeneratedAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Generated on {new Date(payment.itineraryGeneratedAt).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setIsItineraryModalOpen(true)}
                        variant="default"
                      >
                        View Itinerary
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your personalized itinerary is ready. Click &ldquo;View Itinerary&rdquo; to explore recommendations, day plans, and travel tips.
                  </p>
                </div>
              )}

              {isPaymentSuccess && !hasItineraryContent(itinerary) && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">Suggested Itinerary</h2>
                    <Button variant="outline" disabled className="gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      Preparing
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We are preparing a tailored itinerary for your trip. This usually takes less than a minute. {isItineraryPolling ? 'We will refresh automatically.' : 'If it takes longer, you can refresh this page later.'}
                  </p>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 flex flex-wrap gap-3 justify-center">
                {isPaymentSuccess && (
                  <>
                    <Button
                      onClick={handleDownloadReceipt}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Receipt</span>
                    </Button>
                    
                    <Button
                      onClick={() => navigate('/bookings')}
                      variant="default"
                    >
                      View My Bookings
                    </Button>
                  </>
                )}
                
                {!isPaymentSuccess && (
                  <Button
                    onClick={() => navigate('/plan-trip')}
                    variant="default"
                  >
                    Try Again
                  </Button>
                )}
                
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Home className="h-4 w-4" />
                  <span>Go to Home</span>
                </Button>
              </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  If you have any questions or concerns about your payment, please contact our support team.
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> support@planmyjourney.in</p>
                  <p><strong>Phone:</strong> +91-9876543210</p>
                  <p><strong>Hours:</strong> Mon-Sat, 9:00 AM - 6:00 PM IST</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <ItineraryModal
        open={isItineraryModalOpen && hasItineraryContent(itinerary)}
        onClose={() => setIsItineraryModalOpen(false)}
        itinerary={itinerary}
        generatedAt={payment?.itineraryGeneratedAt}
      />
    </>
  );
};

export default PaymentStatus;


