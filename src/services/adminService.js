import api from './api';

export const adminService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    return await api.get('/admin/dashboard/stats');
  },

  // Get all users
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/admin/users${params ? `?${params}` : ''}`);
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    return await api.patch(`/admin/users/${userId}/role`, { role });
  },

  // Get all bookings
  getAllBookings: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/admin/bookings${params ? `?${params}` : ''}`);
  },

  // Get all pool groups
  getAllPoolGroups: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/admin/pool-groups${params ? `?${params}` : ''}`);
  },

  // Get pending group requests
  getPendingRequests: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/admin/group-requests/pending${params ? `?${params}` : ''}`);
  },

  // Approve group request
  approveRequest: async (requestId) => {
    return await api.patch(`/admin/group-requests/${requestId}/approve`);
  },

  // Reject group request
  rejectRequest: async (requestId) => {
    return await api.patch(`/admin/group-requests/${requestId}/reject`);
  },
};


