import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'motion/react';
import { BellRing, Clock, Heart, ShieldCheck, Zap } from 'lucide-react';
import { EASE } from '../../lib/motion';
import { CountUp, Eyebrow, Reveal, RevealLines, RollingNumber } from './primitives';

const FEATURES = [
  { icon: Zap, title: 'Bids land instantly', body: 'Live sockets push every bid to every watcher. No refreshing, no stale prices.' },
  { icon: BellRing, title: 'Outbid alerts', body: 'Know the second someone tops you, in-app or by email.' },
  { icon: Clock, title: 'Ending-soon nudges', body: 'Reminders before lots you care about close.' },
  { icon: Heart, title: 'Save to watch', body: 'Keep a shortlist and swoop in at the right moment.' },
  { icon: ShieldCheck, title: 'Verified accounts', body: 'Email-verified buyers and rated sellers keep the floor honest.' },
];

const RIVALS = ['maya_k', 'thrift.theo', 'lou_vintage', 'jun_o'];

/** A playable mini-auction: bid against a simulated rival. */
const BidDemo = () => {
  const [price, setPrice] = useState(120);
  const [leader, setLeader] = useState('ada.finds');
  const [history, setHistory] = useState([{ id: 0, who: 'ada.finds', amt: 120 }]);
  const [yourBids, setYourBids] = useState(0);
  const shake = useAnimationControls();
  const timer = useRef(null);
  const rivalIdx = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const push = (who, amt) => {
    setPrice(amt);
    setLeader(who);
    setHistory((h) => [{ id: Date.now() + Math.random(), who, amt }, ...h].slice(0, 4));
  };

  const bid = () => {
    const amt = price + 5;
    push('you', amt);
    setYourBids((n) => n + 1);
    clearTimeout(timer.current);
    // A rival answers most of the time — but not always, so you can win
    if (Math.random() < 0.72) {
      timer.current = setTimeout(() => {
        const rival = RIVALS[rivalIdx.current++ % RIVALS.length];
        push(rival, amt + 3 + Math.floor(Math.random() * 6));
        shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.45 } });
      }, 1400 + Math.random() * 900);
    }
  };

  const winning = leader === 'you';

  return (
    <motion.div animate={shake} className="relative w-full max-w-md rounded-[30px] bg-paper p-2 text-ink shadow-[0_60px_120px_-40px_rgb(0_0_0/0.7)]">
      <div className="flex gap-3 p-2">
        <img src="/img/camera.jpg" alt="Vintage camera lot" className="size-20 rounded-2xl object-cover sm:size-24" />
        <div className="min-w-0 flex-1 py-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-2 py-0.5 text-[10px] font-medium text-paper">
              <span className="size-1.5 rounded-full bg-flare animate-pulse-dot" /> LIVE DEMO
            </span>
          </div>
          <p className="mt-2 truncate font-semibold">Canon AE-1 film camera</p>
          <p className="text-[13px] text-muted">Good · 3 lenses included</p>
        </div>
      </div>

      <div className="mt-1 rounded-[24px] bg-card p-4 sm:p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted">Current bid</p>
            <p className="font-mono text-[2.6rem] font-semibold leading-none sm:text-5xl">
              <RollingNumber value={price} />
            </p>
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={winning ? 'w' : yourBids === 0 ? 'idle' : 'o'}
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              className={`mb-1 rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                winning ? 'bg-moss-soft text-moss' : yourBids === 0 ? 'bg-paper-2 text-ink-2' : 'bg-flare-soft text-flare-deep'
              }`}
            >
              {winning ? 'You’re winning' : yourBids === 0 ? 'Your move' : 'You’ve been outbid'}
            </motion.span>
          </AnimatePresence>
        </div>

        <ul className="mt-5 space-y-1.5" aria-live="polite">
          <AnimatePresence initial={false}>
            {history.map((h, i) => (
              <motion.li
                key={h.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="overflow-hidden"
              >
                <div className={`flex items-center justify-between rounded-xl px-3 py-2 text-[13px] ${i === 0 ? 'bg-paper-2' : ''}`}>
                  <span className="flex items-center gap-2">
                    <span
                      className={`grid size-6 place-items-center rounded-full text-[10px] font-semibold uppercase ${
                        h.who === 'you' ? 'bg-ink text-paper' : 'bg-paper-3 text-ink-2'
                      }`}
                    >
                      {h.who.slice(0, 2)}
                    </span>
                    <span className={h.who === 'you' ? 'font-semibold' : 'text-ink-2'}>{h.who === 'you' ? 'You' : `@${h.who}`}</span>
                  </span>
                  <span className="font-mono">${h.amt}</span>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <motion.button
          onClick={bid}
          whileTap={{ scale: 0.96 }}
          className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-flare text-[15px] font-semibold text-white shadow-flare transition-colors hover:bg-flare-deep"
        >
          Place bid · <span className="font-mono">${price + 5}</span>
        </motion.button>
        <p className="mt-3 text-center text-[12px] text-muted">Go on — try it. Nobody’s actually paying.</p>
      </div>
    </motion.div>
  );
};

const STATS = [
  { to: 24, suffix: 'k+', label: 'Thrifters bidding' },
  { to: 68, suffix: 'k', label: 'Lots given a second life' },
  { to: 1.2, suffix: 'M', decimals: 1, label: 'Bids placed' },
  { to: 4.9, suffix: '★', decimals: 1, label: 'Average seller rating' },
];

const Realtime = () => (
  <section className="relative overflow-hidden bg-ink py-24 text-paper sm:py-32">
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(closest-side,rgb(255_79_26/0.22),transparent)]" />
    </div>
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <div>
          <Eyebrow light>Real-time by default</Eyebrow>
          <RevealLines
            inView
            as="h2"
            className="mt-5 font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.92]"
            lines={['The room moves fast.', <em key="e" className="text-flare">So do you.</em>]}
          />
          <ul className="mt-12 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Reveal as="li" key={f.title} delay={i * 0.06} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper/[0.08] text-paper ring-1 ring-paper/10">
                  <f.icon className="size-[18px]" strokeWidth={1.8} />
                </span>
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-paper/60">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
        <Reveal className="flex justify-center lg:justify-end">
          <BidDemo />
        </Reveal>
      </div>

      <div className="mt-24 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-paper/10 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-ink p-6 sm:p-8">
            <p className="font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-none">
              <CountUp to={s.to} suffix={s.suffix} decimals={s.decimals || 0} />
            </p>
            <p className="mt-3 text-[13px] text-paper/55 sm:text-sm">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Realtime;
