/**
 * ItemDetail Page
 * Single item view with full details and real-time bidding
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import itemsService from '../services/itemsService';
import bidsService from '../services/bidsService';
import socketService from '../services/socketService';
import useAuthStore from '../store/authStore';
import Countdown from '../components/common/Countdown';
import BiddingSection from '../components/bidding/BiddingSection';
import BidHistory from '../components/bidding/BidHistory';
import { format } from 'date-fns';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [item, setItem] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidsLoading, setBidsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);

  // Fetch item details
  useEffect(() => {
    fetchItem();
    fetchBids();
  }, [id]);

  // Socket.IO real-time updates
  useEffect(() => {
    // Connect to Socket.IO
    socketService.connect();

    // Join the item room
    socketService.joinItemRoom(id);

    // Listen for new bids
    socketService.onNewBid((data) => {
      if (data.itemId === id) {
        console.log('New bid received via Socket.IO:', data.bid);

        // Update item's current highest bid and bid count
        setItem((prevItem) => ({
          ...prevItem,
          current_highest_bid: data.bid.current_highest_bid,
          bid_count: data.bid.bid_count
        }));

        // Add new bid to history
        setBids((prevBids) => [
          {
            id: data.bid.id,
            bid_amount: data.bid.bid_amount,
            bidder_username: data.bid.bidder_username,
            placed_at: data.bid.placed_at,
            is_current_highest: true
          },
          ...prevBids.map((b) => ({ ...b, is_current_highest: false }))
        ]);
      }
    });

    // Listen for auction ended
    socketService.onAuctionEnded((data) => {
      if (data.itemId === id) {
        console.log('Auction ended via Socket.IO:', data.result);
        setAuctionEnded(true);
        setItem((prevItem) => ({
          ...prevItem,
          status: data.result.status
        }));
      }
    });

    // Cleanup on unmount
    return () => {
      socketService.leaveItemRoom(id);
      socketService.off('new-bid');
      socketService.off('auction-ended');
    };
  }, [id]);

  const fetchItem = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await itemsService.getItemById(id);
      setItem(response.data.item);

      // Check if auction has already ended
      if (new Date(response.data.item.auction_end_time) <= new Date()) {
        setAuctionEnded(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    setBidsLoading(true);

    try {
      const response = await bidsService.getItemBids(id, 50);
      setBids(response.data.bids || []);
    } catch (err) {
      console.error('Failed to fetch bids:', err);
    } finally {
      setBidsLoading(false);
    }
  };

  const handleBidPlaced = (newBid) => {
    console.log('Bid placed successfully:', newBid);
    // Socket.IO will handle the update, but we can also fetch to ensure sync
    fetchBids();
  };

  const handleAuctionExpire = () => {
    setAuctionEnded(true);
    fetchItem(); // Refresh to get final status
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    setIsDeleting(true);

    try {
      await itemsService.deleteItem(id);
      navigate('/my-listings');
    } catch (err) {
      alert(err.message || 'Failed to delete item');
      setIsDeleting(false);
    }
  };

  const isOwner = user && item && user.id === item.seller_id;
  const canEdit = isOwner && !item?.current_highest_bid;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading item...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'This item does not exist.'}</p>
          <Link to="/browse" className="text-primary-600 hover:text-primary-700">
            Browse Items
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = item.current_highest_bid || item.starting_price;
  const images = item.image_urls || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            {/* Image Gallery */}
            <div className="p-6">
              {/* Main Image */}
              <div className="mb-4">
                <img
                  src={images[currentImageIndex] || 'https://via.placeholder.com/600x400?text=No+Image'}
                  alt={item.title}
                  className="w-full h-96 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                  }}
                />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`border-2 rounded-lg overflow-hidden ${
                        index === currentImageIndex ? 'border-primary-600' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${item.title} ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="p-6">
              {/* Title and Category */}
              <div className="mb-4">
                <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                  {item.category}
                </span>
                <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-primary-600">
                    ${currentPrice?.toFixed(2)}
                  </span>
                  {item.current_highest_bid ? (
                    <span className="text-lg text-gray-600">(current bid)</span>
                  ) : (
                    <span className="text-lg text-gray-600">(starting price)</span>
                  )}
                </div>
              </div>

              {/* Time Remaining */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Time Remaining:</span>
                  <Countdown endTime={item.auction_end_time} showFull onExpire={handleAuctionExpire} />
                </div>
              </div>

              {/* Bid Count */}
              {item.bid_count > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{item.bid_count}</span> bid{item.bid_count !== 1 ? 's' : ''} placed
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="mb-6 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Condition: <strong>{item.condition}</strong></span>
                </div>

                {item.location && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Location: {item.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{item.view_count || 0} views</span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Listed {format(new Date(item.created_at), 'MMM dd, yyyy')}</span>
                </div>
              </div>

              {/* Seller Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Seller</h3>
                <Link
                  to={`/items/user/${item.seller_id}`}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">{item.users?.username}</span>
                  {item.users?.seller_rating > 0 && (
                    <span className="text-yellow-500">★ {item.users.seller_rating.toFixed(1)}</span>
                  )}
                </Link>
              </div>

              {/* Owner Actions */}
              {isOwner && (
                <div className="space-y-2">
                  {canEdit && (
                    <button
                      onClick={() => navigate(`/items/${id}/edit`)}
                      className="w-full bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700"
                    >
                      Edit Listing
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting || !canEdit}
                    className="w-full bg-red-600 text-white px-6 py-3 rounded-md font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Listing'}
                  </button>
                  {!canEdit && (
                    <p className="text-sm text-gray-600 text-center">
                      Cannot edit or delete - item has received bids
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
          </div>
        </div>

        {/* Bidding and History Section */}
        {!isOwner && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bidding Section */}
            <BiddingSection
              item={item}
              onBidPlaced={handleBidPlaced}
              disabled={auctionEnded}
            />

            {/* Bid History */}
            <BidHistory bids={bids} loading={bidsLoading} />
          </div>
        )}

        {/* Auction Result (if ended) */}
        {auctionEnded && item.status === 'sold' && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-900 mb-2">Auction Ended</h3>
            <p className="text-green-700">
              This auction has ended. Final price: ${parseFloat(item.current_highest_bid || 0).toFixed(2)}
            </p>
            {isAuthenticated && user && bids.length > 0 && bids[0].bidder_username === user.username && (
              <div className="mt-4 p-4 bg-green-100 rounded-lg">
                <p className="text-green-900 font-bold">Congratulations! You won this auction!</p>
                <p className="text-green-800 text-sm mt-1">
                  The seller will contact you soon with payment and pickup details.
                </p>
              </div>
            )}
          </div>
        )}

        {auctionEnded && item.status === 'expired' && (
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Auction Ended</h3>
            <p className="text-gray-700">This auction ended with no bids.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetail;
