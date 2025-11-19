/**
 * Items Service
 * API calls for item operations
 */

import api from './api';

const itemsService = {
  /**
   * Create a new item listing
   * @param {FormData} formData - Form data with item details and images
   * @returns {Promise} API response
   */
  createItem: async (formData) => {
    try {
      const response = await api.post('/items', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get all items with filters
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getItems: async (params = {}) => {
    try {
      const response = await api.get('/items', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get a single item by ID
   * @param {string} id - Item ID
   * @returns {Promise} API response
   */
  getItemById: async (id) => {
    try {
      const response = await api.get(`/items/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get items by user ID
   * @param {string} userId - User ID
   * @param {string} status - Item status filter
   * @returns {Promise} API response
   */
  getItemsByUser: async (userId, status) => {
    try {
      const params = status ? { status } : {};
      const response = await api.get(`/items/user/${userId}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get current user's listings
   * @param {string} status - Item status filter
   * @returns {Promise} API response
   */
  getMyListings: async (status) => {
    try {
      const params = status ? { status } : {};
      const response = await api.get('/items/my-listings', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update an item
   * @param {string} id - Item ID
   * @param {Object} data - Updated item data
   * @returns {Promise} API response
   */
  updateItem: async (id, data) => {
    try {
      const response = await api.put(`/items/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete an item
   * @param {string} id - Item ID
   * @returns {Promise} API response
   */
  deleteItem: async (id) => {
    try {
      const response = await api.delete(`/items/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default itemsService;
