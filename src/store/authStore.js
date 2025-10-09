import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.login({ email, password })
          
          const { user, token } = response.data
          
          set({ 
            user, 
            token,
            isAuthenticated: true, 
            isLoading: false,
            error: null
          })
          
          return { success: true, user }
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Login failed'
          })
          return { success: false, error: error.message || 'Login failed' }
        }
      },
      
      register: async (name, email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.register({ name, email, password })
          
          const { user, token } = response.data
          
          set({ 
            user, 
            token,
            isAuthenticated: true, 
            isLoading: false,
            error: null
          })
          
          return { success: true, user }
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Registration failed'
          })
          return { success: false, error: error.message || 'Registration failed' }
        }
      },
      
      logout: async () => {
        try {
          await authService.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({ user: null, token: null, isAuthenticated: false, error: null })
        }
      },
      
      googleLogin: async () => {
        set({ isLoading: true, error: null })
        try {
          // This will be implemented when Google OAuth is added to backend
          throw new Error('Google login not yet implemented')
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Google login failed'
          })
          return { success: false, error: error.message }
        }
      },

      // Get current user profile
      fetchUser: async () => {
        if (!get().token) return

        set({ isLoading: true })
        try {
          const response = await authService.getMe()
          set({ 
            user: response.data.user, 
            isAuthenticated: true,
            isLoading: false 
          })
        } catch (error) {
          console.error('Failed to fetch user:', error)
          set({ 
            user: null, 
            token: null,
            isAuthenticated: false,
            isLoading: false 
          })
        }
      },

      // Update user profile
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.updateProfile(profileData)
          set({ 
            user: response.data.user,
            isLoading: false 
          })
          return { success: true }
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message 
          })
          return { success: false, error: error.message }
        }
      },

      // Change password
      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null })
        try {
          await authService.changePassword({ currentPassword, newPassword })
          set({ isLoading: false })
          return { success: true, message: 'Password changed successfully' }
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message 
          })
          return { success: false, error: error.message }
        }
      },

      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)
