import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  BadgeCheck,
  Bell,
  CalendarDays,
  ChevronRight,
  Gavel,
  Heart,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Star,
  Store,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import authService from '../services/authService';
import { Alert, Avatar, Badge, Button, Card, Field, Input, Page, Spinner, Textarea } from '../components/ui';
import { EASE } from '../lib/motion';

const QUICK_LINKS = [
  { to: '/my-listings', label: 'Selling', hint: 'Your listings & bids received', icon: Store },
  { to: '/my-bids', label: 'My bids', hint: 'Lots you are bidding on', icon: Gavel },
  { to: '/favorites', label: 'Saved', hint: 'Your watchlist', icon: Heart },
  { to: '/settings/notifications', label: 'Notification settings', hint: 'Outbid, ending-soon & email alerts', icon: Bell },
];

const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3 py-3.5">
    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-paper-2 text-muted">
      <Icon className="size-4" />
    </span>
    <div className="min-w-0">
      <p className="text-[12px] uppercase tracking-wider text-faint">{label}</p>
      <div className="mt-0.5 break-words text-[15px] text-ink">{children}</div>
    </div>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    profile_picture_url: user?.profile_picture_url || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        bio: user.bio || '',
        location: user.location || '',
        profile_picture_url: user.profile_picture_url || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await authService.updateProfile(formData);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if API call fails
      navigate('/login');
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      bio: user?.bio || '',
      location: user?.location || '',
      profile_picture_url: user?.profile_picture_url || '',
    });
    setIsEditing(false);
    setError('');
    setSuccessMessage('');
  };

  if (!user) {
    return <Spinner className="min-h-[60vh]" label="Loading profile..." />;
  }

  const displayName = user.full_name || user.username;
  const rating = user.seller_rating ? Number(user.seller_rating) : 0;
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <Page width="max-w-6xl">
      {/* Identity header */}
      <Card className="relative mb-6 overflow-hidden">
        <div className="grain relative h-28 bg-gradient-to-br from-ink via-ink-2 to-moss sm:h-36">
          <div className="absolute -right-10 -top-16 size-56 rounded-full bg-flare/30 blur-3xl" />
        </div>
        <div className="px-5 pb-6 sm:px-8">
          <div className="relative -mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Avatar
                name={displayName}
                src={user.profile_picture_url || undefined}
                size="xl"
                className="ring-4 ring-card"
              />
              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-4xl leading-none text-ink sm:text-5xl">{displayName}</h1>
                  {user.email_verified_at ? (
                    <Badge tone="moss">
                      <BadgeCheck className="size-3.5" /> Verified
                    </Badge>
                  ) : (
                    <Badge tone="gold">Unverified</Badge>
                  )}
                </div>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                  <span>@{user.username}</span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-3.5 fill-gold text-gold" />
                    <span className="tabular font-medium text-ink">{rating.toFixed(1)}</span> seller rating
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing && (
                <Button variant="primary" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil className="size-3.5" /> Edit profile
                </Button>
              )}
              <Button variant="danger-ghost" size="sm" onClick={handleLogout}>
                <LogOut className="size-3.5" /> Log out
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {error && <Alert tone="danger">{error}</Alert>}
        {successMessage && <Alert tone="moss" icon={BadgeCheck}>{successMessage}</Alert>}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="p-5 sm:p-8">
          <AnimatePresence mode="wait" initial={false}>
            {!isEditing ? (
              <motion.div
                key="view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <h2 className="font-display text-3xl text-ink">About</h2>
                <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-2">
                  {user.bio || <span className="text-muted">No bio added yet. Tell buyers what you collect and sell.</span>}
                </p>
                <div className="mt-6 divide-y divide-line border-t border-line">
                  <InfoRow icon={Mail} label="Email">
                    {user.email}
                  </InfoRow>
                  <InfoRow icon={MapPin} label="Location">
                    {user.location || <span className="text-muted">Not specified</span>}
                  </InfoRow>
                  <InfoRow icon={Star} label="Seller rating">
                    <span className="tabular font-mono font-semibold">{rating.toFixed(1)}</span>
                    <span className="text-muted"> / 5.0</span>
                  </InfoRow>
                  <InfoRow icon={CalendarDays} label="Member since">
                    {memberSince}
                  </InfoRow>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="edit"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="space-y-5"
              >
                <div>
                  <h2 className="font-display text-3xl text-ink">Edit profile</h2>
                  <p className="mt-1 text-sm text-muted">This is how buyers and sellers will see you.</p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" id="full_name">
                    <Input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} />
                  </Field>
                  <Field label="Location" id="location" optional>
                    <Input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, State"
                      icon={MapPin}
                    />
                  </Field>
                </div>

                <Field label="Bio" id="bio" hint={`${formData.bio.length} / 500 characters`} optional>
                  <Textarea
                    id="bio"
                    name="bio"
                    rows="4"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    maxLength="500"
                  />
                </Field>

                <Field label="Profile picture URL" id="profile_picture_url" optional>
                  <Input
                    type="url"
                    id="profile_picture_url"
                    name="profile_picture_url"
                    value={formData.profile_picture_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </Field>

                <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
                  <Button type="button" variant="ghost" onClick={handleCancel} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={isLoading}>
                    {isLoading ? 'Saving...' : 'Save changes'}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </Card>

        <aside className="space-y-3">
          <p className="px-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Shortcuts</p>
          <Card className="divide-y divide-line overflow-hidden">
            {QUICK_LINKS.map(({ to, label, hint, icon: Icon }) => (
              <Link key={to} to={to} className="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-paper">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper-2 text-ink-2 transition-colors group-hover:bg-ink group-hover:text-paper">
                  <Icon className="size-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">{label}</span>
                  <span className="block truncate text-[13px] text-muted">{hint}</span>
                </span>
                <ChevronRight className="size-4 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
              </Link>
            ))}
          </Card>
        </aside>
      </div>
    </Page>
  );
};

export default Profile;
