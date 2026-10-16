
import api from './api';
import useAuthStore from '../store/authStore';

const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} API response
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, accessToken, refreshToken } = response.data.data;

      // Update auth store
      useAuthStore.getState().setAuth(user, accessToken, refreshToken);

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Login user
   * @param {Object} credentials - Email and password
   * @returns {Promise} API response
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user, accessToken, refreshToken } = response.data.data;

      // Update auth store
      useAuthStore.getState().setAuth(user, accessToken, refreshToken);

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Logout user
   * @returns {Promise} API response
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
      useAuthStore.getState().logout();
    } catch (error) {
      // Even if API call fails, logout user locally
      useAuthStore.getState().logout();
      throw error.response?.data || error;
    }
  },

  /**
   * Get current user data
   * @returns {Promise} API response
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      const { user } = response.data.data;

      // Update user in store
      useAuthStore.getState().setUser(user);

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} API response
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      const { user } = response.data.data;

      // Update user in store
      useAuthStore.getState().updateUser(user);

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} API response
   */
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh-token', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      // Update tokens in store
      useAuthStore.getState().setTokens(accessToken, newRefreshToken);

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Request a password reset email.
   * Backend always responds 200 regardless of whether the email is
   * registered, so the caller cannot use this to enumerate users.
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Complete a password reset with a token.
   */
  resetPassword: async ({ token, newPassword }) => {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Confirm an email address via verification token from the inbox.
   * On success, mirror the updated email_verified_at into the local
   * user object so the verification banner disappears immediately.
   */
  verifyEmail: async (token) => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      const verifiedAt = response.data?.data?.email_verified_at;
      if (verifiedAt) {
        useAuthStore.getState().updateUser({ email_verified_at: verifiedAt });
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Resend the email verification link to the logged-in user.
   */
  resendVerification: async () => {
    try {
      const response = await api.post('/auth/resend-verification');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default authService;
