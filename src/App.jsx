import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, MotionConfig } from 'motion/react';
import Header from './components/common/Header';
import VerifyEmailBanner from './components/common/VerifyEmailBanner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Spinner } from './components/ui';
import useNotificationListener from './hooks/useNotificationListener.jsx';
import Landing from './pages/Landing';

// Portal pages are code-split so the landing page loads lean
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Profile = lazy(() => import('./pages/Profile'));
const Browse = lazy(() => import('./pages/Browse'));
const ItemDetail = lazy(() => import('./pages/ItemDetail'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const MyListings = lazy(() => import('./pages/MyListings'));
const MyBids = lazy(() => import('./pages/MyBids'));
const Favorites = lazy(() => import('./pages/Favorites'));
const NotificationCenter = lazy(() => import('./pages/NotificationCenter'));
const NotificationPreferences = lazy(() => import('./pages/NotificationPreferences'));

// Pages that render their own full-bleed chrome instead of the portal header
const CHROMELESS = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

const protect = (el) => <ProtectedRoute>{el}</ProtectedRoute>;

// Layout component that wraps routes and listens for notifications
function AppLayout() {
  // Listen for real-time notifications (must be inside Router context)
  useNotificationListener();
  const location = useLocation();
  const chromeless = CHROMELESS.includes(location.pathname);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-paper">
        {!chromeless && (
          <>
            <Header />
            <VerifyEmailBanner />
          </>
        )}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#17140f',
              color: '#f5f1ea',
              borderRadius: '999px',
              padding: '10px 16px',
              fontSize: '14px',
              fontFamily: 'Geist, system-ui, sans-serif',
              boxShadow: '0 20px 40px -16px rgb(23 20 15 / 0.45)',
            },
            success: { iconTheme: { primary: '#7fd49b', secondary: '#17140f' } },
            error: { iconTheme: { primary: '#ff4f1a', secondary: '#17140f' } },
          }}
        />
        <Suspense fallback={<Spinner className="min-h-[60vh]" />}>
        <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/items/:id" element={<ItemDetail />} />

            {/* Protected Routes */}
            <Route path="/profile" element={protect(<Profile />)} />
            <Route path="/create-listing" element={protect(<CreateListing />)} />
            <Route path="/my-listings" element={protect(<MyListings />)} />
            <Route path="/my-bids" element={protect(<MyBids />)} />
            <Route path="/favorites" element={protect(<Favorites />)} />
            <Route path="/notifications" element={protect(<NotificationCenter />)} />
            <Route path="/settings/notifications" element={protect(<NotificationPreferences />)} />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
        </Suspense>
      </div>
    </MotionConfig>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
