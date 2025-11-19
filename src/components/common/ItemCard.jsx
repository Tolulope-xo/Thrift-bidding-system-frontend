
import { Link } from 'react-router-dom';
import Countdown from './Countdown';

const ItemCard = ({ item }) => {
  const mainImage = item.image_urls?.[0] || '/placeholder-image.png';
  const currentPrice = item.current_highest_bid || item.starting_price;

  return (
    <Link
      to={`/items/${item.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={mainImage}
          alt={item.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        {/* Category Badge */}
        <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-medium">
          {item.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
          {item.title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-primary-600">
            ${currentPrice?.toFixed(2)}
          </span>
          {item.current_highest_bid && (
            <span className="text-sm text-gray-500">(current bid)</span>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-1 text-sm text-gray-600">
          {/* Seller */}
          {item.users?.username && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{item.users.username}</span>
              {item.users.seller_rating > 0 && (
                <span className="text-yellow-500">★ {item.users.seller_rating.toFixed(1)}</span>
              )}
            </div>
          )}

          {/* Time Remaining */}
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <Countdown endTime={item.auction_end_time} />
            <span className="text-gray-500">left</span>
          </div>

          {/* Condition */}
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{item.condition}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
