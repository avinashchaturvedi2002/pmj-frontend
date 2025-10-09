import api from './api';

export const packageService = {
  // Get all packages
  getAllPackages: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/packages${params ? `?${params}` : ''}`);
  },

  // Get package by ID
  getPackageById: async (packageId) => {
    return await api.get(`/packages/${packageId}`);
  },

  // Create package (Admin)
  createPackage: async (packageData) => {
    return await api.post('/packages', packageData);
  },

  // Update package (Admin)
  updatePackage: async (packageId, packageData) => {
    return await api.put(`/packages/${packageId}`, packageData);
  },

  // Delete package (Admin)
  deletePackage: async (packageId) => {
    return await api.delete(`/packages/${packageId}`);
  },
};


