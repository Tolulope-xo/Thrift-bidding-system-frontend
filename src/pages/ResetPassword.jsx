import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, Loader2 } from 'lucide-react';
import authService from '../services/authService';
import AuthLayout, { AuthHeading, AuthItem, PasswordInput, SuccessCheck } from '../components/auth/AuthLayout';
import { Alert, Button, Field } from '../components/ui';
import { EASE } from '../lib/motion';

// Matches the backend rule: 8+ chars, upper + lower + digit.
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <AuthLayout image="/img/rack-neutral.jpg">
        <AuthItem>
          <SuccessCheck tone="danger" />
        </AuthItem>
        <AuthHeading
          title={
            <>
              Missing reset <span className="italic">token.</span>
            </>
          }
          description="This page must be opened from the link in the reset email."
        />
        <AuthItem>
          <Button to="/forgot-password" size="lg" block className="h-12">
            Request a new reset link
          </Button>
        </AuthItem>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!PASSWORD_RULE.test(newPassword)) {
      setError('Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await authService.resetPassword({ token, newPassword });
      setSuccess(true);
      // Brief pause so the user can read the confirmation before we
      // route them to sign in with their new credentials.
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Could not reset password. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout image="/img/rack-neutral.jpg" quote="A fresh start, like a freshly steamed shirt." attribution="The ThriftBid team">
      {success ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
          <SuccessCheck />
          <h1 className="font-display text-[44px] leading-[0.95] text-ink sm:text-5xl">
            Password <span className="italic">updated.</span>
          </h1>
          <p className="mt-4 inline-flex items-center gap-2 text-[15px] text-muted">
            <Loader2 className="size-4 animate-spin" />
            Redirecting you to sign in…
          </p>
        </motion.div>
      ) : (
        <>
          <AuthHeading
            eyebrow="Account recovery"
            title={
              <>
                Choose a new <span className="italic">password.</span>
              </>
            }
            description="Make it something you haven't used here before."
          />
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert tone="danger" icon={AlertCircle}>
                {error}
              </Alert>
            )}

            <AuthItem>
              <Field label="New password" hint="Min 8 chars, with upper, lower, and a number." id="newPassword">
                <PasswordInput
                  id="newPassword"
                  name="newPassword"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Field>
            </AuthItem>

            <AuthItem>
              <Field label="Confirm new password" id="confirm">
                <PasswordInput
                  id="confirm"
                  name="confirm"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </Field>
            </AuthItem>

            <AuthItem className="pt-1">
              <Button type="submit" size="lg" block loading={submitting} className="h-12">
                {submitting ? 'Updating…' : 'Update password'}
              </Button>
            </AuthItem>
          </form>
        </>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
