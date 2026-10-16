import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowRight, Gavel } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { Button, LiveDot } from '../ui';
import { EASE } from '../../lib/motion';
import { LiveTimer, Magnetic, RevealLines, RollingNumber } from './primitives';
import { BIDDERS, SHOWCASE_LOTS } from './data';

const [JACKET, POLAROID, , WATCH] = SHOWCASE_LOTS;

/** Card that responds to pointer depth + scroll speed. */
const Floating = ({ depth, scrollRange, mx, my, progress, className, children, delay = 0, rotate = 0 }) => {
  const px = useTransform(mx, (v) => v * depth * 18);
  const py = useTransform(my, (v) => v * depth * 18);
  const sy = useTransform(progress, [0, 1], [0, scrollRange]);
  const y = useTransform([py, sy], ([a, b]) => a + b);
  return (
    <motion.div style={{ x: px, y }} className={`absolute ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.88, rotate: rotate * 2 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate }}
        transition={{ duration: 1.2, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

const HeroStage = ({ progress }) => {
  const ref = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 18 });
  const my = useSpring(rawY, { stiffness: 60, damping: 18 });

  const [price, setPrice] = useState(JACKET.price);
  const [bids, setBids] = useState(JACKET.bids);
  const [feed, setFeed] = useState(null);
  const [flash, setFlash] = useState(0);

  // Simulated live room: a new bid lands every few seconds
  useEffect(() => {
    let i = 0;
    let current = JACKET.price;
    const t = setInterval(() => {
      current += 2 + Math.floor(Math.random() * 7);
      setPrice(current);
      setFeed({ id: Date.now(), who: BIDDERS[i++ % BIDDERS.length], amount: current });
      setBids((b) => b + 1);
      setFlash((f) => f + 1);
    }, 3400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!feed) return;
    const t = setTimeout(() => setFeed(null), 2600);
    return () => clearTimeout(t);
  }, [feed]);

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = ref.current.getBoundingClientRect();
    rawX.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    rawY.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => {
        rawX.set(0);
        rawY.set(0);
      }}
      className="relative mx-auto aspect-[10/11] w-full max-w-[520px] select-none lg:max-w-none"
    >
      {/* rotating seal */}
      <Floating depth={-0.6} scrollRange={-40} mx={mx} my={my} progress={progress} className="bottom-[6%] left-[3%] z-30 w-[21%]" delay={0.9}>
        <motion.svg viewBox="0 0 100 100" className="w-full" animate={{ rotate: 360 }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}>
          <defs>
            <path id="seal" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
          </defs>
          <circle cx="50" cy="50" r="49" className="fill-flare" />
          <text className="fill-white font-mono text-[9.5px] uppercase tracking-[0.2em]">
            <textPath href="#seal" textLength="232" lengthAdjust="spacing">Live auctions • Real bids •</textPath>
          </text>
          <g transform="translate(38 38)">
            <path d="M3 21h14M6.5 13.5l-3 3M10 4l7 7M7.5 6.5l7 7M12 3l6 6-8 8-6-6z" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="scale(1.05)" />
          </g>
        </motion.svg>
      </Floating>

      {/* main lot */}
      <Floating depth={0.5} scrollRange={-60} mx={mx} my={my} progress={progress} className="left-[20%] top-[5%] z-20 w-[62%]" delay={0.35} rotate={-1.5}>
        <div className="overflow-hidden rounded-[28px] bg-card p-2 shadow-[0_40px_80px_-30px_rgb(23_20_15/0.45)] ring-1 ring-ink/5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[22px]">
            <img src={JACKET.img} alt="Leather moto jacket up for auction" fetchPriority="high" className="size-full object-cover" />
            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-medium text-paper backdrop-blur">
              <LiveDot className="size-1.5" /> Live
            </div>
            <div className="absolute inset-x-2 bottom-2 rounded-2xl bg-card/90 p-3 backdrop-blur-md sm:p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[13px] font-semibold text-ink sm:text-sm">{JACKET.title}</p>
                <LiveTimer end={JACKET.end} className="text-[11px] sm:text-xs" />
              </div>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted">Current bid</p>
                  <motion.div
                    key={flash}
                    initial={{ color: '#ff4f1a' }}
                    animate={{ color: '#17140f' }}
                    transition={{ duration: 1.2 }}
                    className="font-mono text-[clamp(1.25rem,4.5vw,1.75rem)] font-semibold leading-none"
                  >
                    <RollingNumber value={price} />
                  </motion.div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-paper-2 px-2 py-1 text-[11px] text-ink-2">
                  <Gavel className="size-3" /> {bids} bids
                </span>
              </div>
            </div>
          </div>
        </div>
      </Floating>

      {/* secondary lot top right */}
      <Floating depth={1.1} scrollRange={-140} mx={mx} my={my} progress={progress} className="right-0 top-0 z-10 w-[36%]" delay={0.55} rotate={6}>
        <div className="rounded-[20px] bg-card p-1.5 shadow-lift ring-1 ring-ink/5">
          <img src={POLAROID.img} alt="Polaroid camera lot" className="aspect-square w-full rounded-[15px] object-cover" />
          <div className="flex items-center justify-between px-1.5 pb-1 pt-2 text-[11px]">
            <span className="font-medium text-ink-2">Polaroid</span>
            <span className="font-mono font-semibold">${POLAROID.price}</span>
          </div>
        </div>
      </Floating>

      {/* tertiary lot bottom left */}
      <Floating depth={1.4} scrollRange={-30} mx={mx} my={my} progress={progress} className="left-0 top-[12%] z-30 w-[30%]" delay={0.7} rotate={-6}>
        <div className="rounded-[20px] bg-ink p-1.5 text-paper shadow-lift">
          <img src={WATCH.img} alt="Wristwatch lot" className="aspect-[4/3] w-full rounded-[15px] object-cover" />
          <div className="px-1.5 pb-1 pt-2">
            <p className="text-[10px] uppercase tracking-wider text-paper/50">Ends in</p>
            <LiveTimer end={WATCH.end} className="text-[13px] text-paper" />
          </div>
        </div>
      </Floating>

      {/* live bid toast */}
      <div className="absolute bottom-0 right-0 z-40 w-[54%]">
        <AnimatePresence>
          {feed && (
            <motion.div
              key={feed.id}
              initial={{ opacity: 0, x: 40, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="flex items-center gap-2.5 rounded-2xl border border-line bg-card/95 p-2.5 pr-3.5 shadow-lift backdrop-blur"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-flare text-[11px] font-semibold uppercase text-white">
                {feed.who.slice(0, 2)}
              </span>
              <div className="min-w-0 text-[12px] leading-tight">
                <p className="truncate text-muted">@{feed.who} just bid</p>
                <p className="font-mono text-[13px] font-semibold text-ink">${feed.amount.toLocaleString()}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Hero = ({ onNavigate }) => {
  const { isAuthenticated } = useAuthStore();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={sectionRef} className="grain relative overflow-hidden pb-14 pt-28 sm:pt-32 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-20 lg:pt-28">
      {/* ambient light */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-40 size-[640px] rounded-full bg-[radial-gradient(closest-side,rgb(255_79_26/0.16),transparent)]" />
        <div className="absolute -bottom-60 -left-40 size-[720px] rounded-full bg-[radial-gradient(closest-side,rgb(35_65_47/0.12),transparent)]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <motion.div style={{ y: textY, opacity: textOpacity }} className="lg:col-span-7">
          <motion.button
            onClick={() => onNavigate('#live')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="group mb-7 inline-flex items-center gap-2.5 rounded-full border border-line bg-card/70 py-1.5 pl-2 pr-3.5 text-[13px] text-ink-2 shadow-soft backdrop-blur transition-colors hover:border-line-strong"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-2 py-0.5 text-[11px] font-medium text-paper">
              <LiveDot className="size-1.5" /> Live
            </span>
            128 lots closing today
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </motion.button>

          <RevealLines
            delay={0.15}
            className="font-display text-[clamp(3.4rem,11.5vw,8rem)] leading-[0.86] tracking-[-0.03em] text-ink"
            lines={[
              'Every thing',
              <>
                has a <em className="text-flare">second</em>
              </>,
              'story.',
            ]}
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
            className="mt-7 max-w-[34rem] text-[17px] leading-relaxed text-ink-2 sm:text-lg"
          >
            ThriftBid is a live auction house for pre-loved clothing, furniture, tech and books. Bid in real time against
            real people, or list your own finds in under a minute.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Magnetic className="w-full sm:w-auto">
              <Button to={isAuthenticated ? '/browse' : '/register'} size="lg" className="group w-full sm:w-auto">
                {isAuthenticated ? 'Enter the floor' : 'Start bidding'}
                <span className="relative grid size-6 place-items-center overflow-hidden rounded-full bg-paper text-ink">
                  <ArrowRight className="size-3.5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-6" />
                  <ArrowRight className="absolute size-3.5 -translate-x-6 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0" />
                </span>
              </Button>
            </Magnetic>
            <Button to={isAuthenticated ? '/create-listing' : '/browse'} variant="outline" size="lg" className="w-full sm:w-auto">
              {isAuthenticated ? 'Sell something' : 'Browse lots'}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-10 flex items-center gap-4"
          >
            <div className="flex -space-x-2.5">
              {['/img/flatlay.jpg', '/img/heels.jpg', '/img/tan-sneaker.jpg', '/img/frames.jpg'].map((src) => (
                <img key={src} src={src} alt="" className="size-9 rounded-full object-cover ring-[3px] ring-paper" />
              ))}
            </div>
            <p className="text-[13px] leading-snug text-muted">
              <span className="font-semibold text-ink">24,000+ thrifters</span>
              <br />
              bidding on second-hand finds
            </p>
          </motion.div>
        </motion.div>

        <div className="lg:col-span-5">
          <HeroStage progress={scrollYProgress} />
        </div>
      </div>

      <motion.button
        onClick={() => onNavigate('#manifesto')}
        aria-label="Scroll to content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted lg:flex"
      >
        Scroll
        <span className="relative h-10 w-px overflow-hidden bg-line-strong">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-ink"
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      </motion.button>
    </section>
  );
};

export default Hero;
