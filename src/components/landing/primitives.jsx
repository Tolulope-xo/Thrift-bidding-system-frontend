import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useMotionValue, useSpring, animate } from 'motion/react';
import { EASE } from '../../lib/motion';

/** Splits text into lines, each line sliding up out of a mask. */
export const RevealLines = ({ lines, className = '', lineClassName = '', delay = 0, stagger = 0.09, as: Tag = 'h1', inView = false }) => {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: '-10% 0px' });
  const show = inView ? seen : true;
  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className={`block overflow-hidden pb-[0.08em] -mb-[0.08em] ${lineClassName}`}>
          <motion.span
            className="block will-change-transform"
            initial={{ y: '110%', rotate: 2 }}
            animate={show ? { y: '0%', rotate: 0 } : undefined}
            transition={{ duration: 1.1, ease: EASE, delay: delay + i * stagger }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
};

/** Fade/slide in when scrolled into view. */
export const Reveal = ({ children, delay = 0, y = 24, className = '', as = 'div' }) => {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
};

/** Price display where each digit rolls vertically when it changes. */
export const RollingNumber = ({ value, prefix = '$', decimals = 0, className = '' }) => {
  const text = Number(value).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const chars = (prefix + text).split('');
  return (
    <span className={`tabular inline-flex overflow-hidden ${className}`} aria-label={prefix + text}>
      {chars.map((ch, i) => {
        const key = `${chars.length - i}`; // anchor from the right so digits keep identity as the number grows
        return /\d/.test(ch) ? (
          <span key={key} className="relative inline-block" aria-hidden>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={ch}
                className="inline-block"
                initial={{ y: '-100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                {ch}
              </motion.span>
            </AnimatePresence>
          </span>
        ) : (
          <span key={key} aria-hidden>
            {ch}
          </span>
        );
      })}
    </span>
  );
};

/** Counts up from 0 once the element enters view. */
export const CountUp = ({ to, suffix = '', prefix = '', decimals = 0, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 2, ease: EASE, onUpdate: (v) => setDisplay(v) });
    return () => controls.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className={`tabular ${className}`}>
      {prefix}
      {display.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
};

const pad = (n) => String(n).padStart(2, '0');

/** hh:mm:ss ticking countdown for showcase lots. */
export const LiveTimer = ({ end, className = '' }) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.max(0, Math.floor((new Date(end).getTime() - now) / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const urgent = s < 3600;
  return (
    <span className={`tabular font-mono ${urgent ? 'text-flare' : ''} ${className}`}>
      {s === 0 ? 'Ended' : h >= 24 ? `${Math.floor(h / 24)}d ${pad(h % 24)}h` : `${pad(h)}:${pad(m)}:${pad(s % 60)}`}
    </span>
  );
};

/** Pulls its child gently toward the pointer. Disabled on touch devices. */
export const Magnetic = ({ children, strength = 0.25, className = '' }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };
  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }} onPointerMove={onMove} onPointerLeave={reset} className={`inline-block ${className}`}>
      {children}
    </motion.div>
  );
};

export const Eyebrow = ({ children, className = '', light = false }) => (
  <p
    className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] ${
      light ? 'text-paper/60' : 'text-muted'
    } ${className}`}
  >
    <span className={`h-px w-6 ${light ? 'bg-paper/40' : 'bg-ink/30'}`} />
    {children}
  </p>
);
