import { useState, useEffect } from 'react';
import { paymentService } from '../services';
import { Button } from './ui/Button';
import { Loader } from 'lucide-react';

const RazorpayCheckout = ({
  amount,
  bookingId,
  groupMemberId,
  poolGroupId,
  tripId,
  packageId,
  busId,
  hotelId,
  onSuccess,
  onFailure,
  buttonText = 'Pay Now',
  buttonVariant = 'default',
  buttonSize = 'default',
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      setScriptLoaded(false);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    console.log('🎯 PAYMENT INITIATED');
    console.log('Payment Details:', { amount, bookingId, groupMemberId, poolGroupId, tripId, packageId, busId, hotelId });
    
    if (!scriptLoaded) {
      console.error('❌ Razorpay script not loaded');
      alert('Payment system is loading. Please try again in a moment.');
      return;
    }

    if (!window.Razorpay) {
      console.error('❌ Razorpay not available on window');
      alert('Payment system not available. Please refresh the page.');
      return;
    }

    try {
      setLoading(true);
      console.log('📝 Creating payment order...');

      // Create order
      const response = await paymentService.createOrder({
        amount,
        bookingId: bookingId || null,
        groupMemberId: groupMemberId || null,
        poolGroupId: poolGroupId || null,
        tripId: tripId || null,
        packageId: packageId || null,
        busId: busId || null,
        hotelId: hotelId || null
      });

      console.log('✅ Order creation response:', response);
      
      const orderData = response.data?.data || response.data;
      console.log('📦 Order data:', orderData);

      if (!orderData || !orderData.orderId) {
        console.error('❌ Invalid order data received:', orderData);
        throw new Error('Failed to create payment order');
      }

      // Razorpay options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Plan My Journey',
        description: 'Travel Booking Payment',
        order_id: orderData.orderId,
        handler: async function (response) {
          console.log('✅ Payment successful from Razorpay');
          console.log('Payment Response:', response);
          
          try {
            console.log('🔍 Verifying payment on backend...');
            
            // Verify payment on backend
            const verifyRes = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: orderData.paymentId
            });

            console.log('✅ Verification response:', verifyRes);

            if (verifyRes.success || verifyRes.data?.verified) {
              console.log('✅ Payment verified successfully');
              onSuccess && onSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                ...verifyRes.data.data
              });
            } else {
              console.error('❌ Payment verification failed:', verifyRes);
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('❌ Payment verification error:', error);
            console.error('Error details:', error.message, error.response?.data);
            onFailure && onFailure(error);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: '', // Can be filled from user data
          email: '',
          contact: ''
        },
        notes: {
          bookingId: bookingId || '',
          groupMemberId: groupMemberId || '',
          poolGroupId: poolGroupId || ''
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: function () {
            console.log('⚠️ Payment modal dismissed by user');
            setLoading(false);
            onFailure && onFailure(new Error('Payment cancelled by user'));
          }
        }
      };

      console.log('🚀 Opening Razorpay checkout with options:', {
        key: orderData.key ? '***' + orderData.key.slice(-4) : 'missing',
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId
      });

      const rzp = new window.Razorpay(options);

      // Handle payment failure
      rzp.on('payment.failed', function (response) {
        console.error('❌ PAYMENT FAILED EVENT');
        console.error('Error Code:', response.error.code);
        console.error('Error Description:', response.error.description);
        console.error('Error Source:', response.error.source);
        console.error('Error Step:', response.error.step);
        console.error('Error Reason:', response.error.reason);
        console.error('Full error:', response.error);
        
        setLoading(false);
        onFailure && onFailure({
          code: response.error.code,
          description: response.error.description,
          source: response.error.source,
          step: response.error.step,
          reason: response.error.reason
        });
      });

      // Open Razorpay checkout
      console.log('📱 Opening Razorpay modal...');
      rzp.open();
    } catch (error) {
      console.error('❌ PAYMENT INITIATION ERROR');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error stack:', error.stack);
      
      setLoading(false);
      onFailure && onFailure(error);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading || !scriptLoaded}
      variant={buttonVariant}
      size={buttonSize}
    >
      {loading ? (
        <>
          <Loader className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : !scriptLoaded ? (
        <>
          <Loader className="h-4 w-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
};

export default RazorpayCheckout;

