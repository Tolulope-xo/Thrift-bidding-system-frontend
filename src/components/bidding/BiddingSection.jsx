/**
 * BiddingSection Component
 * Allows users to place bids on an item
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import useAuthStore from '../../store/authStore';
import bidsService from '../../services/bidsService';

const BiddingSection = ({ item, onBidPlaced, disabled }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate minimum bid (5% increment or starting price)
  const calculateMinimumBid = () => {
    if (item.current_highest_bid === null || item.current_highest_bid === 0) {
      return parseFloat(item.starting_price);
    }
    // 5% increment, rounded up to nearest cent
    const minBid = parseFloat(item.current_highest_bid) * 1.05;
    return Math.ceil(minBid * 100) / 100;
  };

  const minimumBid = calculateMinimumBid();

  // Suggested bid amounts
  const suggestedBids = [
    minimumBid,
    minimumBid + 5,
    minimumBid + 10,
    minimumBid + 20
  ];

  // Check if user is the seller
  const isOwner = user?.id === item.seller_id;

  // Check if auction has ended
  const auctionEnded = new Date(item.auction_end_time) <= new Date();

  const handleBidChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setBidAmount(value);
      setError('');
    }
  };

  const handleSuggestedBidClick = (amount) => {
    setBidAmount(amount.toFixed(2));
    setError('');
  };

  const validateBid = () => {
    const amount = parseFloat(bidAmount);

    if (!bidAmount || isNaN(amount)) {
      setError('Please enter a valid bid amount');
      return false;
    }

    if (amount < minimumBid) {
      setError(`Bid must be at least $${minimumBid.toFixed(2)}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateBid()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await bidsService.placeBid(item.id, parseFloat(bidAmount));

      if (result.success) {
        setBidAmount('');
        // Notify parent component
        if (onBidPlaced) {
          onBidPlaced(result.data.bid);
        }
      }
    } catch (err) {
      console.error('Bid placement error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to place bid';
      setError(errorMessage);

      // If minimum bid changed (conflict), update minimum
      if (err.response?.data?.data?.minimumBid) {
        // Component will recalculate on re-render
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Place a Bid</h3>
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">Please log in to place a bid</p>
          <a
            href="/login"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
          >
            Log In
          </a>
        </div>
      </div>
    );
  }

  // If user is the owner, show message
  if (isOwner) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Place a Bid</h3>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-600">You cannot bid on your own item</p>
        </div>
      </div>
    );
  }

  // If auction has ended, show message
  if (auctionEnded) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Auction Ended</h3>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-600">This auction has ended</p>
          {item.current_highest_bid && (
            <p className="mt-2 text-lg font-bold text-gray-900">
              Final Price: ${parseFloat(item.current_highest_bid).toFixed(2)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Place a Bid</h3>

      {/* Current Bid Info */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Current Bid:</span>
          <span className="text-2xl font-bold text-gray-900">
            ${item.current_highest_bid
              ? parseFloat(item.current_highest_bid).toFixed(2)
              : parseFloat(item.starting_price).toFixed(2)}
          </span>
        </div>
        {item.bid_count > 0 && (
          <p className="text-xs text-gray-500 text-right">
            {item.bid_count} bid{item.bid_count !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Minimum Bid */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Minimum bid: <span className="font-semibold text-gray-900">${minimumBid.toFixed(2)}</span>
        </p>
      </div>

      {/* Suggested Bids */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Quick bids:</p>
        <div className="grid grid-cols-2 gap-2">
          {suggestedBids.map((amount, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestedBidClick(amount)}
              disabled={isSubmitting || disabled}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ${amount.toFixed(2)}
            </button>
          ))}
        </div>
      </div>

      {/* Bid Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-2">
            Your Bid ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="text"
              id="bidAmount"
              value={bidAmount}
              onChange={handleBidChange}
              disabled={isSubmitting || disabled}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
              placeholder="0.00"
            />
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || disabled || !bidAmount}
          className="w-full bg-primary-600 text-white px-6 py-3 rounded-md font-medium bg-black hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
        </button>
      </form>

      {/* Info Text */}
      <div className="mt-4 text-xs text-gray-500">
        <p>By placing a bid, you agree to purchase this item if you win.</p>
      </div>
    </div>
  );
};

BiddingSection.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    seller_id: PropTypes.string.isRequired,
    starting_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    current_highest_bid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    bid_count: PropTypes.number,
    auction_end_time: PropTypes.string.isRequired
  }).isRequired,
  onBidPlaced: PropTypes.func,
  disabled: PropTypes.bool
};

BiddingSection.defaultProps = {
  onBidPlaced: null,
  disabled: false
};

export default BiddingSection;
