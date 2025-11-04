import api from './api';

export const analyticsService = {
  // Get available bus seats for date
  getAvailableBusSeats: async (busId, date) => {
    return await api.get(`/analytics/buses/${busId}/available-seats?date=${date}`);
  },

  // Get available hotel rooms for date
  getAvailableHotelRooms: async (hotelId, date) => {
    return await api.get(`/analytics/hotels/${hotelId}/available-rooms?date=${date}`);
  },

  // Get trips count between dates
  getTripsCount: async (startDate, endDate) => {
    return await api.get(`/analytics/trips/count?startDate=${startDate}&endDate=${endDate}`);
  },

  // Get active pool groups
  getActivePoolGroups: async () => {
    return await api.get('/analytics/pool-groups/active');
  },

  // Get packages for trip
  getPackagesForTrip: async (tripId) => {
    return await api.get(`/analytics/trips/${tripId}/packages`);
  },

  // Get destination-wise groups
  getDestinationWiseGroups: async () => {
    return await api.get('/analytics/destinations/groups');
  },

  // Get upcoming trips summary
  getUpcomingTripsSummary: async () => {
    return await api.get('/analytics/trips/upcoming-summary');
  },

  // Get users with pending bookings (Admin)
  getPendingBookings: async (groupId) => {
    return await api.get(`/analytics/pool-groups/${groupId}/pending-bookings`);
  },

  // Get registration count (Admin)
  getRegistrationCount: async (days = 30) => {
    return await api.get(`/analytics/users/registrations?days=${days}`);
  },
};



