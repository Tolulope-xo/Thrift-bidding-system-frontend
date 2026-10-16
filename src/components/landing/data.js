// Showcase content for the landing page. Live lots are swapped in from the API when available.
const hours = (h) => new Date(Date.now() + h * 3600 * 1000).toISOString();

export const SHOWCASE_LOTS = [
  { id: 's1', title: 'Leather moto jacket', category: 'Clothing', condition: 'Like New', price: 142, bids: 18, end: hours(0.42), img: '/img/leather-jacket.jpg' },
  { id: 's2', title: 'Polaroid OneStep 2', category: 'Electronics', condition: 'Good', price: 64, bids: 9, end: hours(1.6), img: '/img/polaroid.jpg' },
  { id: 's3', title: 'Mid-century velvet sofa', category: 'Furniture', condition: 'Good', price: 310, bids: 22, end: hours(3.2), img: '/img/green-sofa.jpg' },
  { id: 's4', title: 'Skeleton dial wristwatch', category: 'Other', condition: 'Like New', price: 188, bids: 14, end: hours(5.5), img: '/img/watch.jpg' },
  { id: 's5', title: 'Mustard lounge chair', category: 'Furniture', condition: 'Like New', price: 96, bids: 7, end: hours(7.1), img: '/img/yellow-chair.jpg' },
  { id: 's6', title: 'Wayfarer sunglasses', category: 'Other', condition: 'New', price: 38, bids: 11, end: hours(9.8), img: '/img/sunglasses.jpg' },
  { id: 's7', title: 'Studio headphones', category: 'Electronics', condition: 'Good', price: 72, bids: 6, end: hours(12.4), img: '/img/headphones.jpg' },
  { id: 's8', title: 'Hand-knit fringe poncho', category: 'Clothing', condition: 'Like New', price: 29, bids: 5, end: hours(18), img: '/img/knit-poncho.jpg' },
  { id: 's9', title: 'Suede wingtip brogues', category: 'Clothing', condition: 'Good', price: 54, bids: 8, end: hours(22), img: '/img/brogue.jpg' },
];

export const CATEGORIES = [
  { name: 'Clothing', blurb: 'Denim, knits, outerwear, shoes', img: '/img/rack-florals.jpg', count: '2,140' },
  { name: 'Furniture', blurb: 'Chairs, sofas, the odd lamp', img: '/img/yellow-chair.jpg', count: '486' },
  { name: 'Electronics', blurb: 'Film cameras to headphones', img: '/img/camera.jpg', count: '732' },
  { name: 'Books', blurb: 'First editions, dog-eared gems', img: '/img/books.jpg', count: '1,018' },
  { name: 'Other', blurb: 'Watches, frames, curios', img: '/img/sunglasses.jpg', count: '655' },
];

export const MARQUEE_WORDS = [
  'Vintage denim',
  'Film cameras',
  'Mid-century chairs',
  'First editions',
  'Leather jackets',
  'Wristwatches',
  'Vinyl & hi-fi',
  'Hand-knits',
  'Ceramics',
  'Sneakers',
];

export const TESTIMONIALS = [
  { quote: 'Won a 70s suede jacket for less than a takeaway. The countdown at the end had my heart racing.', name: 'Amara O.', role: 'Bidder, Lagos', img: '/img/leather-jacket.jpg' },
  { quote: 'I listed six things on a Sunday and they were all sold by Thursday. The outbid alerts do the selling for you.', name: 'Daniel K.', role: 'Seller', img: '/img/closet.jpg' },
  { quote: 'It feels like a real auction room, not a classifieds page. Watching the price tick up live is addictive.', name: 'Priya S.', role: 'Collector', img: '/img/camera.jpg' },
  { quote: 'Clean, fast, and honest. I know exactly where I stand on every lot I’m watching.', name: 'Tomás R.', role: 'Bidder', img: '/img/watch.jpg' },
  { quote: 'Cleared my whole flat before moving. The 60-second listing flow is no exaggeration.', name: 'Hannah L.', role: 'Seller', img: '/img/green-sofa.jpg' },
  { quote: 'Found a first edition I’d been hunting for years. Saved it, got the ending-soon ping, won it.', name: 'Kwame A.', role: 'Book hunter', img: '/img/books.jpg' },
];

export const FAQS = [
  {
    q: 'How does bidding work?',
    a: 'Every lot has a starting price and a fixed end time. Place a bid above the current highest and it lands on every watcher’s screen instantly. When the clock hits zero, the highest bid wins.',
  },
  {
    q: 'How will I know if I’ve been outbid?',
    a: 'You’ll get a real-time notification the moment someone beats your bid, plus reminders when lots you’re in are ending soon. Tune exactly what you receive in notification preferences.',
  },
  {
    q: 'What happens when I win?',
    a: 'You’ll be notified straight away and the seller is prompted to reach out with payment and pickup details. Your win also shows up under My bids.',
  },
  {
    q: 'Can I edit a listing after it goes live?',
    a: 'Yes — for the first 30 minutes, as long as nobody has bid yet. After that the lot is locked so every bidder is competing for exactly what they saw.',
  },
  {
    q: 'What can I sell?',
    a: 'Clothing, furniture, electronics, books and just about any other pre-loved thing in decent shape. Good photos and an honest condition grade sell best.',
  },
  {
    q: 'Does it cost anything to join?',
    a: 'Creating an account, browsing and saving lots is free. Verify your email to unlock full access to bidding and selling.',
  },
];

export const BIDDERS = ['maya_k', 'thrift.theo', 'jun_o', 'ada.finds', 'r.oyelaran', 'lou_vintage', 'sam.b', 'nkem'];
