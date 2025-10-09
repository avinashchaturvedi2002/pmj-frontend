import api from './api';

export const bookingService = {
  // Create booking
  createBooking: async (bookingData) => {
    return await api.post('/bookings', bookingData);
  },

  // Get all user bookings
  getAllBookings: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/bookings${params ? `?${params}` : ''}`);
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    return await api.get(`/bookings/${bookingId}`);
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    return await api.patch(`/bookings/${bookingId}/cancel`);
  },

  // Confirm booking (Admin)
  confirmBooking: async (bookingId) => {
    return await api.patch(`/bookings/${bookingId}/confirm`);
  },
};


