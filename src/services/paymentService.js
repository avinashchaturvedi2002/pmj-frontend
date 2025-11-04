import api from './api';

const paymentService = {
  /**
   * Create Razorpay order
   * @param {Object} data - { amount, bookingId?, groupMemberId?, poolGroupId? }
   * @returns {Promise}
   */
  createOrder: (data) => {
    return api.post('/payments/create-order', data);
  },

  /**
   * Verify payment signature
   * @param {Object} data - { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId }
   * @returns {Promise}
   */
  verifyPayment: (data) => {
    return api.post('/payments/verify', data);
  },

  /**
   * Get payment by ID
   * @param {string} id - Payment ID
   * @returns {Promise}
   */
  getPaymentById: (id) => {
    return api.get(`/payments/${id}`);
  },

  /**
   * Get all payments for user
   * @param {Object} params - { status? }
   * @returns {Promise}
   */
  getAllPayments: (params = {}) => {
    return api.get('/payments', { params });
  },

  /**
   * Initiate refund (Admin only)
   * @param {string} id - Payment ID
   * @param {Object} data - { amount?, reason? }
   * @returns {Promise}
   */
  initiateRefund: (id, data) => {
    return api.post(`/payments/${id}/refund`, data);
  }
};

export default paymentService;

