import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, Gavel, Star } from 'lucide-react';
import Countdown from './Countdown';
import { EASE, formatMoney } from '../../lib/motion';

const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#ece6da"/><path d="M170 130h60M200 130v50" stroke="#a89f92" stroke-width="10" stroke-linecap="round"/></svg>`
  );

const ItemCard = ({ item, index = 0 }) => {
  const mainImage = item.image_urls?.[0] || FALLBACK;
  const currentPrice = item.current_highest_bid || item.starting_price;
  const ended = item.auction_end_time && new Date(item.auction_end_time) <= new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: EASE, delay: Math.min(index, 8) * 0.04 }}
    >
      <Link
        to={`/items/${item.id}`}
        className="group block overflow-hidden rounded-2xl border border-line bg-card shadow-soft transition-[box-shadow,transform,border-color] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-line-strong hover:shadow-lift"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
          <img
            src={mainImage}
            alt={item.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
            onError={(e) => {
              e.currentTarget.src = FALLBACK;
            }}
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <span className="rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-medium text-ink-2 backdrop-blur">
              {item.category}
            </span>
            {!ended && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-medium text-paper backdrop-blur">
                <span className="size-1.5 rounded-full bg-flare animate-pulse-dot" />
                Live
              </span>
            )}
          </div>
          <div className="absolute inset-x-3 bottom-3 flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-[12px] backdrop-blur w-fit">
            <Clock className="size-3.5 text-muted" />
            <Countdown endTime={item.auction_end_time} />
            {!ended && <span className="text-muted">left</span>}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-1 text-[15px] font-semibold text-ink">{item.title}</h3>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[12px] text-muted">
            <span>{item.condition}</span>
            {item.users?.username && (
              <>
                <span className="size-0.5 rounded-full bg-faint" />
                <span className="truncate">@{item.users.username}</span>
                {item.users.seller_rating > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-ink-2">
                    <Star className="size-3 fill-gold text-gold" />
                    {Number(item.users.seller_rating).toFixed(1)}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="mt-4 flex items-end justify-between border-t border-dashed border-line pt-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-faint">
                {item.current_highest_bid ? 'Current bid' : 'Starting at'}
              </p>
              <p className="tabular font-mono text-lg font-semibold text-ink">{formatMoney(currentPrice)}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[12px] text-muted">
              <Gavel className="size-3.5" />
              {item.bid_count || 0}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ItemCard;
