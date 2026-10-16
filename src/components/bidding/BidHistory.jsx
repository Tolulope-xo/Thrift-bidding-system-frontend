import { formatDistanceToNow } from 'date-fns';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'motion/react';
import { Crown, Gavel } from 'lucide-react';
import { Avatar, Card, Skeleton } from '../ui';
import { EASE, formatMoney } from '../../lib/motion';

const BidHistory = ({ bids = [], loading = false }) => {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-2xl text-ink">Bid history</h3>
        {!loading && bids?.length > 0 && (
          <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[12px] font-medium text-ink-2">
            {bids.length} bid{bids.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-2.5 w-16" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : !bids || bids.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <span className="mb-3 grid size-12 place-items-center rounded-2xl bg-paper-2 text-ink-2">
            <Gavel className="size-5" strokeWidth={1.6} />
          </span>
          <p className="text-sm font-medium text-ink">No bids yet</p>
          <p className="mt-0.5 text-[13px] text-muted">Be the first to raise a paddle.</p>
        </div>
      ) : (
        <ol className="relative max-h-[28rem] space-y-1 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {bids.map((bid, index) => {
              const top = bid.is_current_highest;
              return (
                <motion.li
                  key={bid.id}
                  layout
                  initial={{ opacity: 0, y: -14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                    top ? 'bg-moss-soft' : 'hover:bg-paper'
                  }`}
                >
                  {index < bids.length - 1 && (
                    <span className="absolute left-[27px] top-11 h-[calc(100%-1.75rem)] w-px bg-line" aria-hidden />
                  )}
                  <Avatar name={bid.bidder_username} size="sm" className={top ? '' : 'opacity-80 grayscale-[40%]'} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-ink">@{bid.bidder_username}</span>
                      {top && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-moss px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                          <Crown className="size-3" />
                          Leading
                        </span>
                      )}
                      {index === 0 && !top && (
                        <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-2">
                          Latest
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-muted">
                      {formatDistanceToNow(new Date(bid.placed_at), { addSuffix: true })}
                    </p>
                  </div>
                  <p className={`tabular font-mono text-[15px] font-semibold ${top ? 'text-moss' : 'text-ink-2'}`}>
                    {formatMoney(bid.bid_amount)}
                  </p>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      )}

      {bids?.length >= 50 && (
        <p className="mt-4 text-center text-[12px] text-muted">Showing latest 50 bids</p>
      )}
    </Card>
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

export default BidHistory;
