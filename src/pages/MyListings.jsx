import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Eye, Gavel, PackageOpen, Pencil, Plus, RotateCw, Store, Tag, Trash2 } from 'lucide-react';
import itemsService from '../services/itemsService';
import Countdown from '../components/common/Countdown';
import { format } from 'date-fns';
import { Alert, Badge, Button, Card, EmptyState, Page, PageHeader, Skeleton, Stat, Tabs } from '../components/ui';
import { EASE, formatMoney } from '../lib/motion';

const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#ece6da"/><path d="M38 44h24M50 44v20" stroke="#a89f92" stroke-width="5" stroke-linecap="round"/></svg>`
  );

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
];

const StatusBadge = ({ status }) => {
  if (status === 'active')
    return (
      <Badge tone="flare">
        <span className="size-1.5 rounded-full bg-flare animate-pulse-dot" />
        Live
      </Badge>
    );
  if (status === 'sold') return <Badge tone="moss" dot>Sold</Badge>;
  if (status === 'cancelled') return <Badge tone="danger" dot>Cancelled</Badge>;
  return <Badge tone="neutral" dot>{status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Expired'}</Badge>;
};

const canEditItem = (item) => {
  const createdAt = new Date(item.created_at);
  const now = new Date();
  const timeDifferenceInMinutes = (now - createdAt) / (1000 * 60);
  return !item.current_highest_bid && item.status === 'active' && timeDifferenceInMinutes <= 30;
};

const ListingSkeleton = () => (
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

  // Summary figures derived from the loaded listings
  const activeCount = items.filter((i) => i.status === 'active').length;
  const totalBids = items.reduce((sum, i) => sum + (Number(i.bid_count) || 0), 0);
  const totalViews = items.reduce((sum, i) => sum + (Number(i.view_count) || 0), 0);
  const bidValue = items.reduce((sum, i) => sum + (Number(i.current_highest_bid) || 0), 0);

  return (
    <Page>
      <PageHeader
        eyebrow={
          <>
            <Store className="size-3.5" /> Seller studio
          </>
        }
        title="Selling"
        description="Track every lot you've listed — live bids, views and time left, all in one place."
        actions={
          <Button to="/create-listing" variant="flare">
            <Plus className="size-4" strokeWidth={2.4} />
            List an item
          </Button>
        }
      />

      {!error && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Stat label="Listings" value={loading ? '—' : items.length} icon={Tag} />
          <Stat label="Live now" value={loading ? '—' : activeCount} icon={Store} />
          <Stat label="Bids received" value={loading ? '—' : totalBids} icon={Gavel} />
          <Stat
            label="Bid value"
            value={loading ? '—' : formatMoney(bidValue).replace(/\.00$/, '')}
            hint={loading ? undefined : `${totalViews} total views`}
            icon={Eye}
          />
        </div>
      )}

      <Tabs tabs={STATUS_TABS} value={statusFilter} onChange={setStatusFilter} layoutId="listings-tabs" className="mb-6" />

      {loading && <ListingSkeleton />}

      {!loading && error && (
        <Alert tone="danger" title="We couldn't load your listings">
          <p>{error}</p>
          <button
            onClick={fetchMyListings}
            className="mt-2 inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline"
          >
            <RotateCw className="size-3.5" /> Try again
          </button>
        </Alert>
      )}

      {!loading && !error && items.length > 0 && (
        <Card className="overflow-hidden">
          {/* Desktop column headings */}
          <div className="hidden grid-cols-[minmax(0,1fr)_110px_130px_130px_70px_150px] gap-4 border-b border-line bg-paper/60 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-faint lg:grid">
            <span>Item</span>
            <span>Status</span>
            <span>Price</span>
            <span>Time left</span>
            <span>Views</span>
            <span className="text-right">Actions</span>
          </div>
          <ul className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {items.map((item, index) => {
                const canEdit = canEditItem(item);
                return (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE, delay: Math.min(index, 8) * 0.03 } }}
                    exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
                    className="group grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 p-4 transition-colors hover:bg-paper/50 lg:grid-cols-[minmax(0,1fr)_110px_130px_130px_70px_150px] lg:items-center lg:px-5"
                  >
                    {/* Item */}
                    <div className="contents lg:flex lg:min-w-0 lg:items-center lg:gap-4">
                      <Link
                        to={`/items/${item.id}`}
                        className="row-span-2 block size-20 shrink-0 overflow-hidden rounded-xl bg-paper-2 lg:row-span-1 lg:size-16"
                      >
                        <img
                          src={item.image_urls?.[0] || FALLBACK_IMG}
                          alt={item.title}
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
                            to={`/items/${item.id}`}
                            className="line-clamp-1 text-[15px] font-semibold text-ink hover:text-flare-deep"
                          >
                            {item.title}
                          </Link>
                          <span className="shrink-0 lg:hidden">
                            <StatusBadge status={item.status} />
                          </span>
                        </div>
                        <p className="mt-0.5 text-[13px] text-muted">{item.category}</p>
                      </div>
                    </div>

                    {/* Mobile meta row */}
                    <div className="col-start-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] lg:hidden">
                      <span className="tabular font-mono font-semibold text-ink">
                        {formatMoney(item.current_highest_bid || item.starting_price)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-muted">
                        <Gavel className="size-3.5" /> {item.bid_count || 0}
                      </span>
                      <span className="inline-flex items-center gap-1 text-muted">
                        <Eye className="size-3.5" /> {item.view_count || 0}
                      </span>
                      {item.status === 'active' ? (
                        <Countdown endTime={item.auction_end_time} className="text-[13px]" />
                      ) : (
                        <span className="text-muted">{format(new Date(item.auction_end_time), 'MMM dd, yyyy')}</span>
                      )}
                    </div>

                    {/* Desktop cells */}
                    <div className="hidden lg:block">
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="hidden lg:block">
                      <p className="tabular font-mono text-[15px] font-semibold text-ink">
                        {formatMoney(item.current_highest_bid || item.starting_price)}
                      </p>
                      <p className="text-[12px] text-muted">
                        {item.current_highest_bid ? `${item.bid_count || 0} bids` : 'Starting price'}
                      </p>
                    </div>
                    <div className="hidden text-sm lg:block">
                      {item.status === 'active' ? (
                        <Countdown endTime={item.auction_end_time} />
                      ) : (
                        <span className="text-muted">{format(new Date(item.auction_end_time), 'MMM dd, yyyy')}</span>
                      )}
                    </div>
                    <div className="tabular hidden text-sm text-muted lg:block">{item.view_count || 0}</div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end gap-1 border-t border-dashed border-line pt-3 lg:col-span-1 lg:border-0 lg:pt-0">
                      {canEdit && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit ${item.title}`}
                            title="Edit"
                            onClick={() => navigate(`/items/${item.id}/edit`)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="danger-ghost"
                            size="icon-sm"
                            aria-label={`Delete ${item.title}`}
                            title="Delete"
                            onClick={() => handleDelete(item.id, item.title)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </>
                      )}
                      <Button to={`/items/${item.id}`} variant="outline" size="sm" className="ml-1">
                        View
                        <ArrowUpRight className="size-3.5" />
                      </Button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </Card>
      )}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={PackageOpen}
          title="No listings yet"
          description={
            statusFilter
              ? `You don't have any ${statusFilter} listings right now.`
              : 'Turn that closet clear-out into a live auction. Listing takes about a minute.'
          }
          action={
            <Button to="/create-listing" variant="flare">
              <Plus className="size-4" strokeWidth={2.4} />
              List your first item
            </Button>
          }
        />
      )}
    </Page>
  );
};

export default MyListings;
