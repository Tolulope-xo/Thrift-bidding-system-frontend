import { useState } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Gavel, Lock, ShieldCheck } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import bidsService from '../../services/bidsService';
import { Button } from '../ui';
import { EASE, formatMoney } from '../../lib/motion';

/** Price that slides + flashes whenever its value changes */
export const AnimatedPrice = ({ value, className = '' }) => (
  <span className={`relative inline-flex overflow-hidden ${className}`}>
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ y: '70%', opacity: 0, color: '#ff4f1a' }}
        animate={{ y: '0%', opacity: 1, color: 'var(--color-ink)' }}
        exit={{ y: '-70%', opacity: 0 }}
        transition={{ duration: 0.5, ease: EASE, color: { duration: 1.4 } }}
        className="tabular inline-block"
      >
        {formatMoney(value)}
      </motion.span>
    </AnimatePresence>
  </span>
);

AnimatedPrice.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
};

const Shell = ({ title, children }) => (
  <div className="rounded-2xl border border-line bg-paper/70 p-5">
    {title && <h3 className="mb-3 text-sm font-semibold text-ink">{title}</h3>}
    {children}
  </div>
);

Shell.propTypes = { title: PropTypes.node, children: PropTypes.node };

const BiddingSection = ({ item, onBidPlaced = null, disabled = false }) => {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <Shell>
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-ink shadow-soft">
            <Lock className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Log in to place a bid</p>
            <p className="mt-0.5 text-[13px] text-muted">Join free and bid on this lot in seconds.</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button to="/login" variant="primary" size="md">Log in</Button>
          <Button to="/register" variant="outline" size="md">Sign up</Button>
        </div>
      </Shell>
    );
  }

  // If user is the owner, show message
  if (isOwner) {
    return (
      <Shell>
        <p className="text-center text-sm text-muted">You can&apos;t bid on your own listing.</p>
      </Shell>
    );
  }

  // If auction has ended, show message
  if (auctionEnded) {
    return (
      <Shell title="Bidding closed">
        <p className="text-sm text-muted">This auction has ended.</p>
        {item.current_highest_bid && (
          <p className="mt-2 text-sm text-ink-2">
            Final price{' '}
            <span className="tabular font-mono text-lg font-semibold text-ink">
              {formatMoney(item.current_highest_bid)}
            </span>
          </p>
        )}
      </Shell>
    );
  }

  const busy = isSubmitting || disabled;

  return (
    <div className="rounded-2xl border border-line bg-paper/70 p-4 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">Place your bid</h3>
        <p className="text-[13px] text-muted">
          Min <span className="tabular font-mono font-semibold text-ink">{formatMoney(minimumBid)}</span>
        </p>
      </div>

      {/* Quick bids */}
      <div className="no-scrollbar -mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1">
        {suggestedBids.map((amount, index) => {
          const selected = bidAmount === amount.toFixed(2);
          return (
            <motion.button
              key={index}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => handleSuggestedBidClick(amount)}
              disabled={busy}
              className={`tabular shrink-0 rounded-full border px-3.5 py-2 font-mono text-[13px] font-medium transition-colors disabled:opacity-50 ${
                selected
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line-strong bg-card text-ink hover:border-ink'
              }`}
            >
              {index === 0 ? 'Min · ' : '+'}
              {index === 0 ? `$${amount.toFixed(2)}` : `$${(amount - minimumBid).toFixed(0)}`}
            </motion.button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="bidAmount" className="sr-only">
          Your bid in dollars
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg text-muted">
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              id="bidAmount"
              value={bidAmount}
              onChange={handleBidChange}
              disabled={busy}
              aria-invalid={!!error}
              aria-describedby={error ? 'bid-error' : undefined}
              className="field-input tabular h-13 pl-9 font-mono text-lg font-medium"
              placeholder={minimumBid.toFixed(2)}
            />
          </div>
          <Button
            type="submit"
            variant="flare"
            size="lg"
            loading={isSubmitting}
            disabled={busy || !bidAmount}
            className="group sm:min-w-40"
          >
            {isSubmitting ? (
              'Placing…'
            ) : (
              <>
                <Gavel className="size-4" />
                Place bid
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              id="bid-error"
              role="alert"
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: [0, -6, 6, -3, 3, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-2 text-[13px] text-danger"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </form>

      <p className="mt-3 flex items-center gap-1.5 text-[12px] text-muted">
        <ShieldCheck className="size-3.5" />
        By bidding you agree to buy this item if you win.
      </p>
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

export default BiddingSection;
