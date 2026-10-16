import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, ArrowRight, AtSign, Check, CheckCircle2, Mail, User } from 'lucide-react';
import authService from '../services/authService';
import useAuthStore from '../store/authStore';
import AuthLayout, { AuthFootnote, AuthHeading, AuthItem, InlineLink, PasswordInput } from '../components/auth/AuthLayout';
import { Alert, Button, Field, Input } from '../components/ui';

// Mirrors the validation rules below so the meter never disagrees with submit
const PASSWORD_CHECKS = [
  { label: '8+ characters', test: (p) => p.length >= 8 },
  { label: 'Uppercase', test: (p) => /[A-Z]/.test(p) },
  { label: 'Lowercase', test: (p) => /[a-z]/.test(p) },
  { label: 'Number', test: (p) => /\d/.test(p) },
];
const STRENGTH = [
  { label: 'Too weak', color: 'bg-danger' },
  { label: 'Weak', color: 'bg-danger' },
  { label: 'Fair', color: 'bg-[#e08a1a]' },
  { label: 'Almost', color: 'bg-gold' },
  { label: 'Strong', color: 'bg-moss-2' },
];

const PasswordMeter = ({ password }) => {
  const passed = PASSWORD_CHECKS.filter((c) => c.test(password)).length;
  const level = STRENGTH[passed];
  if (!password) return null;
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2.5 overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1">
          {PASSWORD_CHECKS.map((_, i) => (
            <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-paper-3">
              <motion.div
                className={`h-full rounded-full ${level.color}`}
                initial={false}
                animate={{ width: i < passed ? '100%' : '0%' }}
                transition={{ duration: 0.35 }}
              />
            </div>
          ))}
        </div>
        <span className="w-16 text-right text-[12px] font-medium text-muted">{level.label}</span>
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {PASSWORD_CHECKS.map((c) => {
          const ok = c.test(password);
          return (
            <li key={c.label} className={`inline-flex items-center gap-1 text-[12px] transition-colors ${ok ? 'text-moss' : 'text-faint'}`}>
              <Check className="size-3" strokeWidth={3} />
              {c.label}
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const { setLoading, setError, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Full name validation
    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    clearError();

    try {
      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, ...registrationData } = formData;
      await authService.register(registrationData);

      setSuccessMessage('Registration successful! Redirecting...');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      // The backend always sends `errors` (often empty), so only treat it as
      // field errors when there are some — otherwise 409/500 messages vanish.
      if (Array.isArray(error.errors) && error.errors.length > 0) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setApiError(error.message || 'Registration failed. Please try again.');
      }
      setError(error.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const confirmMatches = formData.confirmPassword && formData.confirmPassword === formData.password;

  return (
    <AuthLayout
      image="/img/closet.jpg"
      quote="I sold a chair I never sat in and bought a camera I use every day."
      attribution="Theo K. — seller & bidder"
    >
      <AuthHeading
        eyebrow="Join ThriftBid"
        title={
          <>
            Create your <span className="italic">account.</span>
          </>
        }
        description="Bid on one-of-a-kind finds and list your own in under a minute."
      />

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {apiError && (
          <Alert tone="danger" icon={AlertCircle}>
            {apiError}
          </Alert>
        )}

        {successMessage && (
          <Alert tone="moss" icon={CheckCircle2}>
            {successMessage}
          </Alert>
        )}

        <AuthItem>
          <Field label="Full name" error={errors.full_name} id="full_name">
            <Input
              id="full_name"
              name="full_name"
              type="text"
              icon={User}
              autoComplete="name"
              placeholder="Maya Rivera"
              value={formData.full_name}
              onChange={handleChange}
              aria-invalid={!!errors.full_name}
              className="h-12"
            />
          </Field>
        </AuthItem>

        <AuthItem className="grid gap-5 sm:grid-cols-2">
          <Field label="Username" error={errors.username} id="username">
            <Input
              id="username"
              name="username"
              type="text"
              icon={AtSign}
              autoComplete="username"
              placeholder="maya_finds"
              value={formData.username}
              onChange={handleChange}
              aria-invalid={!!errors.username}
              className="h-12"
            />
          </Field>
          <Field label="Email" error={errors.email} id="email">
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
          <Field label="Password" error={errors.password} id="password">
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              aria-invalid={!!errors.password}
            />
          </Field>
          {!errors.password && <PasswordMeter password={formData.password} />}
        </AuthItem>

        <AuthItem>
          <Field
            label="Confirm password"
            error={errors.confirmPassword}
            hint={confirmMatches ? 'Passwords match' : undefined}
            id="confirmPassword"
          >
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              aria-invalid={!!errors.confirmPassword}
            />
          </Field>
        </AuthItem>

        <AuthItem className="pt-1">
          <Button type="submit" size="lg" block loading={isSubmitting} className="group h-12">
            {isSubmitting ? 'Creating account…' : 'Create account'}
            {!isSubmitting && (
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            )}
          </Button>
          <p className="mt-3 text-center text-[12px] text-faint">
            By continuing you agree to bid fairly and sell honestly.
          </p>
        </AuthItem>
      </form>

      <AuthFootnote>
        Already have an account? <InlineLink to="/login">Sign in</InlineLink>
      </AuthFootnote>
    </AuthLayout>
  );
};

export default Register;
