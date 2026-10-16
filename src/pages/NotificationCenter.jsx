/**
 * NotificationCenter Page
 * Full notification list with filtering and pagination
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  Bell,
  BellRing,
  Check,
  CheckCheck,
  CircleCheck,
  Clock,
  Gavel,
  Hourglass,
  Settings2,
  Trash2,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import useNotificationStore from '../store/notificationStore';
import { Alert, Button, EmptyState, Page, PageHeader, Tabs } from '../components/ui';
import { EASE } from '../lib/motion';

const TYPE_META = {
  outbid: { icon: TrendingUp, chip: 'bg-flare-soft text-flare-deep' },
  auction_ending: { icon: Clock, chip: 'bg-gold-soft text-[#8a6410]' },
  auction_won: { icon: Trophy, chip: 'bg-gold-soft text-[#8a6410]' },
  new_bid: { icon: Gavel, chip: 'bg-paper-2 text-ink' },
  item_sold: { icon: CircleCheck, chip: 'bg-moss-soft text-moss' },
  auction_expired: { icon: Hourglass, chip: 'bg-paper-2 text-muted' },
};
const DEFAULT_META = { icon: Bell, chip: 'bg-paper-2 text-ink-2' };

const groupLabel = (dateString) => {
  const d = new Date(dateString);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return 'Earlier';
};

const NotificationCenter = () => {
  const [filter, setFilter] = useState('all'); // all, unread
  const [loading, setLoading] = useState(false);

  const {
    notifications,
    unreadCount,
    hasMore,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotificationStore();

  useEffect(() => {
    loadNotifications(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadNotifications = async (reset = false) => {
    setLoading(true);
    await fetchNotifications({
      limit: 20,
      offset: reset ? 0 : notifications.length,
      unreadOnly: filter === 'unread'
    });
    setLoading(false);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadNotifications(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  const handleMarkRead = async (notification, e) => {
    e.preventDefault();
    e.stopPropagation();
    await markAsRead(notification.id);
  };

  const handleDelete = async (notificationId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm('Delete this notification?')) {
      try {
        await deleteNotification(notificationId);
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    }
  };

  // Group into Today / Yesterday / Earlier, preserving server order
  const groups = notifications.reduce((acc, n) => {
    const label = groupLabel(n.createdAt);
    const group = acc.find((g) => g.label === label);
    if (group) group.items.push(n);
    else acc.push({ label, items: [n] });
    return acc;
  }, []);

  const showSkeleton = loading && notifications.length === 0;

  return (
    <Page width="max-w-3xl">
      <PageHeader
        eyebrow={
          <>
            <BellRing className="size-3.5" /> Inbox
          </>
        }
        title="Notifications"
        description="Outbids, wins and reminders — everything happening across your auctions."
        actions={
          <>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                <CheckCheck className="size-4" />
                Mark all read
              </Button>
            )}
            <Button to="/settings/notifications" variant="ghost" size="sm">
              <Settings2 className="size-4" />
              Settings
            </Button>
          </>
        }
      />

      <Tabs
        layoutId="notif-tabs"
        className="mb-6"
        value={filter}
        onChange={setFilter}
        tabs={[
          { value: 'all', label: 'All' },
          { value: 'unread', label: 'Unread', count: unreadCount > 0 ? unreadCount : undefined },
        ]}
      />

      {error && !loading && notifications.length === 0 ? (
        <Alert tone="danger" icon={AlertCircle} title="Couldn't load notifications" className="items-start">
          <p>{error}</p>
          <button
            onClick={() => loadNotifications(true)}
            className="mt-2 font-semibold underline underline-offset-4 hover:no-underline"
          >
            Try again
          </button>
        </Alert>
      ) : showSkeleton ? (
        <div className="space-y-2.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4 rounded-2xl border border-line bg-card p-4">
              <div className="skeleton size-11 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2.5 pt-1">
                <div className="skeleton h-3.5 w-1/2 rounded" />
                <div className="skeleton h-3 w-5/6 rounded" />
                <div className="skeleton h-3 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={filter === 'unread' ? CheckCheck : Bell}
          title={filter === 'unread' ? "You're all caught up" : 'Nothing here yet'}
          description={
            filter === 'unread'
              ? 'No unread notifications. Check back after your next bid.'
              : 'You will receive notifications about outbids, wins and auctions ending soon.'
          }
          action={
            <Button to="/browse" variant="primary">
              Browse live lots
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="mb-3 px-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                {group.label}
              </h2>
              <motion.ul layout className="space-y-2.5">
                <AnimatePresence initial={false}>
                  {group.items.map((notification, i) => {
                    const meta = TYPE_META[notification.type] || DEFAULT_META;
                    const Icon = meta.icon;
                    const unread = !notification.isRead;
                    return (
                      <motion.li
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE, delay: Math.min(i, 8) * 0.03 } }}
                        exit={{ opacity: 0, x: -24, height: 0, marginTop: 0, transition: { duration: 0.28, ease: EASE } }}
                      >
                        <Link
                          to={notification.itemId ? `/items/${notification.itemId}` : '#'}
                          onClick={() => handleNotificationClick(notification)}
                          className={`group relative flex items-start gap-3 overflow-hidden rounded-2xl border p-4 transition-[box-shadow,border-color,background-color] duration-300 hover:border-line-strong hover:shadow-soft sm:gap-4 ${
                            unread ? 'border-line bg-card' : 'border-line/70 bg-card/60'
                          }`}
                        >
                          {unread && <span className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-flare" aria-hidden />}

                          <span className={`grid size-10 shrink-0 place-items-center rounded-xl sm:size-11 ${meta.chip}`}>
                            <Icon className="size-[18px]" />
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className={`text-[15px] leading-snug text-ink ${unread ? 'font-semibold' : 'font-medium'}`}>
                                {notification.title}
                              </p>
                              <span className="shrink-0 pt-0.5 text-[11px] text-faint">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-muted">{notification.message}</p>
                            {notification.itemTitle && (
                              <p className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-paper-2 px-2.5 py-1 text-[12px] text-ink-2">
                                <Gavel className="size-3 shrink-0" />
                                <span className="truncate">{notification.itemTitle}</span>
                              </p>
                            )}
                          </div>

                          {/* Actions: always visible on touch, revealed on hover for pointer devices */}
                          <div className="flex shrink-0 flex-col gap-1 opacity-100 transition-opacity duration-200 sm:flex-row md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                            {unread && (
                              <button
                                onClick={(e) => handleMarkRead(notification, e)}
                                className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-moss-soft hover:text-moss"
                                title="Mark as read"
                                aria-label="Mark as read"
                              >
                                <Check className="size-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(notification.id, e)}
                              className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                              title="Delete notification"
                              aria-label="Delete notification"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </Link>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </motion.ul>
            </section>
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={handleLoadMore} loading={loading}>
                {loading ? 'Loading' : 'Load more'}
              </Button>
            </div>
          )}
        </div>
      )}
    </Page>
  );
};

export default NotificationCenter;
