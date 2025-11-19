
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import itemsService from '../services/itemsService';
import ImageUpload from '../components/common/ImageUpload';
import useAuthStore from '../store/authStore';

const categories = ['Clothing', 'Electronics', 'Furniture', 'Books', 'Other'];
const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

const CreateListing = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
            <p className="mt-2 text-gray-600">
              List your item for auction. Auction will run for 2 days.
            </p>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                maxLength="100"
                className={`w-full px-3 py-2 border ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                } rounded-md`}
                placeholder="e.g., Vintage Leather Jacket"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              <p className="mt-1 text-sm text-gray-500">{formData.title.length} / 100</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                maxLength="1000"
                className={`w-full px-3 py-2 border ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                } rounded-md`}
                placeholder="Describe your item in detail..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              <p className="mt-1 text-sm text-gray-500">{formData.description.length} / 1000</p>
            </div>

            {/* Category and Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  } rounded-md`}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                  Condition *
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.condition ? 'border-red-300' : 'border-gray-300'
                  } rounded-md`}
                >
                  <option value="">Select condition</option>
                  {conditions.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
                {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition}</p>}
              </div>
            </div>

            {/* Starting Price and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="starting_price" className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Price * ($)
                </label>
                <input
                  type="number"
                  id="starting_price"
                  name="starting_price"
                  value={formData.starting_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0.01"
                  className={`w-full px-3 py-2 border ${
                    errors.starting_price ? 'border-red-300' : 'border-gray-300'
                  } rounded-md`}
                  placeholder="0.00"
                />
                {errors.starting_price && (
                  <p className="mt-1 text-sm text-red-600">{errors.starting_price}</p>
                )}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  maxLength="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="City, State"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images * (Max 5)
              </label>
              <ImageUpload images={images} setImages={setImages} />
              {errors.images && <p className="mt-2 text-sm text-red-600">{errors.images}</p>}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="px-6 py-3 border border-gray-300 rounded-md font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;
