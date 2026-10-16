import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, PackageOpen, RotateCw, Search, SlidersHorizontal, WifiOff, X } from 'lucide-react';
import itemsService from '../services/itemsService';
import ItemCard from '../components/common/ItemCard';
import { Button, Input, LiveDot, Page, PageHeader, Select, Skeleton, EmptyState } from '../components/ui';
import { EASE } from '../lib/motion';

const categories = ['Clothing', 'Electronics', 'Furniture', 'Books', 'Other'];
const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'ending_soon', label: 'Ending Soon' },
];

const Chip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`relative shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
      active ? 'text-paper' : 'border border-line bg-card text-ink-2 hover:border-ink hover:text-ink'
    }`}
  >
    {active && (
      <motion.span
        layoutId="category-chip"
        className="absolute inset-0 rounded-full bg-ink"
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      />
    )}
    <span className="relative">{children}</span>
  </button>
);

const CardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-line bg-card">
    <Skeleton className="aspect-[4/3] rounded-none" />
    <div className="space-y-2.5 p-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex items-end justify-between border-t border-dashed border-line pt-3">
        <div className="space-y-1.5">
          <Skeleton className="h-2.5 w-14" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-3 w-8" />
      </div>
    </div>
  </div>
);

/** Condition + price controls, shared by the desktop sidebar and the mobile sheet */
const FilterControls = ({ filters, updateFilters }) => (
  <div className="space-y-7">
    <div>
      <p className="field-label">Condition</p>
      <div className="flex flex-wrap gap-2">
        {['', ...conditions].map((cond) => {
          const active = filters.condition === cond;
          return (
            <button
              key={cond || 'any'}
              type="button"
              onClick={() => updateFilters({ condition: cond })}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
                active ? 'border-ink bg-ink text-paper' : 'border-line bg-card text-ink-2 hover:border-ink'
              }`}
            >
              {cond || 'Any'}
            </button>
          );
        })}
      </div>
    </div>
    <div>
      <p className="field-label">Price range</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-faint">$</span>
          <input
            type="number"
            inputMode="decimal"
            aria-label="Minimum price"
            value={filters.minPrice}
            onChange={(e) => updateFilters({ minPrice: e.target.value })}
            placeholder="Min"
            className="field-input tabular pl-7 font-mono text-sm"
          />
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-faint">$</span>
          <input
            type="number"
            inputMode="decimal"
            aria-label="Maximum price"
            value={filters.maxPrice}
            onChange={(e) => updateFilters({ maxPrice: e.target.value })}
            placeholder="Max"
            className="field-input tabular pl-7 font-mono text-sm"
          />
        </div>
      </div>
    </div>
  </div>
);

const FilterSheet = ({ open, onClose, children, onClear }) => {
  const sheetRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    sheetRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            tabIndex={-1}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => (info.offset.y > 120 || info.velocity.y > 600) && onClose()}
            className="absolute inset-x-0 bottom-0 max-h-[85svh] overflow-y-auto rounded-t-3xl bg-card px-5 pt-3 shadow-lift outline-none"
            style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line-strong" />
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-3xl text-ink">Filters</h2>
              <button
                onClick={onClose}
                aria-label="Close filters"
                className="grid size-9 place-items-center rounded-full bg-paper-2 text-ink-2"
              >
                <X className="size-4" />
              </button>
            </div>
            {children}
            <div className="mt-8 grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={onClear}>Clear all</Button>
              <Button variant="primary" onClick={onClose}>Show results</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const pageNumbers = (current, total) => {
  const set = new Set([1, total, current, current - 1, current + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push('…' + n);
    out.push(n);
  });
  return out;
};

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  // Filters state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    page: parseInt(searchParams.get('page')) || 1,
  });

  // Fetch items
  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchItems = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.condition) params.condition = filters.condition;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      params.page = filters.page;
      params.limit = 12;

      const response = await itemsService.getItems(params);
      setItems(response.data.items);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);

    // Update URL params
    const params = {};
    Object.keys(updated).forEach((key) => {
      if (updated[key]) params[key] = updated[key];
    });
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
      page: 1,
    });
    setSearchParams({});
  };

  const activePills = [
    filters.search && { key: 'search', label: `“${filters.search}”` },
    filters.category && { key: 'category', label: filters.category },
    filters.condition && { key: 'condition', label: filters.condition },
    filters.minPrice && { key: 'minPrice', label: `From $${filters.minPrice}` },
    filters.maxPrice && { key: 'maxPrice', label: `Up to $${filters.maxPrice}` },
  ].filter(Boolean);
  const sheetCount = [filters.condition, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  return (
    <Page>
      <PageHeader
        eyebrow={
          <>
            <LiveDot /> Live auctions
          </>
        }
        title="Browse the floor"
        description="Pre-loved pieces, priced by the room. Find something with a story and make your bid."
      />

      {/* Search + sort row */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            icon={Search}
            type="search"
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            placeholder="Search jackets, cameras, armchairs…"
            aria-label="Search items"
            className="h-12 rounded-full"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.sortBy}
            onChange={(e) => updateFilters({ sortBy: e.target.value })}
            aria-label="Sort by"
            className="h-12 flex-1 rounded-full sm:w-52"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Button
            variant="outline"
            className="h-12 shrink-0 lg:hidden"
            onClick={() => setSheetOpen(true)}
            aria-label="Open filters"
          >
            <SlidersHorizontal className="size-4" />
            <span className="hidden sm:inline">Filters</span>
            {sheetCount > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-flare text-[11px] font-semibold text-white">
                {sheetCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Category chips */}
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <Chip active={!filters.category} onClick={() => updateFilters({ category: '' })}>
          All
        </Chip>
        {categories.map((cat) => (
          <Chip key={cat} active={filters.category === cat} onClick={() => updateFilters({ category: cat })}>
            {cat}
          </Chip>
        ))}
      </div>

      {/* Active filter pills */}
      <AnimatePresence initial={false}>
        {activePills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-2 pt-4">
              <AnimatePresence initial={false}>
                {activePills.map((pill) => (
                  <motion.button
                    key={pill.key}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => updateFilters({ [pill.key]: '' })}
                    className="inline-flex items-center gap-1.5 rounded-full bg-flare-soft py-1.5 pl-3 pr-2 text-[12px] font-medium text-flare-deep transition-colors hover:bg-[#ffd6c6]"
                  >
                    {pill.label}
                    <X className="size-3.5" />
                  </motion.button>
                ))}
              </AnimatePresence>
              <button onClick={clearFilters} className="px-2 text-[12px] font-medium text-muted underline-offset-4 hover:text-ink hover:underline">
                Clear all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Refine</h2>
              <button onClick={clearFilters} className="text-[13px] text-muted hover:text-ink">
                Reset
              </button>
            </div>
            <FilterControls filters={filters} updateFilters={updateFilters} />
          </div>
        </aside>

        {/* Results */}
        <section aria-live="polite" aria-busy={loading}>
          {!loading && !error && pagination?.total != null && (
            <p className="mb-4 text-[13px] text-muted">
              <span className="tabular font-medium text-ink">{pagination.total}</span> lot{pagination.total === 1 ? '' : 's'}
            </p>
          )}

          {loading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && error && (
            <EmptyState
              icon={WifiOff}
              title="We couldn't reach the floor"
              description={`${error}. Check your connection or try again in a moment.`}
              action={
                <Button variant="primary" onClick={fetchItems}>
                  <RotateCw className="size-4" />
                  Try again
                </Button>
              }
            />
          )}

          {!loading && !error && items.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item, i) => (
                  <ItemCard key={item.id} item={item} index={i} />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <motion.nav
                  aria-label="Pagination"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, ease: EASE }}
                  className="mt-12 flex items-center justify-center gap-1.5"
                >
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  {pageNumbers(pagination.page, pagination.totalPages).map((n) =>
                    typeof n === 'string' ? (
                      <span key={n} className="px-1 text-muted">…</span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => handlePageChange(n)}
                        aria-current={n === pagination.page ? 'page' : undefined}
                        className={`tabular size-10 rounded-full text-sm font-medium transition-colors ${
                          n === pagination.page ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-paper-2'
                        } ${Math.abs(n - pagination.page) > 1 && n !== 1 && n !== pagination.totalPages ? 'hidden sm:block' : ''}`}
                      >
                        {n}
                      </button>
                    )
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </motion.nav>
              )}
            </>
          )}

          {!loading && !error && items.length === 0 && (
            <EmptyState
              icon={PackageOpen}
              title="Nothing on the floor"
              description="No lots match those filters yet. Try widening your search — new finds land every hour."
              action={
                activePills.length > 0 && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )
              }
            />
          )}
        </section>
      </div>

      <FilterSheet open={sheetOpen} onClose={closeSheet} onClear={clearFilters}>
        <FilterControls filters={filters} updateFilters={updateFilters} />
      </FilterSheet>
    </Page>
  );
};

export default Browse;
