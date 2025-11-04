import api from './api';

export const tripService = {
  // Create new trip
  createTrip: async (tripData) => {
    return await api.post('/trips', tripData);
  },

  // Get all user trips
  getAllTrips: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/trips${params ? `?${params}` : ''}`);
  },

  // Get trip by ID
  getTripById: async (tripId) => {
    return await api.get(`/trips/${tripId}`);
  },

  // Update trip
  updateTrip: async (tripId, tripData) => {
    return await api.put(`/trips/${tripId}`, tripData);
  },

  // Delete trip
  deleteTrip: async (tripId) => {
    return await api.delete(`/trips/${tripId}`);
  },

  // Get trip statistics
  getTripStats: async () => {
    return await api.get('/trips/stats/overview');
  },
};



