import { create } from 'zustand'
import { tripService, busService, hotelService, packageService } from '../services'

export const useTripStore = create((set, get) => ({
  currentTrip: null,
  trips: [],
  suggestions: {
    transport: [],
    accommodation: [],
    itinerary: [],
    packing: [],
    packages: []
  },
  isLoading: false,
  error: null,
  
  setCurrentTrip: (trip) => {
    set({ currentTrip: trip })
  },
  
  // Plan/Create a new trip
  planTrip: async (tripData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await tripService.createTrip(tripData)
      const trip = response.data.trip
      
      set({ 
        currentTrip: trip, 
        isLoading: false 
      })
      
      return { success: true, trip }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message 
      })
      return { success: false, error: error.message }
    }
  },

  // Get all user trips
  fetchTrips: async (filters = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await tripService.getAllTrips(filters)
      set({ 
        trips: response.data.trips || [],
        isLoading: false 
      })
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message 
      })
    }
  },

  // Get trip by ID
  fetchTripById: async (tripId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await tripService.getTripById(tripId)
      set({ 
        currentTrip: response.data.trip,
        isLoading: false 
      })
      return { success: true, trip: response.data.trip }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message 
      })
      return { success: false, error: error.message }
    }
  },

  // Update trip
  updateTrip: async (tripId, tripData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await tripService.updateTrip(tripId, tripData)
      const updatedTrip = response.data.trip

      // Update in trips list
      set(state => ({
        trips: state.trips.map(t => t.id === tripId ? updatedTrip : t),
        currentTrip: state.currentTrip?.id === tripId ? updatedTrip : state.currentTrip,
        isLoading: false
      }))

      return { success: true, trip: updatedTrip }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message 
      })
      return { success: false, error: error.message }
    }
  },

  // Delete trip
  deleteTrip: async (tripId) => {
    set({ isLoading: true, error: null })
    try {
      await tripService.deleteTrip(tripId)

      set(state => ({
        trips: state.trips.filter(t => t.id !== tripId),
        currentTrip: state.currentTrip?.id === tripId ? null : state.currentTrip,
        isLoading: false
      }))

      return { success: true }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.message 
      })
      return { success: false, error: error.message }
    }
  },
  
  // Get suggestions for a trip
  getSuggestions: async (tripId) => {
    set({ isLoading: true, error: null })
    try {
      // Fetch buses, hotels, and packages in parallel
      const [busesRes, hotelsRes, packagesRes] = await Promise.all([
        busService.getAllBuses({ limit: 10 }),
        hotelService.getAllHotels({ limit: 10 }),
        packageService.getAllPackages({ tripId, isActive: true })
      ])
      
      // Transform data to match frontend expectations
      const suggestions = {
        transport: (busesRes.data.buses || []).slice(0, 3).map(bus => ({
          id: bus.id,
          type: 'Bus',
          name: bus.busName,
          price: `₹${bus.pricePerSeat}`,
          duration: '2-6 hours',
          description: bus.amenities || 'Comfortable bus service',
          busNumber: bus.busNumber,
          capacity: bus.capacity
        })),
        accommodation: (hotelsRes.data.hotels || []).slice(0, 3).map(hotel => ({
          id: hotel.id,
          name: hotel.name,
          type: 'Hotel',
          price: `₹${hotel.pricePerRoom}/night`,
          rating: hotel.rating || 4.0,
          amenities: hotel.amenities ? hotel.amenities.split(',').map(a => a.trim()) : ['WiFi', 'Restaurant'],
          location: hotel.location
        })),
        itinerary: [
          {
            day: 1,
            title: 'Arrival & Check-in',
            activities: [
              'Arrive at destination',
              'Check-in to hotel',
              'Local area exploration',
              'Welcome dinner'
            ]
          },
          {
            day: 2,
            title: 'Sightseeing',
            activities: [
              'Visit major attractions',
              'Local cuisine tasting',
              'Shopping at local markets',
              'Evening entertainment'
            ]
          },
          {
            day: 3,
            title: 'Adventure & Departure',
            activities: [
              'Adventure activities',
              'Last-minute shopping',
              'Check-out and departure',
              'Journey back home'
            ]
          }
        ],
        packing: [
          { id: '1', item: 'Passport & ID', category: 'Documents', packed: false },
          { id: '2', item: 'Travel tickets', category: 'Documents', packed: false },
          { id: '3', item: 'Clothes (3-4 sets)', category: 'Clothing', packed: false },
          { id: '4', item: 'Toiletries', category: 'Personal Care', packed: false },
          { id: '5', item: 'Phone charger', category: 'Electronics', packed: false },
          { id: '6', item: 'Camera', category: 'Electronics', packed: false },
          { id: '7', item: 'First aid kit', category: 'Health', packed: false },
          { id: '8', item: 'Sunglasses', category: 'Accessories', packed: false }
        ],
        packages: (packagesRes.data.packages || []).map(pkg => ({
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          price: `₹${pkg.price}`,
          discount: pkg.discount,
          bus: pkg.bus,
          hotel: pkg.hotel
        }))
      }
      
      set({ 
        suggestions, 
        isLoading: false 
      })
      
      return { success: true, suggestions }
    } catch (error) {
      console.error('Get suggestions error:', error)
      set({ 
        isLoading: false, 
        error: error.message 
      })
      return { success: false, error: error.message }
    }
  },
  
  // Toggle packing item
  togglePackingItem: (itemId) => {
    const { suggestions } = get()
    const updatedPacking = suggestions.packing.map(item =>
      item.id === itemId ? { ...item, packed: !item.packed } : item
    )
    set({
      suggestions: {
        ...suggestions,
        packing: updatedPacking
      }
    })
  },

  // Clear error
  clearError: () => set({ error: null })
}))
