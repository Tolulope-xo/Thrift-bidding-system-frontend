import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Loader2 } from 'lucide-react';
import authService from '../services/authService';
import AuthLayout, { SuccessCheck } from '../components/auth/AuthLayout';
import { Button } from '../components/ui';
import { EASE } from '../lib/motion';

const Panel = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.45, ease: EASE }}
  >
    {children}
  </motion.div>
);

const Title = ({ children }) => (
  <h1 className="font-display text-[44px] leading-[0.95] text-ink sm:text-5xl">{children}</h1>
);

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState(token ? 'pending' : 'missing');
  const [message, setMessage] = useState('');

  // React 18+ StrictMode mounts effects twice in dev. The token is
  // single-use, so the second call would always look "invalid". Guard
  // against the duplicate verify attempt.
  const ran = useRef(false);

  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true;

    authService
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'This link is invalid or has expired.');
      });
  }, [token]);

  return (
    <AuthLayout image="/img/tees-rack.jpg" quote="Verified people, honest bids, better finds." attribution="The ThriftBid promise">
      <AnimatePresence mode="wait" initial={false}>
        {status === 'missing' && (
          <Panel key="missing">
            <SuccessCheck tone="danger" />
            <Title>
              Missing verification <span className="italic">token.</span>
            </Title>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Open this page from the link in your verification email.
            </p>
            <Button to="/" variant="outline" size="lg" block className="mt-8 h-12">
              Go home
            </Button>
          </Panel>
        )}

        {status === 'pending' && (
          <Panel key="pending">
            <div className="mb-6 grid size-16 place-items-center rounded-full bg-paper-2">
              <Loader2 className="size-7 animate-spin text-ink" />
            </div>
            <Title>
              Verifying your <span className="italic">email…</span>
            </Title>
            <p className="mt-4 text-[15px] text-muted">This only takes a moment.</p>
          </Panel>
        )}

        {status === 'success' && (
          <Panel key="success">
            <SuccessCheck />
            <Title>
              Email <span className="italic">verified.</span>
            </Title>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Thanks! Your email is confirmed — you have full access to bid and sell.
            </p>
            <Button to="/" size="lg" block className="group mt-8 h-12">
              Continue to ThriftBid
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Panel>
        )}

        {status === 'error' && (
          <Panel key="error">
            <SuccessCheck tone="danger" />
            <Title>
              Verification <span className="italic">failed.</span>
            </Title>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">{message}</p>
            <Button to="/profile" size="lg" block className="mt-8 h-12">
              Request a new link from your profile
            </Button>
          </Panel>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default VerifyEmail;
