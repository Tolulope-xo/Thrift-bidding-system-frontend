import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Mail } from 'lucide-react';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';
import AuthLayout, { AuthFootnote, AuthHeading, AuthItem, InlineLink, PasswordInput } from '../components/auth/AuthLayout';
import { Alert, Button, Field, Input } from '../components/ui';

const Login = () => {
  const navigate = useNavigate();
  const { setLoading, setError, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    clearError();

    try {
      const { email, password } = formData;
      await authService.login({ email, password });

      // Redirect to profile page on successful login
      navigate('/profile');
    } catch (error) {
      console.error('Login error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setApiError(error.message || 'Login failed. Please check your credentials.');
      }
      setError(error.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeading
        eyebrow="Sign in"
        title={
          <>
            Welcome <span className="italic">back.</span>
          </>
        }
        description="Pick up where you left off — your bids, saved lots and listings are waiting."
      />

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {apiError && (
          <Alert tone="danger" icon={AlertCircle}>
            {apiError}
          </Alert>
        )}

        <AuthItem>
          <Field label="Email address" error={errors.email} id="email">
            <Input
              id="email"
              name="email"
              type="email"
              icon={Mail}
              autoComplete="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={!!errors.email}
              className="h-12"
            />
          </Field>
        </AuthItem>

        <AuthItem>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="field-label mb-0">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[13px] font-medium text-muted transition-colors hover:text-flare"
            >
              Forgot password?
            </Link>
          </div>
          <Field error={errors.password} id="password">
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              aria-invalid={!!errors.password}
            />
          </Field>
        </AuthItem>

        <AuthItem>
          <label htmlFor="rememberMe" className="inline-flex cursor-pointer select-none items-center gap-2.5 text-sm text-ink-2">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="size-[18px] cursor-pointer rounded-md border-line-strong accent-ink"
            />
            Keep me signed in
          </label>
        </AuthItem>

        <AuthItem className="pt-1">
          <Button type="submit" size="lg" block loading={isSubmitting} className="group h-12">
            {isSubmitting ? 'Signing in…' : 'Sign in'}
            {!isSubmitting && (
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            )}
          </Button>
        </AuthItem>
      </form>

      <AuthFootnote>
        New to ThriftBid? <InlineLink to="/register">Create an account</InlineLink>
      </AuthFootnote>
    </AuthLayout>
  );
};

export default Login;
