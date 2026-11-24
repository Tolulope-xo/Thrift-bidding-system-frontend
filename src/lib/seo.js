import { CATEGORIES, PRIVATE_ROUTES, SITE, resolveSiteUrl } from '../../site.config.js';

export { SITE };

/** Canonical origin, e.g. https://thrift-bidding-system-frontend.vercel.app */
export const SITE_URL = resolveSiteUrl(import.meta.env.VITE_SITE_URL);

export const absoluteUrl = (path = '/') => {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

const DEFAULT_TITLE = `${SITE.name} — ${SITE.tagline}`;
const PRODUCT_LD_ID = 'ld-product';

const truncate = (text, max = 160) => {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
};

const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const setCanonical = (href) => {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

/**
 * Imperatively applies head tags. Every managed tag is set on each call so a
 * route change never leaves stale values from the previous page behind.
 */
export const applySeo = ({ title, description, path = '/', image, imageAlt, type = 'website', noindex = false }) => {
  const fullTitle = title ? `${title} · ${SITE.name}` : DEFAULT_TITLE;
  const desc = truncate(description || SITE.description);
  const url = absoluteUrl(path);
  const img = absoluteUrl(image || SITE.ogImage);
  const alt = imageAlt || (image ? title : SITE.ogImageAlt) || SITE.ogImageAlt;

  document.title = fullTitle;
  setMeta('name', 'description', desc);
  setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
  setCanonical(url);

  setMeta('property', 'og:type', type);
  setMeta('property', 'og:title', fullTitle);
  setMeta('property', 'og:description', desc);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:image', img);
  setMeta('property', 'og:image:alt', alt);

  setMeta('name', 'twitter:title', fullTitle);
  setMeta('name', 'twitter:description', desc);
  setMeta('name', 'twitter:image', img);
  setMeta('name', 'twitter:image:alt', alt);
};

/** Inject / replace / remove the product JSON-LD block in <head>. */
export const setProductJsonLd = (data) => {
  let el = document.getElementById(PRODUCT_LD_ID);
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = PRODUCT_LD_ID;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
};

const PRIVATE_TITLES = {
  '/login': 'Log in',
  '/register': 'Create an account',
  '/forgot-password': 'Forgot password',
  '/reset-password': 'Reset password',
  '/verify-email': 'Verify email',
  '/profile': 'Profile',
  '/create-listing': 'Create a listing',
  '/my-listings': 'My listings',
  '/my-bids': 'My bids',
  '/favorites': 'Favorites',
  '/notifications': 'Notifications',
  '/settings/notifications': 'Notification settings',
};

const isPrivatePath = (pathname) =>
  PRIVATE_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

/** Route-level defaults for every pathname the router can render. */
export const routeSeo = (pathname, search = '') => {
  if (pathname === '/') {
    return { path: '/', description: SITE.description };
  }

  if (pathname === '/browse') {
    const category = new URLSearchParams(search).get('category');
    if (category && CATEGORIES.includes(category)) {
      return {
        title: `Pre-loved ${category} auctions`,
        description: `Browse live auctions for pre-loved ${category.toLowerCase()} on ${SITE.name}. Bid in real time and watch prices update live.`,
        path: `/browse?category=${encodeURIComponent(category)}`,
      };
    }
    return {
      title: 'Browse live auctions',
      description: `Browse live auctions for pre-loved clothing, furniture, electronics and books on ${SITE.name}. Filter by category, condition and price, and bid in real time.`,
      path: '/browse',
    };
  }

  if (/^\/items\/[^/]+$/.test(pathname)) {
    // Generic fallback until ItemDetail loads the lot and overrides it.
    return { title: 'Auction lot', path: pathname, type: 'product' };
  }

  if (isPrivatePath(pathname)) {
    return { title: PRIVATE_TITLES[pathname], path: pathname, noindex: true };
  }

  // Anything else is redirected to "/" by the router; never index it.
  return { path: pathname, noindex: true };
};

/** Product JSON-LD built only from fields the API actually returned. */
export const buildProductJsonLd = (item, path) => {
  if (!item?.title) return null;

  const price = parseFloat(item.current_highest_bid || item.starting_price);
  const ended = item.auction_end_time && new Date(item.auction_end_time) <= new Date();
  const closed = ended || (item.status && item.status !== 'active');
  const images = Array.isArray(item.image_urls)
    ? item.image_urls.filter((src) => typeof src === 'string' && /^https?:\/\//i.test(src))
    : [];

  const offer = {
    '@type': 'Offer',
    url: absoluteUrl(path),
    priceCurrency: SITE.currency,
    availability: closed
      ? item.status === 'sold'
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/Discontinued'
      : 'https://schema.org/InStock',
    itemCondition: item.condition === 'New' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
  };
  if (Number.isFinite(price)) offer.price = price.toFixed(2);
  if (item.auction_end_time && !closed) {
    offer.priceValidUntil = new Date(item.auction_end_time).toISOString().slice(0, 10);
  }
  if (item.users?.username) {
    offer.seller = { '@type': 'Person', name: item.users.username };
  }

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.title,
    url: absoluteUrl(path),
    offers: offer,
  };
  if (item.id != null) product.sku = String(item.id);
  if (item.description) product.description = truncate(item.description, 5000);
  if (images.length) product.image = images;
  if (item.category) product.category = item.category;

  return product;
};
