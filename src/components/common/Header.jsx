import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bell,
  ChevronDown,
  Compass,
  Gavel,
  Heart,
  LogOut,
  Plus,
  Settings,
  Store,
  User,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import authService from '../../services/authService';
import NotificationBell from '../notifications/NotificationBell';
import { Avatar, Button, Logo } from '../ui';
import { EASE } from '../../lib/motion';

const NAV = [
  { to: '/browse', label: 'Browse', icon: Compass, public: true },
  { to: '/my-bids', label: 'My bids', icon: Gavel },
  { to: '/my-listings', label: 'Selling', icon: Store },
  { to: '/favorites', label: 'Saved', icon: Heart },
];

const UserMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const items = [
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/settings/notifications', label: 'Preferences', icon: Settings },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full p-1 pr-2 transition-colors hover:bg-paper-2"
      >
        <Avatar name={user?.full_name || user?.username} src={user?.profile_picture_url} size="sm" />
        <ChevronDown className={`size-3.5 text-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: EASE }}
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-card p-1.5 shadow-lift"
          >
            <div className="flex items-center gap-3 px-3 pb-3 pt-2.5">
              <Avatar name={user?.full_name || user?.username} src={user?.profile_picture_url} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{user?.full_name || user?.username}</p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </div>
            </div>
            <div className="my-1 h-px bg-line" />
            {items.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-2 transition-colors hover:bg-paper hover:text-ink"
              >
                <Icon className="size-4 text-muted" />
                {label}
              </Link>
            ))}
            <div className="my-1 h-px bg-line" />
            <button
              role="menuitem"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger-soft"
            >
              <LogOut className="size-4" />
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MobileTabBar = () => {
  const tabs = [
    { to: '/browse', label: 'Browse', icon: Compass },
    { to: '/my-bids', label: 'Bids', icon: Gavel },
    { to: '/create-listing', label: 'Sell', icon: Plus, primary: true },
    { to: '/favorites', label: 'Saved', icon: Heart },
    { to: '/profile', label: 'Me', icon: User },
  ];
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/85 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 px-2">
        {tabs.map(({ to, label, icon: Icon, primary }) => (
          <li key={to}>
            <NavLink to={to} className="group relative flex flex-col items-center gap-1 py-2.5">
              {({ isActive }) =>
                primary ? (
                  <>
                    <span className="-mt-6 grid size-12 place-items-center rounded-2xl bg-flare text-white shadow-flare ring-4 ring-paper transition-transform group-active:scale-90">
                      <Icon className="size-5" strokeWidth={2.4} />
                    </span>
                    <span className="text-[10px] font-medium text-ink">{label}</span>
                  </>
                ) : (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="tabbar-indicator"
                        className="absolute top-0 h-0.5 w-8 rounded-full bg-ink"
                        transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                      />
                    )}
                    <Icon
                      className={`size-[22px] transition-colors ${isActive ? 'text-ink' : 'text-faint'}`}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    <span className={`text-[10px] font-medium ${isActive ? 'text-ink' : 'text-faint'}`}>{label}</span>
                  </>
                )
              }
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    navigate('/login');
  };

  const links = NAV.filter((n) => n.public || isAuthenticated);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled ? 'border-b border-line bg-paper/80 backdrop-blur-xl' : 'border-b border-transparent bg-paper'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Logo />
            <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
              {links.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                      isActive ? 'text-ink' : 'text-muted hover:text-ink'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full bg-paper-2"
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        />
                      )}
                      <span className="relative">{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {isAuthenticated ? (
              <>
                <Button to="/create-listing" variant="flare" size="sm" className="max-md:hidden">
                  <Plus className="size-4" strokeWidth={2.4} />
                  Sell an item
                </Button>
                <NotificationBell />
                <div className="hidden md:block">
                  <UserMenu user={user} onLogout={handleLogout} />
                </div>
                <button
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-paper-2 hover:text-ink md:hidden"
                >
                  <LogOut className="size-[18px]" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/browse"
                  className="rounded-full px-3 py-2 text-sm font-medium text-muted hover:text-ink md:hidden"
                >
                  Browse
                </Link>
                <Button to="/login" variant="ghost" size="sm">
                  Log in
                </Button>
                <Button to="/register" variant="primary" size="sm">
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      {isAuthenticated && <MobileTabBar />}
    </>
  );
};

export default Header;
