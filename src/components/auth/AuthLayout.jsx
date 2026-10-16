/**
 * Split-screen shell for the chromeless auth routes, plus small
 * auth-only helpers (heading, password input, animated success check).
 */
import { forwardRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowUpRight, Eye, EyeOff, Lock } from 'lucide-react';
import { LiveDot, Logo } from '../ui';
import { EASE, fadeUp, stagger } from '../../lib/motion';

const PhotoPanel = ({ image, quote, attribution }) => (
  <aside className="relative hidden lg:block lg:w-[46%] xl:w-1/2">
    <div className="sticky top-0 h-screen p-3">
      <motion.div
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: EASE }}
        className="grain relative size-full overflow-hidden rounded-3xl bg-ink"
      >
        <motion.img
          src={image}
          alt=""
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: EASE }}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />

        {/* Floating live lot */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
          className="absolute right-8 top-10 xl:right-12 xl:top-14"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="flex w-64 items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-2.5 pr-4 text-paper shadow-lift backdrop-blur-xl"
          >
            <img src="/img/leather-jacket.jpg" alt="" className="size-14 rounded-xl object-cover" />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-paper/70">
                <LiveDot /> Live lot
              </p>
              <p className="mt-1 truncate text-sm font-medium">Leather moto jacket</p>
              <p className="tabular font-mono text-[13px] text-paper/80">
                $142.00 <span className="text-paper/50">· 9 bids</span>
              </p>
            </div>
          </motion.div>
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          >
            <p className="font-display text-4xl italic leading-[1.05] text-paper xl:text-5xl">“{quote}”</p>
            <footer className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-paper/60">
              {attribution}
            </footer>
          </motion.blockquote>
        </div>
      </motion.div>
    </div>
  </aside>
);

const AuthLayout = ({
  children,
  image = '/img/rack-florals.jpg',
  quote = 'Every thing has a second story. Ours started with a $12 jacket.',
  attribution = 'Maya R. — thrifter since 2023',
}) => (
  <div className="flex min-h-screen bg-paper">
    <div className="flex min-h-screen flex-1 flex-col px-5 py-5 sm:px-8 sm:py-6 lg:px-12">
      <header className="flex items-center justify-between">
        <Logo />
        <Link
          to="/browse"
          className="group inline-flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-medium text-muted transition-colors hover:bg-paper-2 hover:text-ink"
        >
          Browse lots
          <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center py-10 sm:py-14">
        <motion.div variants={stagger(0.07, 0.05)} initial="hidden" animate="show" className="w-full max-w-[400px]">
          {children}
        </motion.div>
      </main>

      <footer className="flex flex-col gap-1 text-[12px] text-faint sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} ThriftBid. Pre-loved, re-loved.</p>
        <p>Protected by encrypted sessions.</p>
      </footer>
    </div>
    <PhotoPanel image={image} quote={quote} attribution={attribution} />
  </div>
);

/** Animated child of the AuthLayout stagger. */
export const AuthItem = ({ children, className = '' }) => (
  <motion.div variants={fadeUp} className={className}>
    {children}
  </motion.div>
);

export const AuthHeading = ({ eyebrow, title, description }) => (
  <AuthItem className="mb-8">
    {eyebrow && (
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
    )}
    <h1 className="font-display text-[44px] leading-[0.95] text-ink sm:text-5xl">{title}</h1>
    {description && <p className="mt-3 text-[15px] leading-relaxed text-muted">{description}</p>}
  </AuthItem>
);

export const PasswordInput = forwardRef(function PasswordInput({ className = '', ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-faint" aria-hidden />
      <input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={`field-input h-12 pl-10 pr-12 ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted transition-colors hover:bg-paper-2 hover:text-ink"
      >
        {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
      </button>
    </div>
  );
});

/** Drawn-on checkmark in a moss disc. */
export const SuccessCheck = ({ tone = 'moss' }) => (
  <motion.div
    initial={{ scale: 0.6, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
    className={`mb-6 grid size-16 place-items-center rounded-full ${
      tone === 'moss' ? 'bg-moss-soft text-moss' : 'bg-danger-soft text-danger'
    }`}
  >
    <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      {tone === 'moss' ? (
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.55, delay: 0.2, ease: EASE }}
        />
      ) : (
        <motion.path
          d="M7 7l10 10M17 7L7 17"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
        />
      )}
    </svg>
  </motion.div>
);

export const AuthFootnote = ({ children }) => (
  <AuthItem className="mt-8 text-center text-sm text-muted">{children}</AuthItem>
);

export const InlineLink = ({ to, children }) => (
  <Link to={to} className="font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-flare">
    {children}
  </Link>
);

export default AuthLayout;
