import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clock, Gavel, ImageIcon, Info, MapPin } from 'lucide-react';
import itemsService from '../services/itemsService';
import ImageUpload from '../components/common/ImageUpload';
import { Alert, Button, Card, Field, Input, Page, PageHeader, Textarea } from '../components/ui';
import { EASE, formatMoney } from '../lib/motion';

const categories = ['Clothing', 'Electronics', 'Furniture', 'Books', 'Other'];
const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

const Section = ({ n, title, description, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: EASE, delay: n * 0.06 }}
  >
    <Card className="p-5 sm:p-7">
      <div className="mb-6 flex items-start gap-4">
        <span className="tabular grid size-9 shrink-0 place-items-center rounded-full bg-ink font-mono text-sm text-paper">
          {String(n).padStart(2, '0')}
        </span>
        <div>
          <h2 className="font-display text-[28px] leading-none text-ink">{title}</h2>
          {description && <p className="mt-1.5 text-[13px] text-muted">{description}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </Card>
  </motion.div>
);

const ChoiceGroup = ({ name, options, value, onChange, error, label }) => (
  <div role="radiogroup" aria-label={label} aria-invalid={!!error}>
    <p className="field-label">{label}</p>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange({ target: { name, value: opt } })}
            className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-all active:scale-95 ${
              active
                ? 'border-ink bg-ink text-paper'
                : error
                  ? 'border-danger/40 bg-card text-ink-2 hover:border-ink'
                  : 'border-line bg-card text-ink-2 hover:border-ink'
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
    {error && <p className="mt-1.5 text-[13px] text-danger" role="alert">{error}</p>}
  </div>
);

