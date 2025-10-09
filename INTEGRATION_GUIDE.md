# Plan My Journey - Frontend Integration Guide

## Overview

The frontend has been fully integrated with the backend API. This guide explains the architecture, features, and how to use the application.

## Architecture

### Service Layer (`src/services/`)

All API calls are centralized in service modules:

- **`api.js`**: Base axios configuration with interceptors
- **`authService.js`**: Authentication endpoints
- **`tripService.js`**: Trip planning and management
- **`poolingService.js`**: Travel pooling features
- **`busService.js`**: Bus listing and booking
- **`hotelService.js`**: Hotel listing and booking
- **`bookingService.js`**: Booking management
- **`packageService.js`**: Package deals
- **`analyticsService.js`**: Analytics and statistics
- **`adminService.js`**: Admin-only features

### State Management (`src/store/`)

Using Zustand for global state:

- **`authStore.js`**: Authentication state and user session
- **`tripStore.js`**: Trip planning and suggestions
- **`poolingStore.js`**: Travel pooling groups
- **`bookingStore.js`**: User bookings

### Pages

1. **Public Pages**
   - `/login` - User login
   - `/register` - User registration
   - `/` - Home page (accessible to all)

2. **Protected Pages** (require authentication)
   - `/plan-trip` - Plan a new trip
   - `/suggestions` - View trip suggestions (transport, accommodation, itinerary)
   - `/pooling` - Browse and create travel pooling groups
   - `/buses` - Browse available buses
   - `/hotels` - Browse available hotels
   - `/bookings` - View and manage bookings
   - `/admin` - Admin dashboard (ADMIN role only)

## Features

### 1. Authentication

- Email/password login and registration
- JWT token-based authentication
- Persistent sessions (localStorage)
- Auto-logout on 401 responses
- Google OAuth placeholder (ready for implementation)

### 2. Trip Planning

- Create trips with source, destination, dates, and budget
- View trip suggestions:
  - Transport options (buses)
  - Accommodation options (hotels)
  - Itinerary suggestions
  - Packing checklist
  - Package deals

### 3. Travel Pooling

- Create pool groups for trips
- Browse available pool groups
- Join existing groups (requires approval)
- Manage group members (creator/admin)
- Filter by destination and search

### 4. Bus & Hotel Booking

- Browse buses with filters (price, capacity)
- Browse hotels with filters (location, price, rating)
- View amenities and details
- Check seat/room availability

### 5. Booking Management

- Create bookings for buses and hotels
- View all bookings with status
- Cancel pending bookings
- Filter by status (Pending, Confirmed, Cancelled)

### 6. Admin Dashboard

- View system statistics
  - Total users
  - Total trips
  - Active pool groups
  - Total bookings
- Manage users
  - View all users
  - Update user roles
- Approve/reject pool group join requests

## API Integration

### Request Flow

1. **Request Interceptor** (in `api.js`)
   - Automatically adds JWT token from localStorage
   - Sets Content-Type headers

2. **Response Interceptor** (in `api.js`)
   - Extracts response data
   - Handles errors gracefully
   - Auto-redirects to login on 401 Unauthorized

### Error Handling

All API calls return a consistent format:

```javascript
{
  success: true/false,
  data: {...}, // on success
  error: "Error message" // on failure
}
```

### Authentication Token

- Stored in localStorage as `auth-token`
- Automatically included in all API requests
- Cleared on logout or 401 responses

## Setup Instructions

### 1. Install Dependencies

```bash
cd pmj-frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Backend

Make sure the backend is running on port 5000:

```bash
cd ../pmj-backend
npm run dev
```

### 4. Start Frontend

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Testing the Integration

### 1. Registration & Login

1. Navigate to `/register`
2. Create a new account
3. You'll be automatically logged in and redirected to home

### 2. Plan a Trip

1. Go to "Plan Trip" in navbar
2. Fill in trip details
3. Submit to create a trip
4. View suggestions on the suggestions page

### 3. Create a Pool Group

1. First, create a trip (if not already done)
2. Go to "Travel Pooling"
3. Click "Create Trip"
4. Select your trip and set group size
5. Submit to create the pool group

### 4. Browse Buses & Hotels

1. Click "Buses" or "Hotels" in navbar
2. Use filters to find options
3. View details and availability

### 5. Admin Features

1. Login with admin credentials
2. "Admin" link will appear in navbar
3. Access dashboard to:
   - View statistics
   - Manage users
   - Approve pool group requests

## Default Admin Credentials

From the backend seed data:

```
Email: admin@pmj.com
Password: admin123
```

## Key Components

### Protected Route

Wraps authenticated pages and redirects to login if not authenticated.

### Navbar

- Dynamic navigation based on user role
- Shows admin link for admin users
- Displays user name when logged in

### Forms

All forms include:

- Client-side validation
- Error display
- Loading states
- Success/error feedback

## API Response Handling

### Success Response

```javascript
{
  success: true,
  message: "Operation successful",
  data: {
    // Response data
  }
}
```

### Error Response

```javascript
{
  message: "Error message",
  status: 400,
  data: {
    // Error details
  }
}
```

## State Persistence

- **Auth state**: Persisted in localStorage via Zustand persist middleware
- **JWT token**: Stored separately in localStorage
- **Other states**: Session-only (cleared on page refresh)

## Best Practices

1. **Always check authentication** before making API calls
2. **Handle loading states** to provide user feedback
3. **Display error messages** clearly to users
4. **Validate forms** before submission
5. **Clear errors** when user starts correcting input

## Troubleshooting

### CORS Errors

- Ensure backend is running
- Check CORS configuration in backend
- Verify VITE_API_URL is correct

### 401 Unauthorized

- Token may have expired
- Login again to get new token
- Check token is being sent in requests

### Data Not Loading

- Check backend is running
- Verify API endpoint URLs
- Check browser console for errors
- Verify database has seeded data

### Cannot Create Bookings

- Ensure you have created a trip first
- Check that buses/hotels exist in database
- Verify trip dates are valid

## Future Enhancements

1. **Google OAuth Integration**
   - Backend endpoint ready
   - Frontend UI ready
   - Needs OAuth configuration

2. **Real-time Updates**
   - WebSocket support for pool groups
   - Live notifications for bookings

3. **Payment Integration**
   - Payment gateway for bookings
   - Booking confirmation flow

4. **Advanced Filters**
   - More filter options for buses/hotels
   - Date range selection
   - Price range sliders

5. **User Profile**
   - Edit profile page
   - Upload profile picture
   - View booking history

## Support

For issues or questions:

- Check backend logs for API errors
- Check browser console for frontend errors
- Verify all environment variables are set
- Ensure database migrations are up to date
