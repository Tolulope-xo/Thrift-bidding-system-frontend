import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useScroll, useSpring } from 'motion/react';
import { Camera, Check, MapPin, Trophy } from 'lucide-react';
import { EASE } from '../../lib/motion';
import { Eyebrow, RevealLines, RollingNumber } from './primitives';

/* ------------------------------ device screens ----------------------------- */
const Typing = ({ text, delay = 0 }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    let i = 0;
    let t;
    const start = setTimeout(() => {
      t = setInterval(() => {
        i += 1;
        setN(i);
        if (i >= text.length) clearInterval(t);
      }, 55);
    }, delay * 1000);
    return () => {
      clearTimeout(start);
      clearInterval(t);
    };
  }, [text, delay]);
  return (
    <>
      {text.slice(0, n)}
      <span className="ml-px inline-block h-[1em] w-px translate-y-[2px] animate-pulse bg-ink" />
    </>
  );
};

const ListScreen = () => (
  <div className="flex h-full flex-col gap-3 p-4">
    <div className="flex items-center justify-between">
      <p className="font-display text-2xl">New listing</p>
      <span className="font-mono text-[10px] text-muted">STEP 1/3</span>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {['/img/leather-jacket.jpg', '/img/flatlay.jpg', '/img/rack-neutral.jpg'].map((src, i) => (
        <motion.img
          key={src}
          src={src}
          alt=""
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + i * 0.18, type: 'spring', stiffness: 260, damping: 20 }}
          className="aspect-square w-full rounded-xl object-cover"
        />
      ))}
    </div>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.75 }}
      className="grid place-items-center rounded-xl border border-dashed border-line-strong py-2.5 text-[11px] text-muted"
    >
      <span className="inline-flex items-center gap-1.5">
        <Camera className="size-3.5" /> Add up to 5 photos
      </span>
    </motion.div>
    <div className="space-y-2 text-[12px]">
      <div className="rounded-xl border border-ink bg-card px-3 py-2.5">
        <p className="text-[10px] text-muted">Title</p>
        <p className="font-medium">
          <Typing text="Leather moto jacket" delay={0.9} />
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-line bg-card px-3 py-2.5">
          <p className="text-[10px] text-muted">Starting price</p>
          <p className="font-mono font-medium">$40.00</p>
        </div>
        <div className="rounded-xl border border-line bg-card px-3 py-2.5">
          <p className="text-[10px] text-muted">Condition</p>
          <p className="font-medium">Like new</p>
        </div>
      </div>
      <div className="flex gap-1.5">
        {['1d', '3d', '7d'].map((d) => (
          <span key={d} className={`flex-1 rounded-lg py-1.5 text-center font-mono ${d === '3d' ? 'bg-ink text-paper' : 'bg-paper-2 text-muted'}`}>
            {d}
          </span>
        ))}
      </div>
    </div>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.2, ease: EASE, duration: 0.6 }}
      className="mt-auto rounded-full bg-flare py-3 text-center text-[13px] font-semibold text-white shadow-flare"
    >
      Publish lot
    </motion.div>
  </div>
);

