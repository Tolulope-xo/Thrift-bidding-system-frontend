import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Compass, Heart, RotateCw } from 'lucide-react';
import favoritesService from '../services/favoritesService';
import ItemCard from '../components/common/ItemCard';
import toast from 'react-hot-toast';
import { Alert, Button, Card, EmptyState, Page, PageHeader, Skeleton, Tabs } from '../components/ui';
import { EASE } from '../lib/motion';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'sold', label: 'Ended' },
  { value: 'expired', label: 'Expired' },
];

const GridSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="aspect-[4/3] rounded-none" />
        <div className="space-y-2 p-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="mt-4 h-6 w-1/3" />
        </div>
      </Card>
    ))}
  </div>
);

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, [statusFilter]);

  const fetchFavorites = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await favoritesService.getFavorites(statusFilter || null);
      setFavorites(response.data.favorites || []);
    } catch (err) {
      setError(err.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (itemId) => {
    try {
      await favoritesService.removeFavorite(itemId);
      setFavorites(favorites.filter(fav => fav.items?.id !== itemId));
      toast.success('Removed from favorites');
    } catch (err) {
      toast.error(err.message || 'Failed to remove from favorites');
    }
  };

  const visible = favorites.filter((f) => f.items);

  return (
    <Page>
      <PageHeader
        eyebrow={
          <>
            <Heart className="size-3.5" /> Watchlist
          </>
        }
        title="Saved"
        description="The lots you're keeping an eye on. We'll nudge you before they close."
        actions={
          <Button to="/browse" variant="outline">
            <Compass className="size-4" />
            Browse lots
          </Button>
        }
      />

      <Tabs tabs={STATUS_TABS} value={statusFilter} onChange={setStatusFilter} layoutId="saved-tabs" className="mb-6" />

      {loading && <GridSkeleton />}

      {!loading && error && (
        <Alert tone="danger" title="We couldn't load your saved lots">
          <p>{error}</p>
          <button
            onClick={fetchFavorites}
            className="mt-2 inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline"
          >
            <RotateCw className="size-3.5" /> Try again
          </button>
        </Alert>
      )}

      {!loading && !error && visible.length > 0 && (
        <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {visible.map((favorite, index) => {
              const item = favorite.items;
              return (
                <motion.div
                  key={favorite.id}
                  layout
                  exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.25, ease: EASE } }}
                  className="relative"
                >
                  <ItemCard item={item} index={index} />
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleRemoveFavorite(item.id)}
                    className="absolute right-3 top-12 z-10 grid size-9 place-items-center rounded-full bg-card/95 text-flare shadow-soft backdrop-blur transition-colors hover:bg-flare hover:text-white"
                    title="Remove from saved"
                    aria-label={`Remove ${item.title} from saved`}
                  >
                    <Heart className="size-4 fill-current" />
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {!loading && !error && visible.length === 0 && (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          description={
            statusFilter
              ? `No ${STATUS_TABS.find((t) => t.value === statusFilter)?.label.toLowerCase()} lots in your watchlist.`
              : 'Tap the heart on any lot to keep it here and get reminded before it ends.'
          }
          action={
            <Button to="/browse" variant="primary">
              <Compass className="size-4" />
              Find something
            </Button>
          }
        />
      )}
    </Page>
  );
};

export default Favorites;
