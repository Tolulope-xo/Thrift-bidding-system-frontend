import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, ArrowLeft, Mail } from 'lucide-react';
import authService from '../services/authService';
import AuthLayout, { AuthFootnote, AuthHeading, AuthItem, InlineLink, SuccessCheck } from '../components/auth/AuthLayout';
import { Alert, Button, Field, Input } from '../components/ui';
import { EASE } from '../lib/motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    try {
      await authService.forgotPassword(email);
      // The backend deliberately returns the same response whether or
      // not the email is registered. Show the generic confirmation no
      // matter what so this UI doesn't leak which addresses exist.
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      image="/img/rack-neutral.jpg"
      quote="Lost passwords are easy. Lost vintage is forever."
      attribution="The ThriftBid team"
    >
      <AnimatePresence mode="wait" initial={false}>
        {submitted ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <SuccessCheck />
            <h1 className="font-display text-[44px] leading-[0.95] text-ink sm:text-5xl">
              Check your <span className="italic">inbox.</span>
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              If an account exists for <strong className="font-semibold text-ink">{email}</strong>, a reset link is on
              its way. The link expires in 30 minutes.
            </p>
            <Button to="/login" variant="outline" size="lg" block className="mt-8 h-12">
              <ArrowLeft className="size-4" />
              Back to sign in
            </Button>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}>
            <AuthHeading
              eyebrow="Account recovery"
              title={
                <>
                  Forgot your <span className="italic">password?</span>
                </>
              }
              description="Enter your email and we'll send you a link to reset it."
            />

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              {error && (
                <Alert tone="danger" icon={AlertCircle}>
                  {error}
                </Alert>
              )}

              <AuthItem>
                <Field label="Email address" id="email">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    icon={Mail}
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12"
                  />
                </Field>
              </AuthItem>

              <AuthItem className="pt-1">
                <Button type="submit" size="lg" block loading={submitting} className="h-12">
                  {submitting ? 'Sending…' : 'Send reset link'}
                </Button>
              </AuthItem>
            </form>

            <AuthFootnote>
              Remembered it? <InlineLink to="/login">Back to sign in</InlineLink>
            </AuthFootnote>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default ForgotPassword;
