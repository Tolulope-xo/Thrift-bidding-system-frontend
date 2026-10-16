import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowUpRight, Compass, Gavel, RotateCw, Trophy } from 'lucide-react';
import bidsService from '../services/bidsService';
import Countdown from '../components/common/Countdown';
import { format } from 'date-fns';
import { Alert, Badge, Button, Card, EmptyState, Page, PageHeader, Skeleton, Tabs } from '../components/ui';
import { EASE, formatMoney } from '../lib/motion';

const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#ece6da"/><path d="M38 44h24M50 44v20" stroke="#a89f92" stroke-width="5" stroke-linecap="round"/></svg>`
  );

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'sold', label: 'Ended' },
  { value: 'expired', label: 'Expired' },
];

// Winning / Outbid while live; Won / Lost once the auction is over
const getBidState = (status, isWinning) => {
  if (status === 'active') return isWinning ? 'winning' : 'outbid';
  if (status === 'sold') return isWinning ? 'won' : 'lost';
  if (status === 'cancelled') return 'cancelled';
  return 'expired';
};

const StateBadge = ({ state }) => {
  switch (state) {
    case 'winning':
      return <Badge tone="moss" dot>Winning</Badge>;
    case 'outbid':
      return (
        <Badge tone="flare">
          <span className="size-1.5 rounded-full bg-flare animate-pulse-dot" />
          Outbid
        </Badge>
      );
    case 'won':
      return (
        <Badge tone="gold">
          <Trophy className="size-3" /> Won
        </Badge>
      );
    case 'lost':
      return <Badge tone="neutral" dot>Lost</Badge>;
    case 'cancelled':
      return <Badge tone="danger" dot>Cancelled</Badge>;
    default:
      return <Badge tone="neutral" dot>Expired</Badge>;
  }
};

const BidsSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i} className="flex items-center gap-4 p-3 sm:p-4">
        <Skeleton className="size-16 shrink-0 sm:size-20" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3 max-w-xs" />
          <Skeleton className="h-3 w-1/3 max-w-[140px]" />
        </div>
        <Skeleton className="hidden h-8 w-24 sm:block" />
      </Card>
    ))}
  </div>
);

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchMyBids();
  }, [statusFilter]);

  const fetchMyBids = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await bidsService.getAllMyBids(statusFilter || null);
      setBids(response.data.bids || []);
    } catch (err) {
      setError(err.message || 'Failed to load your bids');
    } finally {
      setLoading(false);
    }
  };

  const winningCount = bids.filter((b) => b.items?.status === 'active' && b.is_highest_bid).length;
  const outbidCount = bids.filter((b) => b.items?.status === 'active' && !b.is_highest_bid).length;

  return (
    <Page>
      <PageHeader
        eyebrow={
          <>
            <Gavel className="size-3.5" /> Bidding activity
          </>
        }
        title="My bids"
        description={
          !loading && !error && bids.length > 0
            ? `You're winning ${winningCount} and outbid on ${outbidCount} live ${outbidCount === 1 ? 'lot' : 'lots'}.`
            : 'Every lot you have a stake in — who is ahead, and how long is left.'
        }
        actions={
          <Button to="/browse" variant="outline">
            <Compass className="size-4" />
            Browse lots
          </Button>
        }
      />

      <Tabs tabs={STATUS_TABS} value={statusFilter} onChange={setStatusFilter} layoutId="bids-tabs" className="mb-6" />

      {loading && <BidsSkeleton />}

      {!loading && error && (
        <Alert tone="danger" title="We couldn't load your bids">
          <p>{error}</p>
          <button
            onClick={fetchMyBids}
            className="mt-2 inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline"
          >
            <RotateCw className="size-3.5" /> Try again
          </button>
        </Alert>
      )}

      {!loading && !error && bids.length > 0 && (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[minmax(0,1fr)_130px_130px_110px_130px_130px] gap-4 border-b border-line bg-paper/60 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-faint lg:grid">
            <span>Item</span>
            <span>Your bid</span>
            <span>Current</span>
            <span>Status</span>
            <span>Time left</span>
            <span className="text-right">Action</span>
          </div>
          <ul className="divide-y divide-line">
            {bids.map((bid, index) => {
              const item = bid.items;
              const isWinning = bid.is_highest_bid;
              const state = getBidState(item?.status, isWinning);
              const isWon = state === 'won';
              const current = item?.current_highest_bid || item?.starting_price;

              return (
                <motion.li
                  key={bid.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE, delay: Math.min(index, 8) * 0.03 }}
                  className={`group grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 p-4 transition-colors hover:bg-paper/50 lg:grid-cols-[minmax(0,1fr)_130px_130px_110px_130px_130px] lg:items-center lg:px-5 ${
                    isWon ? 'bg-gold-soft/40' : ''
                  }`}
                >
                  <div className="contents lg:flex lg:min-w-0 lg:items-center lg:gap-4">
                    <Link
                      to={`/items/${item?.id}`}
                      className="row-span-2 block size-20 shrink-0 overflow-hidden rounded-xl bg-paper-2 lg:row-span-1 lg:size-16"
                    >
                      <img
                        src={item?.image_urls?.[0] || FALLBACK_IMG}
                        alt={item?.title}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMG;
                        }}
                      />
                    </Link>
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/items/${item?.id}`}
                          className="line-clamp-1 text-[15px] font-semibold text-ink hover:text-flare-deep"
                        >
                          {item?.title}
                        </Link>
                        <span className="shrink-0 lg:hidden">
                          <StateBadge state={state} />
                        </span>
                      </div>
                      <p className="mt-0.5 text-[13px] text-muted">
                        {item?.category}
                        {isWon && <span className="ml-2 font-medium text-[#8a6410]">You won this lot</span>}
                      </p>
                    </div>
                  </div>

                  {/* Mobile: your bid vs current */}
                  <div className="col-start-2 grid grid-cols-2 gap-3 text-[13px] lg:hidden">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-faint">Your bid</p>
                      <p className="tabular font-mono font-semibold text-ink">{formatMoney(bid.bid_amount)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-faint">Current</p>
                      <p className={`tabular font-mono font-semibold ${state === 'outbid' ? 'text-flare-deep' : 'text-ink'}`}>
                        {formatMoney(current)}
                      </p>
                    </div>
                  </div>

                  {/* Desktop cells */}
                  <div className="hidden lg:block">
                    <p className="tabular font-mono text-[15px] font-semibold text-ink">{formatMoney(bid.bid_amount)}</p>
                    <p className="text-[12px] text-muted">{format(new Date(bid.placed_at), 'MMM dd, HH:mm')}</p>
                  </div>
                  <div className="hidden lg:block">
                    <p
                      className={`tabular font-mono text-[15px] font-semibold ${
                        state === 'outbid' ? 'text-flare-deep' : 'text-ink'
                      }`}
                    >
                      {formatMoney(current)}
                    </p>
                  </div>
                  <div className="hidden lg:block">
                    <StateBadge state={state} />
                  </div>
                  <div className="hidden text-sm lg:block">
                    {item?.status === 'active' ? (
                      <Countdown endTime={item.auction_end_time} />
                    ) : (
                      <span className="text-muted">
                        {item?.auction_end_time ? format(new Date(item.auction_end_time), 'MMM dd, yyyy') : '—'}
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 flex items-center justify-between gap-3 border-t border-dashed border-line pt-3 lg:col-span-1 lg:justify-end lg:border-0 lg:pt-0">
                    <span className="text-[13px] lg:hidden">
                      {item?.status === 'active' ? (
                        <>
                          <Countdown endTime={item.auction_end_time} /> <span className="text-muted">left</span>
                        </>
                      ) : (
                        <span className="text-muted">
                          {item?.auction_end_time ? `Ended ${format(new Date(item.auction_end_time), 'MMM dd')}` : ''}
                        </span>
                      )}
                    </span>
                    {state === 'outbid' ? (
                      <Button to={`/items/${item?.id}`} variant="flare" size="sm">
                        <Gavel className="size-3.5" />
                        Bid again
                      </Button>
                    ) : (
                      <Button to={`/items/${item?.id}`} variant="outline" size="sm">
                        View
                        <ArrowUpRight className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </Card>
      )}

      {!loading && !error && bids.length === 0 && (
        <EmptyState
          icon={Gavel}
          title="No bids yet"
          description={
            statusFilter
              ? `Nothing in ${STATUS_TABS.find((t) => t.value === statusFilter)?.label.toLowerCase()} right now.`
              : 'Find something you love and make your first offer — the room is waiting.'
          }
          action={
            <Button to="/browse" variant="primary">
              <Compass className="size-4" />
              Browse live lots
            </Button>
          }
        />
      )}
    </Page>
  );
};

export default MyBids;
