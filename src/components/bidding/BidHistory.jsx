/**
 * BidHistory Component
 * Displays the history of bids on an item
 */

import { formatDistanceToNow } from 'date-fns';
import PropTypes from 'prop-types';

const BidHistory = ({ bids, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bid History</h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!bids || bids.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bid History</h3>
        <div className="text-center py-8">
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
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-gray-500">No bids yet</p>
          <p className="mt-1 text-sm text-gray-400">Be the first to place a bid!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Bid History</h3>
        <span className="text-sm text-gray-500">{bids.length} bid{bids.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {bids.map((bid, index) => (
          <div
            key={bid.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              bid.is_current_highest
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {bid.bidder_username}
                </span>
                {bid.is_current_highest && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Winning Bid
                  </span>
                )}
                {index === 0 && !bid.is_current_highest && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Latest
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {formatDistanceToNow(new Date(bid.placed_at), { addSuffix: true })}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${
                bid.is_current_highest ? 'text-green-600' : 'text-gray-900'
              }`}>
                ${parseFloat(bid.bid_amount).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {bids.length >= 50 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing latest 50 bids
        </div>
      )}
    </div>
  );
};

BidHistory.propTypes = {
  bids: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      bid_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      bidder_username: PropTypes.string.isRequired,
      placed_at: PropTypes.string.isRequired,
      is_current_highest: PropTypes.bool
    })
  ),
  loading: PropTypes.bool
};

BidHistory.defaultProps = {
  bids: [],
  loading: false
};

export default BidHistory;
