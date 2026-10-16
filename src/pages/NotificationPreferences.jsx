/**
 * NotificationPreferences Page
 * Manage notification settings
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  BellRing,
  CircleCheck,
  Clock,
  Gavel,
  Hourglass,
  Mail,
  MonitorSmartphone,
  Sparkles,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import useNotificationStore from '../store/notificationStore';
import { Alert, Badge, Button, Card, Page, PageHeader, Skeleton } from '../components/ui';
import { EASE } from '../lib/motion';

const EMAIL_ROWS = [
  {
    group: 'As a bidder',
    rows: [
      { name: 'email_on_outbid', icon: TrendingUp, label: "When I'm outbid", desc: "Someone places a higher bid on an item you're bidding on." },
      { name: 'email_on_auction_ending', icon: Clock, label: 'Auction ending soon', desc: "A reminder 1 hour before an auction you're bidding on ends." },
      { name: 'email_on_auction_won', icon: Trophy, label: 'When I win an auction', desc: 'The hammer falls and the lot is yours.' },
    ],
  },
  {
    group: 'As a seller',
    rows: [
      { name: 'email_on_new_bid', icon: Gavel, label: 'New bid on my item', desc: 'Someone bids on one of your listings.' },
      { name: 'email_on_auction_expired', icon: Hourglass, label: 'When my auction ends', desc: 'Your auction closes — sold or expired.' },
    ],
  },
  {
    group: 'Discovery',
    rows: [
      { name: 'email_on_new_item', icon: Sparkles, label: 'New items listed', desc: 'New items that match your interests.', soon: true },
    ],
  },
];

const KEYS = [
  'email_on_outbid',
  'email_on_auction_ending',
  'email_on_auction_won',
  'email_on_new_bid',
  'email_on_new_item',
  'email_on_auction_expired',
  'in_app_notifications_enabled',
];

const Switch = ({ id, checked, onChange, labelledBy, describedBy }) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={checked}
    aria-labelledby={labelledBy}
    aria-describedby={describedBy}
    onClick={onChange}
    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors duration-300 ${
      checked ? 'bg-ink' : 'bg-paper-3 hover:bg-line-strong'
    }`}
  >
    <motion.span
      layout
      transition={{ type: 'spring', stiffness: 700, damping: 32 }}
      className={`grid size-6 place-items-center rounded-full bg-card shadow-[0_1px_3px_rgb(23_20_15/0.25)] ${
        checked ? 'ml-auto' : ''
      }`}
    >
      <motion.span
        initial={false}
        animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
        className="size-1.5 rounded-full bg-flare"
      />
    </motion.span>
  </button>
);

const PrefRow = ({ name, icon: Icon, label, desc, soon, checked, onToggle }) => (
  <div className="flex items-start gap-3.5 px-5 py-4 sm:gap-4 sm:px-6">
    <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-paper-2 text-ink-2">
      <Icon className="size-4" />
    </span>
    <div className="min-w-0 flex-1 cursor-pointer" onClick={onToggle}>
      <p id={`${name}-label`} className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-ink">
        {label}
        {soon && <Badge tone="gold">Coming soon</Badge>}
      </p>
      <p id={`${name}-desc`} className="mt-0.5 text-[13px] leading-relaxed text-muted">
        {desc}
      </p>
    </div>
    <Switch
      id={name}
      checked={checked}
      onChange={onToggle}
      labelledBy={`${name}-label`}
      describedBy={`${name}-desc`}
    />
  </div>
);

const NotificationPreferences = () => {
  const {
    preferences,
    preferencesLoading,
    fetchPreferences,
    updatePreferences
  } = useNotificationStore();

  const [formData, setFormData] = useState({
    email_on_outbid: true,
    email_on_auction_ending: true,
    email_on_auction_won: true,
    email_on_new_bid: false,
    email_on_new_item: false,
    email_on_auction_expired: true,
    in_app_notifications_enabled: true
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [attempted, setAttempted] = useState(false);

  const loadPreferences = () => {
    setAttempted(false);
    fetchPreferences().finally(() => setAttempted(true));
  };

  useEffect(() => {
    fetchPreferences().finally(() => setAttempted(true));
  }, [fetchPreferences]);

  useEffect(() => {
    if (preferences) {
      setFormData({
        email_on_outbid: preferences.email_on_outbid,
        email_on_auction_ending: preferences.email_on_auction_ending,
        email_on_auction_won: preferences.email_on_auction_won,
        email_on_new_bid: preferences.email_on_new_bid,
        email_on_new_item: preferences.email_on_new_item,
        email_on_auction_expired: preferences.email_on_auction_expired,
        in_app_notifications_enabled: preferences.in_app_notifications_enabled
      });
    }
  }, [preferences]);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked
    }));
  };

  const toggle = (name) => handleChange({ target: { name, checked: !formData[name] } });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await updatePreferences(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const dirty = preferences ? KEYS.some((k) => Boolean(preferences[k]) !== Boolean(formData[k])) : false;
  const loadFailed = attempted && !preferencesLoading && !preferences;

  const header = (
    <>
      <Link
        to="/notifications"
        className="group mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Notifications
      </Link>
      <PageHeader
        eyebrow={
          <>
            <BellRing className="size-3.5" /> Settings
          </>
        }
        title="Notification settings"
        description="Choose what reaches you, and where. Changes apply to every auction you're part of."
      />
    </>
  );

  if (preferencesLoading && !preferences) {
    return (
      <Page width="max-w-3xl">
        {header}
        <div className="space-y-5">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </Page>
    );
  }

  return (
    <Page width="max-w-3xl">
      {header}

      {loadFailed && (
        <Alert tone="danger" icon={AlertCircle} title="Couldn't load your saved settings" className="mb-6">
          <p>Showing defaults. Your changes may not reflect what's saved.</p>
          <button
            type="button"
            onClick={loadPreferences}
            className="mt-2 font-semibold underline underline-offset-4 hover:no-underline"
          >
            Try again
          </button>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* In-App Notifications */}
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-line px-5 py-4 sm:px-6">
            <MonitorSmartphone className="size-4 text-muted" />
            <h2 className="text-sm font-semibold text-ink">In-app</h2>
          </div>
          <PrefRow
            name="in_app_notifications_enabled"
            icon={BellRing}
            label="Enable in-app notifications"
            desc="Show alerts in ThriftBid while you're logged in."
            checked={formData.in_app_notifications_enabled}
            onToggle={() => toggle('in_app_notifications_enabled')}
          />
        </Card>

        {/* Email Notifications */}
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-line px-5 py-4 sm:px-6">
            <Mail className="size-4 text-muted" />
            <h2 className="text-sm font-semibold text-ink">Email</h2>
          </div>
          {EMAIL_ROWS.map((section, si) => (
            <div key={section.group} className={si > 0 ? 'border-t border-line' : ''}>
              <p className="px-5 pt-4 font-mono text-[10.5px] uppercase tracking-[0.18em] text-faint sm:px-6">
                {section.group}
              </p>
              <div className="divide-y divide-line/70">
                {section.rows.map((row) => (
                  <PrefRow key={row.name} {...row} checked={formData[row.name]} onToggle={() => toggle(row.name)} />
                ))}
              </div>
            </div>
          ))}
        </Card>

        {/* Sticky save bar */}
        <div className="sticky bottom-[calc(80px+env(safe-area-inset-bottom))] z-30 md:bottom-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
            className="flex items-center justify-between gap-3 rounded-full border border-line bg-card/90 py-2 pl-5 pr-2 shadow-lift backdrop-blur-xl"
          >
            <div className="min-w-0 text-[13px]" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                {error ? (
                  <motion.p key="err" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-1.5 truncate text-danger">
                    <AlertCircle className="size-4 shrink-0" />
                    <span className="truncate">{error}</span>
                  </motion.p>
                ) : success ? (
                  <motion.p key="ok" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-1.5 text-moss">
                    <CircleCheck className="size-4 shrink-0" />
                    Preferences saved
                  </motion.p>
                ) : dirty ? (
                  <motion.p key="dirty" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-2 text-ink-2">
                    <span className="size-1.5 rounded-full bg-flare" />
                    Unsaved changes
                  </motion.p>
                ) : (
                  <motion.p key="idle" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="truncate text-muted">
                    {preferences ? 'All changes saved' : 'Using default settings'}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <Button type="submit" variant={dirty ? 'flare' : 'primary'} loading={saving} className="shrink-0">
              {saving ? 'Saving' : 'Save preferences'}
            </Button>
          </motion.div>
        </div>
      </form>
    </Page>
  );
};

export default NotificationPreferences;
