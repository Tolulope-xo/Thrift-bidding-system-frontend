
import api from './api';

const favoritesService = {
  /**
   * Add item to favorites
   * @param {String} itemId - Item ID
   * @returns {Promise}
   */
  addFavorite: async (itemId) => {
    const response = await api.post(`/favorites/${itemId}`);
    return response.data;
  },

  /**
   * Remove item from favorites
   * @param {String} itemId - Item ID
   * @returns {Promise}
   */
  removeFavorite: async (itemId) => {
    const response = await api.delete(`/favorites/${itemId}`);
    return response.data;
  },

  /**
   * Get all favorites for current user
   * @param {String} status - Filter by item status (active, sold, expired)
   * @returns {Promise}
   */
  getFavorites: async (status = null) => {
    const response = await api.get('/favorites', {
      params: status ? { status } : {}
    });
    return response.data;
  },

  /**
   * Check if item is favorited
   * @param {String} itemId - Item ID
   * @returns {Promise}
   */
  checkFavorite: async (itemId) => {
    const response = await api.get(`/favorites/check/${itemId}`);
    return response.data;
  }
};

export default favoritesService;
