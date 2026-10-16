import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Gavel,
  Heart,
  MapPin,
  PackageX,
  Pencil,
  Sparkles,
  Star,
  Trash2,
  Trophy,
} from 'lucide-react';
import itemsService from '../services/itemsService';
import bidsService from '../services/bidsService';
import favoritesService from '../services/favoritesService';
import socketService, { realtimeEnabled } from '../services/socketService';
import useAuthStore from '../store/authStore';
import Countdown from '../components/common/Countdown';
import BiddingSection, { AnimatedPrice } from '../components/bidding/BiddingSection';
import BidHistory from '../components/bidding/BidHistory';
import { Avatar, Badge, Button, Card, EmptyState, LiveDot, Page, Skeleton } from '../components/ui';
import { EASE } from '../lib/motion';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450"><rect width="600" height="450" fill="#ece6da"/><path d="M255 195h90M300 195v75" stroke="#a89f92" stroke-width="14" stroke-linecap="round"/></svg>`
  );

const DetailSkeleton = () => (
  <Page>
    <Skeleton className="mb-6 h-9 w-24 rounded-full" />
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
      <div>
        <Skeleton className="aspect-[4/3] rounded-3xl" />
        <div className="mt-3 flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="size-20 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-12 w-4/5" />
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
      </div>
    </div>
  </Page>
);

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
  const [direction, setDirection] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  // Memoized fetch functions
  // `silent` refreshes in the background (polling) without the loading state
  // and without replacing a loaded item with an error screen.
  const fetchItem = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError('');
    }

    try {
      const response = await itemsService.getItemById(id);
      setItem(response.data.item);

      // Check if auction has already ended
      if (new Date(response.data.item.auction_end_time) <= new Date()) {
        setAuctionEnded(true);
      }
    } catch (err) {
      if (!silent) setError(err.message || 'Failed to load item');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  const fetchBids = useCallback(async (silent = false) => {
    if (!silent) setBidsLoading(true);

    try {
      const response = await bidsService.getItemBids(id, 50);
      setBids(response.data.bids || []);
    } catch (err) {
      console.error('Failed to fetch bids:', err);
    } finally {
      if (!silent) setBidsLoading(false);
    }
  }, [id]);

  const handleBidPlaced = (newBid) => {
    console.log('Bid placed successfully:', newBid);
    toast.success('Bid placed — you’re in the lead');
    fetchBids();
  };

  const handleAuctionExpire = () => {
    setAuctionEnded(true);
    fetchItem();
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
      toast.error(err.message || 'Failed to delete item');
      setIsDeleting(false);
    }
  };

  const checkIfFavorited = useCallback(async () => {
    try {
      const response = await favoritesService.checkFavorite(id);
      setIsFavorited(response.data.isFavorited);
    } catch (err) {
      console.error('Failed to check favorite status:', err);
    }
  }, [id]);

  // Fetch item details
  useEffect(() => {
    fetchItem();
    fetchBids();
    if (isAuthenticated) {
      checkIfFavorited();
    }
  }, [fetchItem, fetchBids, checkIfFavorited, isAuthenticated]);

  // Reset image index when item changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [item?.id]);

  // Without sockets (serverless backend), poll for new bids while the tab is visible
  useEffect(() => {
    if (realtimeEnabled) return;
    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      fetchItem(true);
      fetchBids(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchItem, fetchBids]);

  // Socket.IO real-time updates
  useEffect(() => {
    if (!realtimeEnabled) return;
    socketService.connect();
    socketService.joinItemRoom(id);

    socketService.onNewBid((data) => {
      if (data?.itemId === id && data?.bid) {
        console.log('New bid received via Socket.IO:', data.bid);

        setItem((prevItem) => {
          if (!prevItem) return prevItem;
          return {
            ...prevItem,
            current_highest_bid: data.bid.current_highest_bid || prevItem.current_highest_bid,
            bid_count: (data.bid.bid_count ?? prevItem.bid_count) || 0
          };
        });

        setBids((prevBids) => {
          const newBid = {
            id: data.bid.id,
            bid_amount: data.bid.bid_amount,
            bidder_username: data.bid.bidder_username,
            placed_at: data.bid.placed_at,
            is_current_highest: true
          };

          return [
            newBid,
            ...prevBids.map((b) => ({ ...b, is_current_highest: false }))
          ];
        });
      }
    });

    socketService.onAuctionEnded((data) => {
      if (data?.itemId === id && data?.result) {
        console.log('Auction ended via Socket.IO:', data.result);
        setAuctionEnded(true);
        setItem((prevItem) => {
          if (!prevItem) return prevItem;
          return {
            ...prevItem,
            status: data.result.status || prevItem.status
          };
        });
      }
    });

    return () => {
      socketService.leaveItemRoom(id);
      socketService.off('new-bid');
      socketService.off('auction-ended');
    };
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add favorites');
      navigate('/login');
      return;
    }

    setFavoritesLoading(true);

    try {
      if (isFavorited) {
        await favoritesService.removeFavorite(id);
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await favoritesService.addFavorite(id);
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update favorites');
    } finally {
      setFavoritesLoading(false);
    }
  };

  const isOwner = user && item && user.id === item.seller_id;

  // Check if item can be edited (within 30 minutes of creation and no bids)
  const canEdit = isOwner && !item?.current_highest_bid && (() => {
    if (!item?.created_at) return false;
    const createdAt = new Date(item.created_at);
    const now = new Date();
    const timeDifferenceInMinutes = (now - createdAt) / (1000 * 60);
    return timeDifferenceInMinutes <= 30;
  })();

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !item) {
    return (
      <Page width="max-w-3xl">
        <EmptyState
          icon={PackageX}
          title="Lot not found"
          description={error || 'This item does not exist or has been removed.'}
          action={
            <Button to="/browse" variant="primary">
              Back to browsing
            </Button>
          }
        />
      </Page>
    );
  }

  // Safe images array with fallback
  const images = item?.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0
    ? item.image_urls
    : [FALLBACK];

  const currentPrice = item?.current_highest_bid || item?.starting_price || 0;

  const goTo = (index) => {
    const next = (index + images.length) % images.length;
    setDirection(next > currentImageIndex ? 1 : -1);
    setCurrentImageIndex(next);
  };

  const isWinner =
    isAuthenticated && user && bids.length > 0 && bids[0].bidder_username === user.username;

  const meta = [
    { icon: Sparkles, label: 'Condition', value: item?.condition || 'Not specified' },
    item?.location && { icon: MapPin, label: 'Location', value: item.location },
    { icon: Eye, label: 'Views', value: (item?.view_count || 0).toLocaleString() },
    { icon: CalendarDays, label: 'Listed', value: format(new Date(item?.created_at), 'MMM dd, yyyy') },
  ].filter(Boolean);

  return (
    <Page>
      <button
        onClick={() => navigate(-1)}
        className="group mb-6 inline-flex items-center gap-2 rounded-full py-2 pr-3 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Back
      </button>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
        {/* ------------------------------ Gallery ------------------------------ */}
        <div className="min-w-0">
          <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-paper-2">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex] || images[0]}
                alt={item?.title || 'Item'}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40, scale: 1.02 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.5, ease: EASE }}
                drag={images.length > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) goTo(currentImageIndex + 1);
                  else if (info.offset.x > 60) goTo(currentImageIndex - 1);
                }}
                className="absolute inset-0 size-full cursor-grab object-cover active:cursor-grabbing"
                draggable={false}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK;
                }}
              />
            </AnimatePresence>

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
              {!auctionEnded ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-ink/85 px-3 py-1.5 text-[12px] font-medium text-paper backdrop-blur">
                  <LiveDot /> Live auction
                </span>
              ) : (
                <span className="rounded-full bg-card/90 px-3 py-1.5 text-[12px] font-medium text-ink-2 backdrop-blur">
                  Auction closed
                </span>
              )}
              {images.length > 1 && (
                <span className="tabular rounded-full bg-card/90 px-2.5 py-1 font-mono text-[11px] text-ink-2 backdrop-blur">
                  {currentImageIndex + 1}/{images.length}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={() => goTo(currentImageIndex - 1)}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-card/90 text-ink shadow-soft backdrop-blur transition hover:bg-card sm:grid sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  onClick={() => goTo(currentImageIndex + 1)}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-card/90 text-ink shadow-soft backdrop-blur transition hover:bg-card sm:grid sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <ChevronRight className="size-5" />
                </button>
                {/* Mobile dots */}
                <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 sm:hidden">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'w-5 bg-card' : 'w-1.5 bg-card/60'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (index < images.length) {
                      goTo(index);
                    }
                  }}
                  aria-label={`Show image ${index + 1}`}
                  aria-current={index === currentImageIndex}
                  className={`relative size-16 shrink-0 overflow-hidden rounded-xl transition-all sm:size-20 ${
                    index === currentImageIndex
                      ? 'ring-2 ring-ink ring-offset-2 ring-offset-paper'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${item?.title} ${index + 1}`}
                    className="size-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK;
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Description — desktop sits under gallery */}
          <section className="mt-10 hidden lg:block">
            <h2 className="mb-3 font-display text-3xl text-ink">About this piece</h2>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-2">
              {item?.description || 'No description provided'}
            </p>
          </section>
        </div>

        {/* ------------------------------ Buy box ------------------------------ */}
        <div className="min-w-0">
          <div className="space-y-5 lg:sticky lg:top-24">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Badge tone="outline">{item?.category || 'Uncategorized'}</Badge>
                {item?.condition && <Badge tone="neutral">{item.condition}</Badge>}
              </div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="font-display text-4xl leading-[1.02] text-ink sm:text-5xl">{item?.title}</h1>
                {!isOwner && (
                  <motion.button
                    onClick={handleToggleFavorite}
                    disabled={favoritesLoading}
                    whileTap={{ scale: 0.85 }}
                    aria-pressed={isFavorited}
                    aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                    className={`grid size-12 shrink-0 place-items-center rounded-full border transition-colors disabled:opacity-50 ${
                      isFavorited
                        ? 'border-flare/30 bg-flare-soft text-flare'
                        : 'border-line bg-card text-ink-2 hover:border-ink hover:text-ink'
                    }`}
                  >
                    <motion.span
                      key={String(isFavorited)}
                      initial={{ scale: isFavorited ? 0.4 : 1 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 12 }}
                    >
                      <Heart className="size-5" fill={isFavorited ? 'currentColor' : 'none'} />
                    </motion.span>
                  </motion.button>
                )}
              </div>
            </div>

            <Card className="overflow-hidden p-0">
              <div className="grid grid-cols-2 divide-x divide-line border-b border-line">
                <div className="p-5">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    {item?.current_highest_bid ? 'Current bid' : 'Starting price'}
                  </p>
                  <AnimatedPrice
                    value={parseFloat(currentPrice)}
                    className="mt-1.5 font-mono text-[28px] font-semibold leading-none text-ink sm:text-[32px]"
                  />
                  <p className="mt-2 inline-flex items-center gap-1 text-[12px] text-muted">
                    <Gavel className="size-3.5" />
                    {item?.bid_count > 0
                      ? `${item.bid_count} bid${item.bid_count !== 1 ? 's' : ''} placed`
                      : 'No bids yet'}
                  </p>
                </div>
                <div className="p-5">
                  <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted">
                    <Clock className="size-3" /> {auctionEnded ? 'Status' : 'Ends in'}
                  </p>
                  <div className="mt-1.5 text-xl leading-none sm:text-2xl">
                    <Countdown endTime={item?.auction_end_time} showFull onExpire={handleAuctionExpire} />
                  </div>
                  <p className="mt-2 text-[12px] text-muted">
                    {format(new Date(item.auction_end_time), 'EEE, MMM d · h:mm a')}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {!isOwner && (
                  <BiddingSection item={item} onBidPlaced={handleBidPlaced} disabled={auctionEnded} />
                )}

                {/* Owner Actions */}
                {isOwner && (
                  <div className="space-y-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {canEdit && (
                        <Button variant="primary" onClick={() => navigate(`/items/${id}/edit`)}>
                          <Pencil className="size-4" />
                          Edit listing
                        </Button>
                      )}
                      <Button
                        variant="danger-ghost"
                        onClick={handleDelete}
                        loading={isDeleting}
                        disabled={isDeleting || !canEdit}
                        className={`border border-danger/20 ${canEdit ? '' : 'sm:col-span-2'}`}
                      >
                        {!isDeleting && <Trash2 className="size-4" />}
                        {isDeleting ? 'Deleting…' : 'Delete listing'}
                      </Button>
                    </div>
                    {!canEdit && (
                      <p className="text-center text-[13px] text-muted">
                        {item?.current_highest_bid
                          ? 'Editing is locked — this item has received bids.'
                          : 'Editing is locked — the 30-minute window has passed.'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Auction Result (if ended) */}
            {auctionEnded && item?.status === 'sold' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-moss/15 bg-moss-soft p-5 text-moss"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-moss text-white">
                    <Trophy className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{isWinner ? 'You won this auction!' : 'Sold'}</p>
                    <p className="text-[13px] opacity-80">
                      Final price ${parseFloat(item?.current_highest_bid || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                {isWinner && (
                  <p className="mt-3 text-[13px] opacity-90">
                    The seller will contact you soon with payment and pickup details.
                  </p>
                )}
              </motion.div>
            )}

            {auctionEnded && item?.status === 'expired' && (
              <div className="rounded-3xl border border-line bg-paper-2 p-5">
                <p className="font-semibold text-ink">Auction ended</p>
                <p className="mt-0.5 text-[13px] text-muted">This auction closed with no bids.</p>
              </div>
            )}

            {/* Seller */}
            <Card className="p-4">
              <Link
                to={`/items/user/${item?.seller_id}`}
                className="group flex items-center gap-3"
              >
                <Avatar name={item?.users?.username || 'Unknown'} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Sold by</p>
                  <p className="truncate font-medium text-ink group-hover:underline">
                    @{item?.users?.username || 'Unknown'}
                  </p>
                </div>
                {item?.users?.seller_rating > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 text-[12px] font-semibold text-[#8a6410]">
                    <Star className="size-3.5 fill-gold text-gold" />
                    {item.users.seller_rating.toFixed(1)}
                  </span>
                )}
              </Link>
            </Card>

            {/* Meta grid */}
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
              {meta.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-card p-4">
                  <dt className="flex items-center gap-1.5 text-[12px] text-muted">
                    <Icon className="size-3.5" />
                    {label}
                  </dt>
                  <dd className="mt-1 truncate text-sm font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Description — mobile / tablet */}
      <section className="mt-10 lg:hidden">
        <h2 className="mb-3 font-display text-3xl text-ink">About this piece</h2>
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-2">
          {item?.description || 'No description provided'}
        </p>
      </section>

      {/* Bid History */}
      {!isOwner && (
        <div className="mt-10 lg:max-w-[calc((100%-3rem)*0.535)]">
          <BidHistory bids={bids} loading={bidsLoading} />
        </div>
      )}
    </Page>
  );
};

export default ItemDetail;
