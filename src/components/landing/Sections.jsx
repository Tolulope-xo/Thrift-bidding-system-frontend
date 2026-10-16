import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, ArrowUpRight, Plus, Quote } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { Button, Logo } from '../ui';
import { EASE } from '../../lib/motion';
import { Eyebrow, Magnetic, Reveal, RevealLines } from './primitives';
import { CATEGORIES, FAQS, MARQUEE_WORDS, TESTIMONIALS } from './data';

/* --------------------------------- Marquee -------------------------------- */
const MarqueeRow = ({ reverse = false, duration = 45 }) => (
  <div className="flex overflow-hidden" aria-hidden>
    <div
      className="flex shrink-0 animate-marquee items-center"
      style={{ '--marquee-duration': `${duration}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
    >
      {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
        <span key={i} className="flex items-center">
          <span className={`px-6 sm:px-8 ${i % 2 ? 'font-display italic' : 'font-medium tracking-tight'}`}>{w}</span>
          <svg viewBox="0 0 24 24" className="size-5 text-flare sm:size-6" fill="currentColor">
            <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z" />
          </svg>
        </span>
      ))}
    </div>
  </div>
);

export const Marquee = () => (
  <section aria-label="What you’ll find" className="relative z-10 -my-2 overflow-hidden py-6">
    <div className="-rotate-2 scale-[1.04] bg-ink py-4 text-[clamp(1.5rem,4vw,2.75rem)] text-paper sm:py-5">
      <MarqueeRow />
    </div>
    <div className="mt-[-10px] rotate-1 scale-[1.04] border-y border-line bg-paper-2 py-3 text-[clamp(1.1rem,2.6vw,1.75rem)] text-ink-2">
      <MarqueeRow reverse duration={60} />
    </div>
  </section>
);

/* -------------------------------- Manifesto ------------------------------- */
const Word = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.22em] inline-block">
      {children}
    </motion.span>
  );
};

export const Manifesto = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const text =
    'Somewhere, a perfectly good jacket is waiting for its next owner. We built ThriftBid so it finds you — at a price set by the room, not a tag.';
  const words = text.split(' ');
  return (
    <section id="manifesto" className="mx-auto max-w-6xl px-4 py-28 sm:px-6 sm:py-40 lg:px-8">
      <Eyebrow>Why ThriftBid</Eyebrow>
      <p ref={ref} className="mt-8 font-display text-[clamp(2rem,5.4vw,4.5rem)] leading-[1.04] tracking-[-0.02em]">
        {words.map((w, i) => (
          <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
            {w === 'room,' || w === 'second' ? <em className="text-flare">{w}</em> : w}
          </Word>
        ))}
      </p>
    </section>
  );
};

/* ------------------------------- Categories ------------------------------- */
const CategoryTile = ({ cat, className = '', big = false, dark = false, i }) => (
  <Reveal delay={i * 0.06} className={className}>
    <Link
      to={`/browse?category=${encodeURIComponent(cat.name)}`}
      className={`group relative block size-full min-h-[220px] overflow-hidden rounded-[28px] ${dark ? 'bg-ink' : 'bg-paper-2'}`}
    >
      <img
        src={cat.img}
        alt=""
        loading="lazy"
        className={`absolute inset-0 size-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.08] ${
          dark ? 'opacity-50 mix-blend-luminosity' : ''
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
      <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-paper sm:inset-x-6 sm:bottom-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper/60">{cat.count} lots</p>
          <h3 className={`mt-1 font-display leading-none ${big ? 'text-[clamp(2.6rem,5vw,4.5rem)]' : 'text-[clamp(2rem,3vw,2.6rem)]'}`}>
            {cat.name === 'Other' ? 'Everything else' : cat.name}
          </h3>
          <p className="mt-2 max-h-0 overflow-hidden text-sm text-paper/75 opacity-0 transition-all duration-500 group-hover:max-h-10 group-hover:opacity-100 max-md:max-h-10 max-md:opacity-100">
            {cat.blurb}
          </p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-paper text-ink transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-rotate-45">
          <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  </Reveal>
);

export const Categories = () => {
  const [clothing, furniture, electronics, books, other] = CATEGORIES;
  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>Categories</Eyebrow>
          <RevealLines
            inView
            as="h2"
            className="mt-5 font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.92]"
            lines={['Wander the aisles.']}
          />
        </div>
        <p className="max-w-sm text-[15px] leading-relaxed text-muted">
          From hand-knits to hi-fi — every corner of the thrift store, without the dust. Pick a rail and start digging.
        </p>
      </div>
      <div className="mt-12 grid auto-rows-[220px] grid-cols-2 gap-3 sm:auto-rows-[260px] sm:gap-4 lg:grid-cols-4">
        <CategoryTile i={0} cat={clothing} big className="col-span-2 row-span-2" />
        <CategoryTile i={1} cat={furniture} className="col-span-2 lg:col-span-1" />
        <CategoryTile i={2} cat={electronics} />
        <CategoryTile i={3} cat={books} />
        <CategoryTile i={4} cat={other} dark className="max-lg:col-span-2 lg:col-span-1" />
      </div>
    </section>
  );
};

/* ------------------------------ Testimonials ------------------------------ */
const QuoteCard = ({ t }) => (
  <figure className="mx-2.5 flex w-[300px] shrink-0 flex-col justify-between rounded-[26px] border border-line bg-card p-6 shadow-soft sm:w-[380px] sm:p-7">
    <Quote className="size-6 text-flare" fill="currentColor" strokeWidth={0} />
    <blockquote className="mt-4 text-[16px] leading-relaxed text-ink-2 sm:text-[17px]">{t.quote}</blockquote>
    <figcaption className="mt-6 flex items-center gap-3">
      <img src={t.img} alt="" className="size-10 rounded-full object-cover" loading="lazy" />
      <div>
        <p className="text-sm font-semibold">{t.name}</p>
        <p className="text-[12px] text-muted">{t.role}</p>
      </div>
    </figcaption>
  </figure>
);

export const Testimonials = () => {
  const half = Math.ceil(TESTIMONIALS.length / 2);
  const rows = [TESTIMONIALS.slice(0, half), TESTIMONIALS.slice(half)];
  return (
    <section className="overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Eyebrow>From the floor</Eyebrow>
        <RevealLines
          inView
          as="h2"
          className="mt-5 font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.92]"
          lines={['Loved by people', <em key="e">who love old things.</em>]}
        />
      </div>
      <div className="mask-fade-x mt-14 space-y-5">
        {rows.map((row, r) => (
          <div key={r} className="group flex overflow-hidden">
            <div
              className="flex shrink-0 animate-marquee py-2 group-hover:[animation-play-state:paused]"
              style={{ '--marquee-duration': `${55 + r * 12}s`, animationDirection: r ? 'reverse' : 'normal' }}
            >
              {[...row, ...row, ...row, ...row].map((t, i) => (
                <QuoteCard key={i} t={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* -------------------------------- Sell CTA -------------------------------- */
export const SellCta = () => {
  const { isAuthenticated } = useAuthStore();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.25'] });
  const inset = useTransform(scrollYProgress, [0, 1], [7, 0]);
  const radius = useTransform(scrollYProgress, [0, 1], [56, 28]);
  const clipPath = useTransform([inset, radius], ([i, r]) => `inset(0 ${i}% round ${r}px)`);
  const { scrollYProgress: within } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y1 = useTransform(within, [0, 1], [80, -80]);
  const y2 = useTransform(within, [0, 1], [140, -140]);
  const y3 = useTransform(within, [0, 1], [40, -60]);

  return (
    <section id="sell" ref={ref} className="px-2 sm:px-4">
      <motion.div style={{ clipPath }} className="grain relative mx-auto max-w-[1600px] overflow-hidden bg-moss text-paper">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12 lg:py-32">
          <div className="lg:col-span-6">
            <Eyebrow light>For sellers</Eyebrow>
            <RevealLines
              inView
              as="h2"
              className="mt-5 font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.9]"
              lines={['Clear the closet.', <em key="e" className="text-gold">Fund the next find.</em>]}
            />
            <ol className="mt-10 space-y-4">
              {['Snap a few photos', 'Set a starting price & duration', 'Watch the bids roll in'].map((s, i) => (
                <Reveal as="li" key={s} delay={i * 0.08} className="flex items-center gap-4 text-[17px]">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-paper/25 font-mono text-[12px]">
                    {i + 1}
                  </span>
                  {s}
                </Reveal>
              ))}
            </ol>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Magnetic className="w-full sm:w-auto">
                <Button to={isAuthenticated ? '/create-listing' : '/register'} variant="light" size="lg" className="w-full sm:w-auto">
                  List your first item <ArrowUpRight className="size-4" />
                </Button>
              </Magnetic>
              <p className="self-center text-sm text-paper/60 sm:ml-2">Free to list. Live in under a minute.</p>
            </div>
          </div>
          <div className="relative h-[420px] sm:h-[520px] lg:col-span-6 lg:h-[600px]">
            <motion.img
              style={{ y: y1 }}
              src="/img/tees-rack.jpg"
              alt="Rack of tees"
              loading="lazy"
              className="absolute left-0 top-[6%] w-[58%] rounded-[24px] object-cover shadow-lift aspect-[4/5]"
            />
            <motion.img
              style={{ y: y2 }}
              src="/img/knit-poncho.jpg"
              alt="Knit poncho on hanger"
              loading="lazy"
              className="absolute right-0 top-0 w-[44%] rounded-[24px] object-cover shadow-lift aspect-[3/4]"
            />
            <motion.div style={{ y: y3 }} className="absolute bottom-[4%] right-[8%] w-[50%] rounded-[22px] bg-paper p-1.5 text-ink shadow-lift">
              <img src="/img/tan-sneaker.jpg" alt="Sneakers" loading="lazy" className="aspect-[16/10] w-full rounded-[17px] object-cover" />
              <div className="flex items-center justify-between px-2 pb-1.5 pt-2.5 text-[12px]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-moss-soft px-2 py-0.5 font-semibold text-moss">Sold</span>
                <span className="font-mono font-semibold">$118.00</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

/* ----------------------------------- FAQ ---------------------------------- */
const FaqItem = ({ item, open, onToggle, i }) => (
  <Reveal delay={i * 0.04} className="border-b border-line">
    <h3>
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="group flex w-full items-center justify-between gap-6 py-6 text-left sm:py-7"
      >
        <span className="text-[17px] font-medium text-ink transition-colors group-hover:text-ink-2 sm:text-xl">{item.q}</span>
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,color,transform] duration-500 ease-[var(--ease-out-expo)] ${
            open ? 'rotate-45 border-ink bg-ink text-paper' : 'border-line-strong text-ink'
          }`}
        >
          <Plus className="size-4" />
        </span>
      </button>
    </h3>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="overflow-hidden"
        >
          <p className="max-w-2xl pb-7 pr-12 text-[16px] leading-relaxed text-muted">{item.a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </Reveal>
);

export const Faq = () => {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Eyebrow>FAQ</Eyebrow>
            <RevealLines inView as="h2" className="mt-5 font-display text-[clamp(2.8rem,6vw,4.75rem)] leading-[0.92]" lines={['Good', 'questions.']} />
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-muted">
              The short version: bid fair, sell honest, and keep an eye on the clock.
            </p>
          </div>
        </div>
        <div className="border-t border-line lg:col-span-8">
          {FAQS.map((f, i) => (
            <FaqItem key={f.q} item={f} i={i} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
};

/* --------------------------------- Footer --------------------------------- */
export const Footer = ({ onNavigate }) => {
  const { isAuthenticated } = useAuthStore();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const wordY = useTransform(scrollYProgress, [0, 1], ['40%', '0%']);
  const cols = [
    {
      title: 'Marketplace',
      links: [
        { label: 'Browse lots', to: '/browse' },
        { label: 'Ending soon', to: '/browse?sortBy=ending_soon' },
        { label: 'Sell an item', to: isAuthenticated ? '/create-listing' : '/register' },
      ],
    },
    {
      title: 'Account',
      links: isAuthenticated
        ? [
            { label: 'My bids', to: '/my-bids' },
            { label: 'Saved lots', to: '/favorites' },
            { label: 'Profile', to: '/profile' },
          ]
        : [
            { label: 'Create account', to: '/register' },
            { label: 'Log in', to: '/login' },
            { label: 'Reset password', to: '/forgot-password' },
          ],
    },
    {
      title: 'Learn',
      links: [
        { label: 'How it works', hash: '#how' },
        { label: 'Categories', hash: '#categories' },
        { label: 'FAQ', hash: '#faq' },
      ],
    },
  ];

  return (
    <footer ref={ref} className="relative overflow-hidden bg-ink pt-20 text-paper sm:pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo light />
            <p className="mt-6 max-w-sm font-display text-3xl leading-tight text-paper/90 sm:text-4xl">
              Every thing has a <em className="text-flare">second</em> story.
            </p>
            <div className="mt-8">
              <Button to={isAuthenticated ? '/browse' : '/register'} variant="flare" size="lg">
                {isAuthenticated ? 'Back to the floor' : 'Join ThriftBid'} <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
            {cols.map((c) => (
              <div key={c.title}>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper/45">{c.title}</p>
                <ul className="mt-5 space-y-3">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      {l.to ? (
                        <Link to={l.to} className="text-[15px] text-paper/80 transition-colors hover:text-paper">
                          {l.label}
                        </Link>
                      ) : (
                        <a
                          href={l.hash}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate(l.hash);
                          }}
                          className="text-[15px] text-paper/80 transition-colors hover:text-paper"
                        >
                          {l.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-paper/10 py-6 text-[13px] text-paper/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ThriftBid. Made for people who love old things.</p>
          <button onClick={() => onNavigate(0)} className="self-start text-paper/60 transition-colors hover:text-paper sm:self-auto">
            Back to top ↑
          </button>
        </div>
      </div>
      <div aria-hidden className="overflow-hidden">
        <motion.p
          style={{ y: wordY }}
          className="select-none whitespace-nowrap text-center font-display text-[25vw] leading-[0.78] tracking-[-0.05em] text-paper/[0.07]"
        >
          ThriftBid
        </motion.p>
      </div>
    </footer>
  );
};
