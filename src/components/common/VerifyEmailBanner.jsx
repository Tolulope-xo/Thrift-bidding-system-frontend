import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import authService from '../../services/authService';
import { Button } from '../ui';

/**
 * Persistent banner shown to logged-in users whose email is not yet
 * verified. Renders nothing for guests and for already-verified users.
 */
const VerifyEmailBanner = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [sending, setSending] = useState(false);

  if (!isAuthenticated || !user || user.email_verified_at) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    try {
      await authService.resendVerification();
      toast.success('Verification email sent. Check your inbox.');
    } catch (err) {
      toast.error(err.message || 'Could not send verification email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-b border-gold/30 bg-gold-soft">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2.5 text-[13px] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="flex min-w-0 items-start gap-2.5 text-[#6b4f0c] sm:items-center">
          <Mail className="mt-0.5 size-4 shrink-0 sm:mt-0" />
          <span className="min-w-0">
            <span className="font-semibold">Verify your email.</span>{' '}
            We sent a link to <strong className="break-all font-semibold">{user.email}</strong>. You'll get full
            account access once it's confirmed.
          </span>
        </p>
        <Button
          onClick={handleResend}
          loading={sending}
          variant="ghost"
          size="sm"
          className="h-8 self-start text-[#6b4f0c] hover:bg-gold/20 hover:text-[#4d3808] sm:self-auto"
        >
          {sending ? 'Sending…' : 'Resend email'}
        </Button>
      </div>
    </div>
  );
};

export default VerifyEmailBanner;
