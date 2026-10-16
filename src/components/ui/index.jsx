/**
 * ThriftBid UI kit — the shared primitives every portal page is built from.
 * Keep pages composing these rather than re-styling raw elements.
 */
import { forwardRef, useId } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { EASE, pageTransition } from '../../lib/motion';

const cx = (...c) => c.filter(Boolean).join(' ');

/* ---------------------------------- Logo --------------------------------- */
export const Logo = ({ className = '', light = false, to = '/' }) => (
  <Link to={to} aria-label="ThriftBid home" className={cx('group inline-flex items-center gap-2', className)}>
    <span
      className={cx(
        'relative grid size-8 place-items-center rounded-[10px] transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-rotate-6',
        light ? 'bg-paper text-ink' : 'bg-ink text-paper'
      )}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
        <path d="M5 6.5h14M12 6.5V19" />
      </svg>
      <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-flare ring-2 ring-paper" />
    </span>
    <span className={cx('text-[19px] font-semibold tracking-tight', light ? 'text-paper' : 'text-ink')}>
      Thrift<span className="font-display text-[22px] italic font-normal">Bid</span>
    </span>
  </Link>
);

/* --------------------------------- Button -------------------------------- */
const BTN_BASE =
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium ' +
  'transition-[background-color,color,box-shadow,transform,border-color] duration-200 ease-out ' +
  'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50';

const BTN_VARIANTS = {
  primary: 'bg-ink text-paper hover:bg-ink-2 shadow-[0_1px_0_rgb(255_255_255/0.08)_inset]',
  flare: 'bg-flare text-white hover:bg-flare-deep shadow-flare',
  outline: 'border border-line-strong bg-card text-ink hover:border-ink hover:bg-paper',
  ghost: 'text-ink-2 hover:bg-paper-2 hover:text-ink',
  danger: 'bg-danger text-white hover:bg-[#a92816]',
  'danger-ghost': 'text-danger hover:bg-danger-soft',
  light: 'bg-paper text-ink hover:bg-white',
};

const BTN_SIZES = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-[15px]',
  icon: 'size-10',
  'icon-sm': 'size-8',
};

export const Button = forwardRef(function Button(
  { as, to, href, variant = 'primary', size = 'md', loading = false, block = false, className = '', children, disabled, ...props },
  ref
) {
  const classes = cx(BTN_BASE, BTN_VARIANTS[variant], BTN_SIZES[size], block && 'w-full', className);
  const content = (
    <>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </>
  );
  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }
  const Comp = as || 'button';
  return (
    <Comp ref={ref} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </Comp>
  );
});

/* ---------------------------------- Field -------------------------------- */
/** Label + control + hint/error. Pass a render function to get the generated id. */
export const Field = ({ label, hint, error, children, className = '', optional = false, id: idProp }) => {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
          {optional && <span className="ml-1 font-normal text-faint">(optional)</span>}
        </label>
      )}
      {typeof children === 'function' ? children(id) : children}
      {error ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-[13px] text-danger"
          role="alert"
        >
          {error}
        </motion.p>
      ) : (
        hint && <p className="mt-1.5 text-[13px] text-muted">{hint}</p>
      )}
    </div>
  );
};

export const Input = forwardRef(function Input({ className = '', icon: Icon, ...props }, ref) {
  if (Icon) {
    return (
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-faint" aria-hidden />
        <input ref={ref} className={cx('field-input pl-10', className)} {...props} />
      </div>
    );
  }
  return <input ref={ref} className={cx('field-input', className)} {...props} />;
});

export const Select = forwardRef(function Select({ className = '', children, ...props }, ref) {
  return (
    <select ref={ref} className={cx('field-input', className)} {...props}>
      {children}
    </select>
  );
});

export const Textarea = forwardRef(function Textarea({ className = '', ...props }, ref) {
  return <textarea ref={ref} className={cx('field-input min-h-32 resize-y leading-relaxed', className)} {...props} />;
});

/* ---------------------------------- Card --------------------------------- */
export const Card = ({ as: Comp = 'div', className = '', children, ...props }) => (
  <Comp className={cx('rounded-2xl border border-line bg-card shadow-soft', className)} {...props}>
    {children}
  </Comp>
);

/* ---------------------------------- Badge -------------------------------- */
const BADGE_TONES = {
  neutral: 'bg-paper-2 text-ink-2',
  ink: 'bg-ink text-paper',
  flare: 'bg-flare-soft text-flare-deep',
  moss: 'bg-moss-soft text-moss',
  gold: 'bg-gold-soft text-[#8a6410]',
  danger: 'bg-danger-soft text-danger',
  outline: 'border border-line-strong text-ink-2',
};

