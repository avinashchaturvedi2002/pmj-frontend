import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email, password) => {
        set({ isLoading: true })
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Mock user data
          const user = {
            id: '1',
            email,
            name: email.split('@')[0],
            avatar: null
          }
          
          set({ user, isAuthenticated: true, isLoading: false })
          return { success: true, user }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
      },
      
      register: async (email, password, name) => {
        set({ isLoading: true })
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Mock user data
          const user = {
            id: '1',
            email,
            name,
            avatar: null
          }
          
          set({ user, isAuthenticated: true, isLoading: false })
          return { success: true, user }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
      
      googleLogin: async () => {
        set({ isLoading: true })
        try {
          // Mock Google login
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const user = {
            id: '1',
            email: 'user@gmail.com',
            name: 'Google User',
            avatar: 'https://via.placeholder.com/40'
          }
          
          set({ user, isAuthenticated: true, isLoading: false })
          return { success: true, user }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
)
