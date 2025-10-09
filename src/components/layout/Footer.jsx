import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <span className="text-2xl font-bold text-primary">Plan My Journey</span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              Your ultimate travel companion for planning amazing trips across India and abroad, 
              finding travel buddies, and discovering incredible destinations from Kashmir to Kanyakumari.
            </p>
            {/* <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div> */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/plan-trip" className="text-gray-400 hover:text-white transition-colors">
                  Plan Trip
                </Link>
              </li>
              <li>
                <Link to="/pooling" className="text-gray-400 hover:text-white transition-colors">
                  Travel Pooling
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400">
                <MapPin className="h-4 w-4 mr-2" />
                <span>MANIT Bhopal, India</span>
              </li>
              {/* <li className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@planmyjourney.in</span>
              </li> */}
              <li className="flex items-center text-gray-400">
                <Phone className="h-4 w-4 mr-2" />
                <span>+91 6394196970</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Plan My Journey. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
