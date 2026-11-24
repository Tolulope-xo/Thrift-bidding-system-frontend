// Single source of truth for site-wide SEO facts. Used by vite.config.js
// (index.html placeholders), src/lib/seo.js (per-route tags) and
// scripts/generate-sitemap.js (robots.txt / sitemap.xml).
//
// Override the canonical origin per environment with VITE_SITE_URL.
export const DEFAULT_SITE_URL = 'https://thrift-bidding-system-frontend.vercel.app';

export const resolveSiteUrl = (value) => (value || DEFAULT_SITE_URL).trim().replace(/\/+$/, '');

export const SITE = {
  name: 'ThriftBid',
  tagline: 'Every thing has a second story',
  description:
    'ThriftBid — live auctions for pre-loved clothing, furniture, electronics and books. Bid in real time, sell in minutes.',
  themeColor: '#f5f1ea',
  ogImage: '/og-image.png',
  ogImageAlt: 'ThriftBid — live auctions for pre-loved clothing, furniture, electronics and books',
  currency: 'USD',
  locale: 'en_US',
};

// Categories offered by the Browse page filters (src/pages/Browse.jsx).
export const CATEGORIES = ['Clothing', 'Electronics', 'Furniture', 'Books', 'Other'];

// Public, indexable static routes. Everything else is noindex.
export const PUBLIC_ROUTES = ['/', '/browse'];

// Private / utility routes: noindex and never in the sitemap.
export const PRIVATE_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/profile',
  '/create-listing',
  '/my-listings',
  '/my-bids',
  '/favorites',
  '/notifications',
  '/settings/notifications',
];
