import { create } from 'zustand'

export const useTripStore = create((set, get) => ({
  currentTrip: null,
  suggestions: {
    transport: [],
    accommodation: [],
    itinerary: [],
    packing: []
  },
  isLoading: false,
  
  setCurrentTrip: (trip) => {
    set({ currentTrip: trip })
  },
  
  planTrip: async (tripData) => {
    set({ isLoading: true })
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const trip = {
        id: Date.now().toString(),
        ...tripData,
        createdAt: new Date().toISOString(),
        status: 'planned'
      }
      
      set({ currentTrip: trip, isLoading: false })
      return { success: true, trip }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.message }
    }
  },
  
  getSuggestions: async (tripId) => {
    set({ isLoading: true })
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const suggestions = {
        transport: [
          {
            id: '1',
            type: 'Flight',
            price: '₹15,000',
            duration: '2h 30m',
            description: 'Direct flight from source to destination'
          },
          {
            id: '2',
            type: 'Train',
            price: '₹2,500',
            duration: '4h 15m',
            description: 'Comfortable train journey with scenic views'
          },
          {
            id: '3',
            type: 'Bus',
            price: '₹800',
            duration: '6h 30m',
            description: 'Economical bus service'
          }
        ],
        accommodation: [
          {
            id: '1',
            name: 'Grand Hotel',
            type: 'Hotel',
            price: '₹6,000/night',
            rating: 4.5,
            amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant']
          },
          {
            id: '2',
            name: 'Budget Inn',
            type: 'Hostel',
            price: '₹1,500/night',
            rating: 3.8,
            amenities: ['WiFi', 'Shared Kitchen', 'Laundry']
          },
          {
            id: '3',
            name: 'Luxury Resort',
            type: 'Resort',
            price: '₹12,000/night',
            rating: 4.8,
            amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Beach Access']
          }
        ],
        itinerary: [
          {
            day: 1,
            title: 'Arrival & City Tour',
            activities: [
              'Check-in to hotel',
              'City center walking tour',
              'Local market visit',
              'Traditional dinner'
            ]
          },
          {
            day: 2,
            title: 'Historical Sites',
            activities: [
              'Museum visit',
              'Historical monument tour',
              'Local cuisine tasting',
              'Evening entertainment'
            ]
          },
          {
            day: 3,
            title: 'Nature & Adventure',
            activities: [
              'Nature park visit',
              'Hiking trail',
              'Photography session',
              'Departure'
            ]
          }
        ],
        packing: [
          { id: '1', item: 'Passport & ID', category: 'Documents', packed: false },
          { id: '2', item: 'Travel insurance', category: 'Documents', packed: false },
          { id: '3', item: 'Clothes (3-4 sets)', category: 'Clothing', packed: false },
          { id: '4', item: 'Toiletries', category: 'Personal Care', packed: false },
          { id: '5', item: 'Phone charger', category: 'Electronics', packed: false },
          { id: '6', item: 'Camera', category: 'Electronics', packed: false },
          { id: '7', item: 'First aid kit', category: 'Health', packed: false },
          { id: '8', item: 'Sunglasses', category: 'Accessories', packed: false }
        ]
      }
      
      set({ suggestions, isLoading: false })
      return { success: true, suggestions }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.message }
    }
  },
  
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
  }
}))
