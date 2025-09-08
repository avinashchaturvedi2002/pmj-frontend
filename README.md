# Plan My Journey 🚀

A modern, production-ready React travel planning platform designed specifically for Indian travelers. Plan your perfect journey across India and abroad with smart suggestions, travel pooling, and detailed itineraries.

## ✨ Features

### 🏠 **Home Page**

- Popular destinations across India and abroad
- Beautiful destination cards with INR pricing
- Responsive grid layout with smooth animations

### 🔐 **Authentication**

- Login and Signup pages with form validation
- Google login placeholder for future integration
- Persistent authentication state with Zustand

### 🗺️ **Trip Planning**

- Comprehensive trip planning form
- Budget input in INR
- Source and destination selection
- Number of days and people configuration

### 💡 **Smart Suggestions**

- **Transport Options**: Flight, Train, Bus with INR pricing
- **Accommodation**: Hotels, Hostels, Resorts with amenities
- **Itinerary**: Day-wise detailed plans
- **Packing List**: Interactive checklist with categories

### 👥 **Travel Pooling**

- Create and join shared trips
- Find travel buddies for cost sharing
- Indian destinations focus (Goa, Kashmir, Kerala, Rajasthan)
- International options (Singapore, etc.)

### 🎨 **UI/UX Features**

- Dark mode toggle with persistence
- Smooth animations with Framer Motion
- Mobile-first responsive design
- Modern shadcn/ui components

## 🛠️ Tech Stack

- **Frontend**: React 18 + JavaScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS v3 + shadcn/ui
- **Routing**: React Router v6
- **State Management**: Zustand with persistence
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Code Quality**: ESLint + Prettier

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd pmj-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── layout/         # Layout components (Navbar, Footer)
├── pages/              # Route pages
│   ├── Home.jsx        # Landing page with destinations
│   ├── Login.jsx       # Authentication pages
│   ├── Register.jsx
│   ├── TripPlan.jsx    # Trip planning form
│   ├── Suggestions.jsx # Transport, accommodation, itinerary
│   └── Pooling.jsx     # Travel pooling feature
├── store/              # Global state management
│   ├── authStore.js    # Authentication state
│   └── tripStore.js    # Trip planning state
├── layouts/            # Layout components
├── lib/                # Utility functions
└── utils/              # Helper functions
```

## 🎯 Key Features Explained

### Indian-Focused Design

- **INR Currency**: All pricing in Indian Rupees
- **Indian Destinations**: Goa, Kashmir, Kerala, Rajasthan
- **Local Context**: Indian phone numbers, addresses, email domains
- **Cultural Relevance**: Descriptions tailored for Indian travelers

### Smart Trip Planning

- **Budget Planning**: INR-based budget calculations
- **Transport Options**: Indian railway, bus, and flight options
- **Accommodation**: Mix of budget and luxury options
- **Itinerary**: Day-wise plans with local activities

### Travel Pooling

- **Cost Sharing**: Find travel buddies to split expenses
- **Indian Destinations**: Popular Indian tourist spots
- **Community Building**: Connect with fellow Indian travelers

## 🎨 Design System

### Color Palette

- **Primary**: Blue tones for trust and reliability
- **Secondary**: Complementary colors for accents
- **Dark Mode**: Full dark theme support

### Typography

- **Headings**: Bold, modern fonts
- **Body**: Clean, readable text
- **Responsive**: Scales across all devices

### Components

- **Cards**: Modern card design with shadows
- **Buttons**: Multiple variants (primary, secondary, outline)
- **Forms**: Clean input fields with validation
- **Navigation**: Responsive navbar with mobile menu

## 🔧 Configuration

### TailwindCSS

- Custom color scheme with CSS variables
- Dark mode support
- Responsive breakpoints
- Custom animations

### State Management

- **Zustand**: Lightweight state management
- **Persistence**: Authentication state saved to localStorage
- **Mock APIs**: Simulated API calls with realistic delays

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet**: Enhanced layout for tablets
- **Desktop**: Full-featured desktop experience
- **Touch Friendly**: Large touch targets for mobile

## 🌙 Dark Mode

- **Toggle**: Easy dark/light mode switching
- **Persistence**: Theme preference saved
- **Smooth Transition**: Animated theme changes
- **Accessibility**: High contrast ratios

## 🚀 Performance

- **Vite**: Fast development and build times
- **Code Splitting**: Optimized bundle sizes
- **Lazy Loading**: Components loaded on demand
- **Optimized Images**: Responsive image handling

## 🔒 Security

- **Form Validation**: Client-side validation
- **Protected Routes**: Authentication required for sensitive pages
- **Mock Authentication**: Simulated secure login flow

## 📈 Future Enhancements

- [ ] Real API integration
- [ ] Google Maps integration
- [ ] Real-time chat for travel pooling
- [ ] Payment gateway integration
- [ ] Mobile app (React Native)
- [ ] Advanced filtering and search
- [ ] User reviews and ratings
- [ ] Social media integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email info@planmyjourney.in or call +91 98765 43210

---

**Plan My Journey** - Making travel planning simple, social, and affordable for Indian travelers! 🇮🇳✈️
