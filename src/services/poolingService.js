import api from './api';

export const poolingService = {
  // Create pool group
  createPoolGroup: async (groupData) => {
    return await api.post('/pooling', groupData);
  },

  // Get all pool groups
  getAllPoolGroups: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/pooling${params ? `?${params}` : ''}`);
  },

  // Get pool group by ID
  getPoolGroupById: async (groupId) => {
    return await api.get(`/pooling/${groupId}`);
  },

  // Join pool group
  joinPoolGroup: async (groupId) => {
    return await api.post(`/pooling/${groupId}/join`);
  },

  // Update member status (approve/reject)
  updateMemberStatus: async (groupId, memberId, status) => {
    return await api.patch(`/pooling/${groupId}/members/${memberId}`, { status });
  },

  // Leave pool group
  leavePoolGroup: async (groupId) => {
    return await api.delete(`/pooling/${groupId}/leave`);
  },

  // Delete pool group
  deletePoolGroup: async (groupId) => {
    return await api.delete(`/pooling/${groupId}`);
  },

  // Get my pool groups
  getMyPoolGroups: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/pooling/my/groups${params ? `?${params}` : ''}`);
  },

  // Set package and per-person cost for group (Admin/Creator)
  setGroupPackage: async (groupId, data) => {
    return await api.post(`/pooling/${groupId}/set-package`, data);
  },

  // Member approves selected package
  approvePackage: async (groupId) => {
    return await api.post(`/pooling/${groupId}/approve-package`);
  },

  // Check group payment status
  checkGroupPaymentStatus: async (groupId) => {
    return await api.get(`/pooling/${groupId}/payment-status`);
  },

  // Lock group after all payments (Admin/Creator)
  lockGroup: async (groupId) => {
    return await api.post(`/pooling/${groupId}/lock`);
  },
};



