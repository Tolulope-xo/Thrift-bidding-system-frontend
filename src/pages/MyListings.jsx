
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import itemsService from '../services/itemsService';
import Countdown from '../components/common/Countdown';
import { format } from 'date-fns';

const MyListings = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchMyListings();
  }, [statusFilter]);

  const fetchMyListings = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await itemsService.getMyListings(statusFilter);
      setItems(response.data.items);
    } catch (err) {
      setError(err.message || 'Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await itemsService.deleteItem(id);
      setItems(items.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete item');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800',
      sold: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.active}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <Link
              to="/create-listing"
              className="bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Listing
            </Link>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-md font-medium ${
                statusFilter === '' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-md font-medium ${
                statusFilter === 'active' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('expired')}
              className={`px-4 py-2 rounded-md font-medium ${
                statusFilter === 'expired' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Expired
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your listings...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Listings Table */}
        {!loading && !error && items.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Left
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={item.image_urls?.[0] || 'https://via.placeholder.com/100'}
                            alt={item.title}
                            className="h-16 w-16 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                            }}
                          />
                          <div className="ml-4">
                            <Link
                              to={`/items/${item.id}`}
                              className="text-sm font-medium text-gray-900 hover:text-primary-600"
                            >
                              {item.title}
                            </Link>
                            <div className="text-sm text-gray-500">{item.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${(item.current_highest_bid || item.starting_price)?.toFixed(2)}
                        </div>
                        {item.current_highest_bid && (
                          <div className="text-xs text-gray-500">Current bid</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.status === 'active' ? (
                          <Countdown endTime={item.auction_end_time} />
                        ) : (
                          <span className="text-sm text-gray-500">
                            {format(new Date(item.auction_end_time), 'MMM dd, yyyy')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.view_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/items/${item.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View
                          </Link>
                          {!item.current_highest_bid && item.status === 'active' && (
                            <>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => navigate(`/items/${item.id}/edit`)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => handleDelete(item.id, item.title)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No listings</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter ? `No ${statusFilter} listings found.` : 'Get started by creating a new listing.'}
            </p>
            <div className="mt-6">
              <Link
                to="/create-listing"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Listing
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
