/**
 * Header Component
 * Navigation header for the application
 */

import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import authService from '../../services/authService';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">Thrift</span>
              <span className="text-2xl font-bold text-gray-900">Bid</span>
            </Link>

            {/* Main Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/browse"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Browse Items
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/create-listing"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sell Item
                  </Link>
                  <Link
                    to="/my-listings"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    My Listings
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* User Navigation */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Profile
                </Link>
                <span className="text-gray-500 text-sm hidden sm:inline">
                  Hi, {user?.username || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
