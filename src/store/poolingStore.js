import { create } from 'zustand'
import { poolingService } from '../services'

export const usePoolingStore = create((set, get) => ({
  poolGroups: [],
  myPoolGroups: [],
  currentPoolGroup: null,
  isLoading: false,
  error: null,

  // Create pool group
  createPoolGroup: async (groupData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await poolingService.createPoolGroup(groupData)
      const poolGroup = response.data.poolGroup

      set(state => ({
        poolGroups: [poolGroup, ...state.poolGroups],
        myPoolGroups: [poolGroup, ...state.myPoolGroups],
        isLoading: false
      }))

      return { success: true, poolGroup }
    } catch (error) {
      set({ isLoading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Fetch all pool groups
  fetchPoolGroups: async (filters = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await poolingService.getAllPoolGroups(filters)
      set({ 
        poolGroups: response.data.poolGroups || [],
        isLoading: false 
      })
    } catch (error) {
      set({ isLoading: false, error: error.message })
    }
  },

  // Fetch my pool groups
  fetchMyPoolGroups: async (filters = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await poolingService.getMyPoolGroups(filters)
      set({ 
        myPoolGroups: response.data.poolGroups || [],
        isLoading: false 
      })
    } catch (error) {
      set({ isLoading: false, error: error.message })
    }
  },

  // Get pool group by ID
  fetchPoolGroupById: async (groupId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await poolingService.getPoolGroupById(groupId)
      set({ 
        currentPoolGroup: response.data.poolGroup,
        isLoading: false 
      })
      return { success: true, poolGroup: response.data.poolGroup }
    } catch (error) {
      set({ isLoading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Join pool group
  joinPoolGroup: async (groupId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await poolingService.joinPoolGroup(groupId)
      
      // Update the group in the list
      set(state => ({
        poolGroups: state.poolGroups.map(g => 
          g.id === groupId ? { ...g, hasJoinRequest: true } : g
        ),
        isLoading: false
      }))

      return { success: true, message: response.message }
    } catch (error) {
      set({ isLoading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Leave pool group
  leavePoolGroup: async (groupId) => {
    set({ isLoading: true, error: null })
    try {
      await poolingService.leavePoolGroup(groupId)

      set(state => ({
        myPoolGroups: state.myPoolGroups.filter(g => g.id !== groupId),
        isLoading: false
      }))

      return { success: true }
    } catch (error) {
      set({ isLoading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Delete pool group
  deletePoolGroup: async (groupId) => {
    set({ isLoading: true, error: null })
    try {
      await poolingService.deletePoolGroup(groupId)

      set(state => ({
        poolGroups: state.poolGroups.filter(g => g.id !== groupId),
        myPoolGroups: state.myPoolGroups.filter(g => g.id !== groupId),
        isLoading: false
      }))

      return { success: true }
    } catch (error) {
      set({ isLoading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Approve/Reject member (Admin/Creator)
  updateMemberStatus: async (groupId, memberId, status) => {
    set({ isLoading: true, error: null })
    try {
      const response = await poolingService.updateMemberStatus(groupId, memberId, status)

      // Refresh the current pool group
      if (get().currentPoolGroup?.id === groupId) {
        await get().fetchPoolGroupById(groupId)
      }

      set({ isLoading: false })
      return { success: true, message: response.message }
    } catch (error) {
      set({ isLoading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}))


