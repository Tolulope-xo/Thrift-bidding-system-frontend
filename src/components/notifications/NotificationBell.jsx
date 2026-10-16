/**
 * NotificationBell Component
 * Displays notification icon with badge and dropdown
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion, useAnimationControls } from 'motion/react';
import { Bell, BellOff, CheckCheck, CircleCheck, Clock, Gavel, Hourglass, TrendingUp, Trophy, ArrowRight } from 'lucide-react';
import useNotificationStore from '../../store/notificationStore';
import useAuthStore from '../../store/authStore';
import { EASE } from '../../lib/motion';

const TYPE_META = {
  outbid: { icon: TrendingUp, chip: 'bg-flare-soft text-flare-deep' },
  auction_ending: { icon: Clock, chip: 'bg-gold-soft text-[#8a6410]' },
  auction_won: { icon: Trophy, chip: 'bg-gold-soft text-[#8a6410]' },
  new_bid: { icon: Gavel, chip: 'bg-paper-2 text-ink' },
  item_sold: { icon: CircleCheck, chip: 'bg-moss-soft text-moss' },
  auction_expired: { icon: Hourglass, chip: 'bg-paper-2 text-muted' },
};
const DEFAULT_META = { icon: Bell, chip: 'bg-paper-2 text-ink-2' };

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const bellControls = useAnimationControls();
  const prevCount = useRef(0);

  const { isAuthenticated } = useAuthStore();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead
  } = useNotificationStore();

  // Fetch initial data
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      fetchNotifications({ limit: 5 });
    }
  }, [isAuthenticated, fetchUnreadCount, fetchNotifications]);

  // Wiggle the bell whenever the unread count goes up
  useEffect(() => {
    if (unreadCount > prevCount.current) {
      bellControls.start({
        rotate: [0, -16, 14, -10, 6, 0],
        transition: { duration: 0.7, ease: 'easeInOut' },
      });
    }
    prevCount.current = unreadCount;
  }, [unreadCount, bellControls]);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  // Don't show if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Refresh notifications when opening
      fetchNotifications({ limit: 5 });
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={handleToggle}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`relative grid size-10 place-items-center rounded-full transition-colors hover:bg-paper-2 hover:text-ink ${
          isOpen ? 'bg-paper-2 text-ink' : 'text-muted'
        }`}
      >
        <motion.span animate={bellControls} style={{ transformOrigin: '50% 10%' }} className="grid place-items-center">
          <Bell className="size-[19px]" />
        </motion.span>

        {/* Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key={unreadCount}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 18 }}
              className="tabular absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-flare px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-paper"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE }}
            style={{ transformOrigin: 'top right' }}
            className="fixed inset-x-3 top-[68px] z-50 overflow-hidden rounded-2xl border border-line bg-card shadow-lift sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[min(380px,calc(100vw-24px))]"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-ink">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="tabular rounded-full bg-flare-soft px-2 py-0.5 text-[11px] font-medium text-flare-deep">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-paper-2 hover:text-ink"
                >
                  <CheckCheck className="size-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[min(420px,60vh)] overflow-y-auto overscroll-contain">
              {loading && notifications.length === 0 ? (
                <div className="space-y-1 p-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex gap-3 p-2.5">
                      <div className="skeleton size-9 shrink-0 rounded-xl" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="skeleton h-3 w-2/3 rounded" />
                        <div className="skeleton h-3 w-full rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-10 text-center">
                  <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-paper-2 text-muted">
                    <BellOff className="size-5" strokeWidth={1.7} />
                  </div>
                  <p className="font-display text-2xl text-ink">All quiet</p>
                  <p className="mt-1 text-[13px] text-muted">Bids, wins and reminders will land here.</p>
                </div>
              ) : (
                <ul className="p-1.5">
                  {notifications.slice(0, 5).map((notification, i) => {
                    const meta = TYPE_META[notification.type] || DEFAULT_META;
                    const Icon = meta.icon;
                    return (
                      <motion.li
                        key={notification.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: EASE, delay: i * 0.035 }}
                      >
                        <Link
                          to={notification.itemId ? `/items/${notification.itemId}` : '/notifications'}
                          onClick={() => handleNotificationClick(notification)}
                          className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-paper"
                        >
                          <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${meta.chip}`}>
                            <Icon className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={`text-[13px] leading-snug text-ink ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}>
                              {notification.title}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-muted">
                              {notification.message}
                            </p>
                            <p className="mt-1 text-[11px] text-faint">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-flare" aria-label="Unread" />
                          )}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-line p-1.5">
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-paper"
                >
                  View all notifications
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
