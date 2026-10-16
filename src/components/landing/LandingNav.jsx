import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { Button, Logo } from '../ui';
import { EASE } from '../../lib/motion';

const LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#live', label: 'Live lots' },
  { href: '#categories', label: 'Categories' },
  { href: '#sell', label: 'Sell' },
  { href: '#faq', label: 'FAQ' },
];

const LandingNav = ({ onNavigate, onMenuToggle }) => {
  const { isAuthenticated } = useAuthStore();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 24);
    setHidden(y > 240 && y > prev + 2 && !open);
  });

  useEffect(() => {
    onMenuToggle?.(open);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onMenuToggle]);

  const go = (e, href) => {
    e.preventDefault();
    setOpen(false);
    // Let the menu close before scrolling so the target position is stable
    setTimeout(() => onNavigate(href), open ? 350 : 0);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden ? -110 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4"
      >
        <nav
          aria-label="Main"
          className={`mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full pl-4 pr-2 transition-[background-color,box-shadow,border-color] duration-500 sm:pl-5 ${
            solid || open
              ? 'border border-line/80 bg-paper/75 shadow-[0_8px_30px_-12px_rgb(23_20_15/0.25)] backdrop-blur-xl'
              : 'border border-transparent'
          }`}
        >
          <Logo />
          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={(e) => go(e, l.href)}
                  className="group relative rounded-full px-3.5 py-2 text-sm text-ink-2 transition-colors hover:text-ink"
                >
                  {l.label}
                  <span className="absolute inset-x-3.5 bottom-1.5 h-px origin-left scale-x-0 bg-ink transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-1.5">
            {isAuthenticated ? (
              <Button to="/browse" size="sm" className="max-sm:hidden">
                Open portal <ArrowUpRight className="size-4" />
              </Button>
            ) : (
              <>
                <Button to="/login" variant="ghost" size="sm" className="max-sm:hidden">
                  Log in
                </Button>
                <Button to="/register" size="sm" className="max-sm:hidden">
                  Start bidding
                </Button>
              </>
            )}
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="grid size-10 place-items-center rounded-full bg-ink text-paper transition-transform active:scale-90 lg:hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={open ? 'x' : 'm'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {open ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-ink px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-28 text-paper lg:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 44px) 44px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 44px) 44px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 44px) 44px)' }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <ul className="flex flex-col gap-1">
              {LINKS.map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <motion.a
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.05 }}
                    className="flex items-baseline justify-between border-b border-paper/10 py-3 font-display text-[clamp(2.4rem,11vw,3.5rem)] leading-none"
                  >
                    {l.label}
                    <span className="font-mono text-xs text-paper/40">0{i + 1}</span>
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div
              className="mt-auto grid gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.45, duration: 0.5, ease: EASE }}
            >
              {isAuthenticated ? (
                <Button to="/browse" variant="flare" size="lg" block>
                  Open portal
                </Button>
              ) : (
                <>
                  <Button to="/register" variant="flare" size="lg" block>
                    Start bidding — it’s free
                  </Button>
                  <Link to="/login" className="py-2 text-center text-sm text-paper/70">
                    Already have an account? <span className="text-paper underline underline-offset-4">Log in</span>
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingNav;
