import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Gavel } from 'lucide-react';
import itemsService from '../../services/itemsService';
import { Button, LiveDot } from '../ui';
import { EASE } from '../../lib/motion';
import { Eyebrow, LiveTimer, RevealLines } from './primitives';
import { SHOWCASE_LOTS } from './data';

// Prefer real lots from the API; fall back to the showcase so the page always feels alive.
const useLots = () => {
  const [lots, setLots] = useState(SHOWCASE_LOTS);
  useEffect(() => {
    let cancelled = false;
    itemsService
      .getItems({ sortBy: 'ending_soon', limit: 9 })
      .then((res) => {
        const items = res?.data?.items || [];
        if (cancelled || items.length < 4) return;
        setLots(
          items.map((it) => ({
            id: it.id,
            href: `/items/${it.id}`,
            title: it.title,
            category: it.category,
            condition: it.condition,
            price: Number(it.current_highest_bid || it.starting_price),
            bids: it.bid_count || 0,
            end: it.auction_end_time,
            img: it.image_urls?.[0] || '/img/rack-neutral.jpg',
          }))
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return lots;
};

const LotCard = ({ lot, i }) => (
  <motion.li
    initial={{ opacity: 0, x: 60 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.8, ease: EASE, delay: Math.min(i, 4) * 0.07 }}
    className="w-[78vw] max-w-[340px] shrink-0 snap-start sm:w-[320px]"
  >
    <Link to={lot.href || '/browse'} className="group block" draggable={false}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] bg-paper-2">
        <img
          src={lot.img}
          alt={lot.title}
          loading="lazy"
          draggable={false}
          className="size-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.07]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
          <span className="rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-medium text-ink-2 backdrop-blur">{lot.category}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] text-paper backdrop-blur">
            <LiveDot className="size-1.5" />
            <LiveTimer end={lot.end} />
          </span>
        </div>
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-paper">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold">{lot.title}</p>
            <p className="mt-0.5 text-[12px] text-paper/70">{lot.condition}</p>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-paper text-ink transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between px-1">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-faint">Current bid</p>
          <p className="font-mono text-lg font-semibold">${lot.price.toLocaleString()}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
          <Gavel className="size-3.5" /> {lot.bids} bids
        </span>
      </div>
    </Link>
  </motion.li>
);

const LiveLots = () => {
  const lots = useLots();
  const trackRef = useRef(null);
  const progress = useMotionValue(0);
  const smooth = useSpring(progress, { stiffness: 200, damping: 30 });
  const [edges, setEdges] = useState({ start: true, end: false });

  const onScroll = () => {
    const el = trackRef.current;
    const max = el.scrollWidth - el.clientWidth;
    progress.set(max > 0 ? el.scrollLeft / max : 0);
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft > max - 8 });
  };

  const scrollBy = (dir) => {
    const el = trackRef.current;
    const card = el.querySelector('li');
    el.scrollBy({ left: dir * ((card?.offsetWidth || 320) + 20) * 2, behavior: 'smooth' });
  };

  return (
    <section id="live" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>On the floor now</Eyebrow>
            <RevealLines
              inView
              as="h2"
              className="mt-5 font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.92]"
              lines={['Ending soon.', <em key="e" className="text-muted">Don’t blink.</em>]}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollBy(-1)}
              disabled={edges.start}
              aria-label="Previous lots"
              className="hidden size-12 place-items-center rounded-full border border-line-strong transition-[background-color,opacity] hover:bg-ink hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink md:grid"
            >
              <ArrowLeft className="size-5" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              disabled={edges.end}
              aria-label="Next lots"
              className="hidden size-12 place-items-center rounded-full border border-line-strong transition-[background-color,opacity] hover:bg-ink hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink md:grid"
            >
              <ArrowRight className="size-5" />
            </button>
            <Button to="/browse" variant="outline" className="ml-1">
              View all lots <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <ul
        ref={trackRef}
        onScroll={onScroll}
        className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-4 sm:scroll-px-6 sm:px-6 lg:scroll-px-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
      >
        {lots.map((lot, i) => (
          <LotCard key={lot.id} lot={lot} i={i} />
        ))}
        <li className="w-[60vw] max-w-[280px] shrink-0 snap-start sm:w-[260px]">
          <Link
            to="/browse"
            className="group grid aspect-[4/5] place-items-center rounded-[26px] border border-dashed border-line-strong text-center transition-colors hover:border-ink hover:bg-card"
          >
            <span>
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-ink text-paper transition-transform duration-500 group-hover:scale-110">
                <ArrowRight className="size-5" />
              </span>
              <span className="mt-4 block font-display text-3xl">See every lot</span>
            </span>
          </Link>
        </li>
      </ul>

      <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-px w-full bg-line">
          <motion.div style={{ scaleX: smooth }} className="h-px origin-left bg-ink" />
        </div>
      </div>
    </section>
  );
};

export default LiveLots;
