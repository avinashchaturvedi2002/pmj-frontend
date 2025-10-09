import { create } from 'zustand'
import { bookingService } from '../services'

export const useBookingStore = create((set, get) => ({
  bookings: [],
  currentBooking: null,
  isLoading: false,
  error: null,

  // Create booking
  createBooking: async (bookingData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await bookingService.createBooking(bookingData)
      const booking = response.data.booking

      set(state => ({
        bookings: [booking, ...state.bookings],
        currentBooking: booking,
        isLoading: false
      }))

      return { success: true, booking }
    } catch (error) {
      set({ isLoading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Fetch all user bookings
  fetchBookings: async (filters = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await bookingService.getAllBookings(filters)
      set({ 
        bookings: response.data.bookings || [],
        isLoading: false 
      })
    } catch (error) {
      set({ isLoading: false, error: error.message })
    }
  },

  // Get booking by ID
  fetchBookingById: async (bookingId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await bookingService.getBookingById(bookingId)
      set({ 
        currentBooking: response.data.booking,
        isLoading: false 
      })
      return { success: true, booking: response.data.booking }
    } catch (error) {
      set({ isLoading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    set({ isLoading: true, error: null })
    try {
      await bookingService.cancelBooking(bookingId)

      set(state => ({
        bookings: state.bookings.map(b => 
          b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
        ),
        isLoading: false
      }))

      return { success: true, message: 'Booking cancelled successfully' }
    } catch (error) {
      set({ isLoading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}))


