/**
 * Home Page
 * Landing page for the application
 */

import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Home = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl">
            Welcome to <span className="text-primary-600">ThriftBid</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Discover unique treasures, bid on amazing thrift items, and join our
            growing community of thrift enthusiasts.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/browse"
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
                >
                  Browse Items
                </Link>
                <Link
                  to="/create-listing"
                  className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-medium hover:bg-primary-50 transition"
                >
                  Sell an Item
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/browse"
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
                >
                  Browse Items
                </Link>
                <Link
                  to="/register"
                  className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-medium hover:bg-primary-50 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Bidding</h3>
            <p className="text-gray-600">
              Place bids on your favorite items with our simple and intuitive bidding
              system.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-3xl mb-4">💎</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Unique Finds</h3>
            <p className="text-gray-600">
              Discover one-of-a-kind thrift items from sellers around your area.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-3xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Trusted Community</h3>
            <p className="text-gray-600">
              Buy and sell with confidence in our rated and reviewed community.
            </p>
          </div>
        </div>

        {/* Phase 2 Notice */}
        <div className="mt-20 bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Phase 2 Complete!</h2>
          <p className="text-gray-700 mb-3">
            Item listing and browsing functionality is now live! You can now:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
            <li>Browse all active thrift items</li>
            <li>List your own items for auction</li>
            <li>Upload multiple images per item</li>
            <li>Filter and search items by category, condition, and price</li>
            <li>View real-time auction countdowns</li>
            <li>Manage your listings</li>
          </ul>
          <p className="text-gray-600 text-sm">
            Coming in Phase 3: Real-time bidding, favorites, messaging, and more!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