const BidScreen = () => {
  const [price, setPrice] = useState(86);
  const [rows, setRows] = useState([
    { id: 1, who: 'ada.finds', amt: 86 },
    { id: 2, who: 'jun_o', amt: 80 },
  ]);
  useEffect(() => {
    const who = ['lou_vintage', 'you', 'maya_k', 'you', 'sam.b'];
    let i = 0;
    let current = 86;
    const t = setInterval(() => {
      current += 4 + (i % 3) * 2;
      const entry = { id: Date.now(), who: who[i % who.length], amt: current };
      i += 1;
      setPrice(current);
      setRows((r) => [entry, ...r].slice(0, 4));
    }, 1700);
    return () => clearInterval(t);
  }, []);
  const leader = rows[0]?.who;
  return (
    <div className="flex h-full flex-col">
      <div className="relative h-[42%] shrink-0">
        <img src="/img/leather-jacket.jpg" alt="" className="size-full object-cover" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] text-paper">
          <span className="size-1.5 rounded-full bg-flare animate-pulse-dot" /> LIVE · 00:04:12
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted">Current bid</p>
            <p className="font-mono text-3xl font-semibold leading-none">
              <RollingNumber value={price} />
            </p>
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={leader === 'you' ? 'win' : 'out'}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                leader === 'you' ? 'bg-moss-soft text-moss' : 'bg-flare-soft text-flare-deep'
              }`}
            >
              {leader === 'you' ? 'You’re winning' : 'Outbid'}
            </motion.span>
          </AnimatePresence>
        </div>
        <ul className="space-y-1.5 overflow-hidden text-[12px]">
          <AnimatePresence initial={false}>
            {rows.map((r, i) => (
              <motion.li
                key={r.id}
                layout
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className={`flex items-center justify-between rounded-lg px-2.5 py-2 ${i === 0 ? 'bg-paper-2' : ''}`}
              >
                <span className={r.who === 'you' ? 'font-semibold text-ink' : 'text-ink-2'}>@{r.who}</span>
                <span className="font-mono">${r.amt}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <div className="mt-auto flex gap-2">
          <span className="rounded-full border border-line px-3 py-2.5 font-mono text-[12px]">+$5</span>
          <span className="flex-1 rounded-full bg-ink py-2.5 text-center text-[13px] font-semibold text-paper">
            Bid ${price + 5}
          </span>
        </div>
      </div>
    </div>
  );
};

const WinScreen = () => (
  <div className="relative flex h-full flex-col items-center overflow-hidden p-5 text-center">
    {Array.from({ length: 14 }).map((_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return (
        <motion.span
          key={i}
          className={`absolute left-1/2 top-[26%] size-2 rounded-sm ${['bg-flare', 'bg-gold', 'bg-moss-2'][i % 3]}`}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: Math.cos(a) * 120, y: Math.sin(a) * 120 + 40, opacity: 0, rotate: 200 }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.35 }}
        />
      );
    })}
    <motion.div
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
      className="mt-6 grid size-20 place-items-center rounded-full bg-gold text-ink shadow-[0_20px_40px_-12px_rgb(233_185_73/0.8)]"
    >
      <Trophy className="size-9" strokeWidth={1.6} />
    </motion.div>
    <p className="mt-5 font-display text-4xl leading-none">You won!</p>
    <p className="mt-2 text-[12px] text-muted">Leather moto jacket · 23 bids</p>
    <p className="mt-3 font-mono text-3xl font-semibold">$186.00</p>
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6, ease: EASE }}
      className="mt-auto w-full space-y-2 rounded-2xl border border-line bg-card p-3 text-left text-[12px]"
    >
      <p className="flex items-center gap-2">
        <span className="grid size-5 place-items-center rounded-full bg-moss text-paper">
          <Check className="size-3" />
        </span>
        Seller notified
      </p>
      <p className="flex items-center gap-2 text-ink-2">
        <span className="grid size-5 place-items-center rounded-full bg-paper-2">
          <MapPin className="size-3" />
        </span>
        Pickup details on the way
      </p>
    </motion.div>
  </div>
);

const STEPS = [
  {
    n: '01',
    title: 'List it in sixty seconds.',
    body: 'Snap a few photos, pick a condition and a starting price. Your lot goes live to every watcher the moment you hit publish.',
    points: ['Up to 5 photos per lot', 'Choose 1, 3 or 7-day auctions', 'Edit freely for the first 30 minutes'],
    Screen: ListScreen,
  },
  {
    n: '02',
    title: 'Bid with the room, live.',
    body: 'Every bid lands on every screen in real time. Watch the price move, see who’s in, and get pinged the second you’re outbid.',
    points: ['Real-time price & bid history', 'Instant outbid notifications', 'Ending-soon reminders for saved lots'],
    Screen: BidScreen,
  },
  {
    n: '03',
    title: 'Win it. Take it home.',
    body: 'When the clock hits zero the highest bid wins. You both get notified and the seller reaches out to sort payment and pickup.',
    points: ['Winner & seller notified instantly', 'Track every win in My bids', 'Rate sellers to keep the floor honest'],
    Screen: WinScreen,
  },
];

const Device = ({ children, className = '' }) => (
  <div className={`relative rounded-[42px] bg-ink p-2.5 shadow-[0_50px_100px_-40px_rgb(23_20_15/0.6)] ${className}`}>
    <div className="absolute left-1/2 top-4 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-ink" />
    <div className="relative aspect-[9/18.5] overflow-hidden rounded-[34px] bg-paper">
      <div className="h-9" />
      <div className="absolute inset-x-0 bottom-0 top-9">{children}</div>
    </div>
  </div>
);

const Step = ({ step, index, onActive }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);
  return (
    <div ref={ref} className="flex flex-col gap-8 lg:min-h-[88vh] lg:justify-center">
      {/* mobile/tablet device inline */}
      <div className="mx-auto w-[min(300px,78vw)] lg:hidden">
        <Device>
          <MountWhenVisible>
            <step.Screen />
          </MountWhenVisible>
        </Device>
      </div>
      <div>
        <span className="font-mono text-sm text-flare">{step.n}</span>
        <h3 className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] leading-[0.95]">{step.title}</h3>
        <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink-2">{step.body}</p>
        <ul className="mt-6 space-y-2.5">
          {step.points.map((p) => (
            <li key={p} className="flex items-center gap-3 text-[15px] text-ink-2">
              <span className="grid size-5 place-items-center rounded-full bg-ink text-paper">
                <Check className="size-3" strokeWidth={3} />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/** Mounts children only once scrolled near, so mobile screen animations play when seen. */
const MountWhenVisible = ({ children }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20% 0px' });
  return (
    <div ref={ref} className="size-full">
      {inView && children}
    </div>
  );
};

const HowItWorks = () => {
  const [active, setActive] = useState(0);
  const stepsRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: stepsRef, offset: ['start center', 'end center'] });
  const rail = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const ActiveScreen = STEPS[active].Screen;

  return (
    <section id="how" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Eyebrow>How it works</Eyebrow>
          <RevealLines
            inView
            as="h2"
            className="mt-5 font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.92]"
            lines={['Three steps from', <em key="e">closet to collector.</em>]}
          />
        </div>

        <div className="mt-16 grid gap-20 lg:mt-8 lg:grid-cols-2 lg:gap-16">
          {/* sticky device (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-0 flex h-screen items-center justify-center">
              <div className="relative">
                <div aria-hidden className="absolute -inset-16 rounded-full bg-[radial-gradient(closest-side,rgb(255_79_26/0.18),transparent)]" />
                <Device className="w-[320px] xl:w-[340px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      className="size-full"
                      initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
                      transition={{ duration: 0.45, ease: EASE }}
                    >
                      <ActiveScreen />
                    </motion.div>
                  </AnimatePresence>
                </Device>
                <div className="absolute -right-14 top-1/2 flex -translate-y-1/2 flex-col gap-3">
                  {STEPS.map((s, i) => (
                    <span
                      key={s.n}
                      className={`font-mono text-[11px] transition-colors duration-300 ${i === active ? 'text-ink' : 'text-faint'}`}
                    >
                      {s.n}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div ref={stepsRef} className="relative space-y-24 lg:space-y-0 lg:pl-12">
            <div className="absolute bottom-0 left-0 top-0 hidden w-px bg-line lg:block">
              <motion.div style={{ scaleY: rail }} className="h-full w-full origin-top bg-ink" />
            </div>
            {STEPS.map((s, i) => (
              <Step key={s.n} step={s} index={i} onActive={setActive} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