const CreateListing = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    starting_price: '',
    location: '',
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Live preview cover image
  const coverUrl = useMemo(() => (images[0] ? URL.createObjectURL(images[0]) : null), [images]);
  useEffect(() => () => coverUrl && URL.revokeObjectURL(coverUrl), [coverUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim() || formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim() || formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.condition) {
      newErrors.condition = 'Please select a condition';
    }

    if (!formData.starting_price || parseFloat(formData.starting_price) <= 0) {
      newErrors.starting_price = 'Starting price must be greater than 0';
    }

    if (images.length === 0) {
      newErrors.images = 'Please upload at least one image';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('starting_price', formData.starting_price);
      if (formData.location) {
        formDataToSend.append('location', formData.location);
      }

      // Append images
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const response = await itemsService.createItem(formDataToSend);

      // Redirect to item detail page
      navigate(`/items/${response.data.item.id}`);
    } catch (error) {
      console.error('Create listing error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        setApiError(error.message || 'Failed to create listing. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorCount = Object.values(errors).filter(Boolean).length;
  const price = parseFloat(formData.starting_price);

  return (
    <Page>
      <PageHeader
        eyebrow="New listing"
        title="Put it on the floor"
        description="Add a few photos, tell its story and set a starting price. Your auction runs for 2 days."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
        <form onSubmit={handleSubmit} noValidate className="min-w-0 space-y-5">
          {apiError && <Alert icon={Info} title="Couldn't publish your listing">{apiError}</Alert>}
          {errorCount > 0 && !apiError && (
            <Alert icon={Info} tone="gold">
              {errorCount} field{errorCount > 1 ? 's need' : ' needs'} attention before you can publish.
            </Alert>
          )}

          <Section n={1} title="Photos" description="Up to 5 photos. Natural light and a plain background sell best.">
            <ImageUpload images={images} setImages={setImages} />
            {errors.images && <p className="text-[13px] text-danger" role="alert">{errors.images}</p>}
          </Section>

          <Section n={2} title="Details" description="Be specific — brand, size, era and any flaws build trust.">
            <Field label="Title" error={errors.title}>
              {(id) => (
                <>
                  <Input
                    id={id}
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    maxLength="100"
                    aria-invalid={!!errors.title}
                    placeholder="e.g., Vintage leather moto jacket"
                  />
                  {!errors.title && (
                    <p className="tabular mt-1.5 text-right text-[12px] text-faint">{formData.title.length}/100</p>
                  )}
                </>
              )}
            </Field>

            <Field label="Description" error={errors.description}>
              {(id) => (
                <>
                  <Textarea
                    id={id}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    maxLength="1000"
                    aria-invalid={!!errors.description}
                    placeholder="Describe its condition, size, history and anything a buyer should know…"
                  />
                  {!errors.description && (
                    <p className="tabular mt-1.5 text-right text-[12px] text-faint">{formData.description.length}/1000</p>
                  )}
                </>
              )}
            </Field>

            <ChoiceGroup
              label="Category"
              name="category"
              options={categories}
              value={formData.category}
              onChange={handleChange}
              error={errors.category}
            />
            <ChoiceGroup
              label="Condition"
              name="condition"
              options={conditions}
              value={formData.condition}
              onChange={handleChange}
              error={errors.condition}
            />
          </Section>

          <Section n={3} title="Pricing & pickup" description="Bidding starts here. Every new bid must beat the last by 5%.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Starting price" error={errors.starting_price}>
                {(id) => (
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-muted">$</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      id={id}
                      name="starting_price"
                      value={formData.starting_price}
                      onChange={handleChange}
                      step="0.01"
                      min="0.01"
                      aria-invalid={!!errors.starting_price}
                      className="field-input tabular pl-8 font-mono"
                      placeholder="0.00"
                    />
                  </div>
                )}
              </Field>
              <Field label="Location" optional>
                {(id) => (
                  <Input
                    id={id}
                    icon={MapPin}
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    maxLength="100"
                    placeholder="City, State"
                  />
                )}
              </Field>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-paper-2 px-4 py-3 text-[13px] text-ink-2">
              <Clock className="size-4 shrink-0 text-muted" />
              Auction runs 48 hours. You can edit or delete within 30 minutes, until the first bid.
            </div>
          </Section>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" size="lg" onClick={() => navigate(-1)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="flare" size="lg" loading={isSubmitting} className="sm:min-w-52">
              {isSubmitting ? 'Publishing…' : 'Publish listing'}
            </Button>
          </div>
        </form>

        {/* Live preview */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Live preview</p>
            <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-lift">
              <div className="relative aspect-[4/3] bg-paper-2">
                {coverUrl ? (
                  <motion.img
                    key={coverUrl}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    src={coverUrl}
                    alt="Cover preview"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-faint">
                    <ImageIcon className="size-8" strokeWidth={1.4} />
                  </div>
                )}
                {formData.category && (
                  <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-medium text-ink-2 backdrop-blur">
                    {formData.category}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className={`line-clamp-1 text-[15px] font-semibold ${formData.title ? 'text-ink' : 'text-faint'}`}>
                  {formData.title || 'Your item title'}
                </h3>
                <p className="mt-1 text-[12px] text-muted">
                  {formData.condition || 'Condition'}
                  {formData.location && ` · ${formData.location}`}
                </p>
                <div className="mt-4 flex items-end justify-between border-t border-dashed border-line pt-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-faint">Starting at</p>
                    <p className="tabular font-mono text-lg font-semibold text-ink">
                      {formatMoney(price > 0 ? price : 0)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[12px] text-muted">
                    <Gavel className="size-3.5" />0
                  </span>
                </div>
              </div>
            </div>
            <ul className="mt-5 space-y-2.5 text-[13px] text-muted">
              {['Photos', 'Title & description', 'Category & condition', 'Starting price'].map((label, i) => {
                const done = [
                  images.length > 0,
                  formData.title.trim().length >= 3 && formData.description.trim().length >= 10,
                  formData.category && formData.condition,
                  price > 0,
                ][i];
                return (
                  <li key={label} className="flex items-center gap-2.5">
                    <span
                      className={`grid size-4 place-items-center rounded-full transition-colors ${
                        done ? 'bg-moss text-white' : 'border border-line-strong'
                      }`}
                    >
                      {done && (
                        <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m2.5 6 2.5 2.5 4.5-5" />
                        </svg>
                      )}
                    </span>
                    <span className={done ? 'text-ink' : ''}>{label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </Page>
  );
};

export default CreateListing;
