import api from './api';

export const busService = {
  // Get all buses
  getAllBuses: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/buses${params ? `?${params}` : ''}`);
  },

  // Get bus by ID
  getBusById: async (busId) => {
    return await api.get(`/buses/${busId}`);
  },

  // Get available seats
  getAvailableSeats: async (busId) => {
    return await api.get(`/buses/${busId}/seats/available`);
  },

  // Seat map with reservation info
  getSeatMap: async (busId, params = {}) => {
    return await api.get(`/buses/${busId}/seats`, { params });
  },

  // Hold seats for a user
  holdSeats: async (busId, payload) => {
    return await api.post(`/buses/${busId}/hold`, payload);
  },

  // Release held seats
  releaseSeats: async (busId, holdToken, payload = {}) => {
    return await api.delete(`/buses/${busId}/hold/${holdToken}`, { data: payload });
  },

  // Confirm held seats
  confirmSeats: async (busId, payload) => {
    return await api.post(`/buses/${busId}/confirm`, payload);
  },

  // Create bus (Admin)
  createBus: async (busData) => {
    return await api.post('/buses', busData);
  },

  // Update bus (Admin)
  updateBus: async (busId, busData) => {
    return await api.put(`/buses/${busId}`, busData);
  },

  // Delete bus (Admin)
  deleteBus: async (busId) => {
    return await api.delete(`/buses/${busId}`);
  },
};



