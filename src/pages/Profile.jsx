/**
 * Profile Page
 * Display and edit user profile information
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import authService from '../services/authService';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-600 hover:border-red-700 rounded-md"
            >
              Logout
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Profile Content */}
          <div className="px-6 py-6">
            {!isEditing ? (
              /* View Mode */
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
                    {user.profile_picture_url ? (
                      <img
                        src={user.profile_picture_url}
                        alt={user.full_name}
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-primary-600">
                        {user.full_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
                    <p className="text-gray-500">@{user.username}</p>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-gray-900">{user.location || 'Not specified'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                      {user.bio || 'No bio added yet'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Seller Rating</label>
                    <div className="mt-1 flex items-center">
                      <span className="text-2xl font-bold text-yellow-500">
                        {user.seller_rating ? user.seller_rating.toFixed(1) : '0.0'}
                      </span>
                      <span className="ml-2 text-gray-500">/ 5.0</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Member Since</label>
                    <p className="mt-1 text-gray-900">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="pt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    Edit Profile
                  </button>
                </div>

                {/* Future Features */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => alert('Coming in Phase 2!')}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                    >
                      My Listings (Coming Soon)
                    </button>
                    <button
                      onClick={() => alert('Coming in Phase 2!')}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                    >
                      My Bids (Coming Soon)
                    </button>
                    <button
                      onClick={() => alert('Coming in Phase 2!')}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
                    >
                      Favorites (Coming Soon)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, State"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows="4"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    maxLength="500"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.bio.length} / 500 characters
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="profile_picture_url"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    id="profile_picture_url"
                    name="profile_picture_url"
                    value={formData.profile_picture_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