export const Badge = ({ tone = 'neutral', className = '', children, dot = false }) => (
  <span
    className={cx(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium leading-none',
      BADGE_TONES[tone],
      className
    )}
  >
    {dot && <span className="size-1.5 rounded-full bg-current" />}
    {children}
  </span>
);

export const LiveDot = ({ className = '' }) => (
  <span className={cx('relative inline-flex size-2 rounded-full bg-flare animate-pulse-dot', className)} aria-hidden />
);

/* -------------------------------- Page chrome ----------------------------- */
export const Page = ({ children, className = '', width = 'max-w-7xl' }) => (
  <motion.main
    {...pageTransition}
    className={cx('mx-auto w-full px-4 pb-28 pt-6 sm:px-6 sm:pt-10 md:pb-16 lg:px-8', width, className)}
  >
    {children}
  </motion.main>
);

export const PageHeader = ({ eyebrow, title, description, actions, className = '' }) => (
  <div className={cx('mb-8 flex flex-col gap-5 sm:mb-10 md:flex-row md:items-end md:justify-between', className)}>
    <div className="min-w-0">
      {eyebrow && (
        <p className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-[40px] leading-[0.95] text-ink sm:text-5xl lg:text-[56px]">{title}</h1>
      {description && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

/* ------------------------------- Segmented tabs --------------------------- */
export const Tabs = ({ tabs, value, onChange, layoutId = 'tabs-pill', className = '' }) => (
  <div
    role="tablist"
    className={cx('no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0', className)}
  >
    <div className="flex gap-1 rounded-full border border-line bg-card p-1 shadow-soft">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cx(
              'relative whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition-colors',
              active ? 'text-paper' : 'text-muted hover:text-ink'
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-ink"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              {tab.label}
              {tab.count != null && (
                <span className={cx('tabular text-[11px]', active ? 'text-paper/60' : 'text-faint')}>{tab.count}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

/* ------------------------------- Feedback states -------------------------- */
export const Spinner = ({ className = '', label }) => (
  <div className={cx('flex flex-col items-center justify-center gap-3 py-16 text-muted', className)} role="status">
    <Loader2 className="size-6 animate-spin text-ink" aria-hidden />
    {label && <p className="text-sm">{label}</p>}
  </div>
);

export const Skeleton = ({ className = '' }) => <div className={cx('skeleton rounded-xl', className)} />;

export const EmptyState = ({ icon: Icon, title, description, action, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: EASE }}
    className={cx(
      'flex flex-col items-center rounded-3xl border border-dashed border-line-strong bg-card/60 px-6 py-16 text-center sm:py-20',
      className
    )}
  >
    {Icon && (
      <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-paper-2 text-ink-2">
        <Icon className="size-6" strokeWidth={1.6} />
      </div>
    )}
    <h3 className="font-display text-3xl text-ink">{title}</h3>
    {description && <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </motion.div>
);

export const Alert = ({ tone = 'danger', title, children, className = '', icon: Icon }) => {
  const tones = {
    danger: 'border-danger/20 bg-danger-soft text-danger',
    moss: 'border-moss/15 bg-moss-soft text-moss',
    gold: 'border-gold/30 bg-gold-soft text-[#7a5a0e]',
    neutral: 'border-line bg-paper-2 text-ink-2',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cx('flex gap-3 rounded-2xl border px-4 py-3.5 text-sm', tones[tone], className)}
    >
      {Icon && <Icon className="mt-0.5 size-4 shrink-0" />}
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-0.5 opacity-90' : ''}>{children}</div>}
      </div>
    </motion.div>
  );
};

/* ---------------------------------- Avatar -------------------------------- */
export const Avatar = ({ name = '', src, size = 'md', className = '' }) => {
  const sizes = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-16 text-xl', xl: 'size-24 text-3xl' };
  const initials = (name || '?')
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');
  return src ? (
    <img src={src} alt={name} className={cx('rounded-full object-cover', sizes[size], className)} />
  ) : (
    <span
      className={cx(
        'inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-flare to-[#ff9a3c] font-semibold text-white',
        sizes[size],
        className
      )}
      aria-hidden
    >
      {initials || '?'}
    </span>
  );
};

/* ----------------------------------- Stat --------------------------------- */
export const Stat = ({ label, value, hint, icon: Icon, className = '' }) => (
  <Card className={cx('p-5', className)}>
    <div className="flex items-center justify-between text-muted">
      <span className="text-[13px]">{label}</span>
      {Icon && <Icon className="size-4" />}
    </div>
    <p className="tabular mt-3 font-display text-4xl leading-none text-ink">{value}</p>
    {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
  </Card>
);
