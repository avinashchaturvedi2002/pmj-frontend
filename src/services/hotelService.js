import api from './api';

export const hotelService = {
  // Get all hotels
  getAllHotels: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/hotels${params ? `?${params}` : ''}`);
  },

  // Get hotel by ID
  getHotelById: async (hotelId) => {
    return await api.get(`/hotels/${hotelId}`);
  },

  // Get available rooms
  getAvailableRooms: async (hotelId, filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/hotels/${hotelId}/rooms/available${params ? `?${params}` : ''}`);
  },

  // Create hotel (Admin)
  createHotel: async (hotelData) => {
    return await api.post('/hotels', hotelData);
  },

  // Update hotel (Admin)
  updateHotel: async (hotelId, hotelData) => {
    return await api.put(`/hotels/${hotelId}`, hotelData);
  },

  // Delete hotel (Admin)
  deleteHotel: async (hotelId) => {
    return await api.delete(`/hotels/${hotelId}`);
  },
};


