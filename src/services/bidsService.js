
import api from './api';

const bidsService = {
  /**
   * Place a bid on an item
   * @param {String} itemId - Item ID
   * @param {Number} bidAmount - Bid amount
   * @returns {Promise}
   */
  placeBid: async (itemId, bidAmount) => {
    const response = await api.post(`/items/${itemId}/bids`, {
      bid_amount: bidAmount
    });
    return response.data;
  },

  /**
   * Get all bids for an item
   * @param {String} itemId - Item ID
   * @param {Number} limit - Max number of bids to fetch
   * @returns {Promise}
   */
  getItemBids: async (itemId, limit = 50) => {
    const response = await api.get(`/items/${itemId}/bids`, {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get current user's bids on a specific item
   * @param {String} itemId - Item ID
   * @returns {Promise}
   */
  getMyBidsOnItem: async (itemId) => {
    const response = await api.get(`/items/${itemId}/bids/mine`);
    return response.data;
  },

  /**
   * Get bid statistics for an item
   * @param {String} itemId - Item ID
   * @returns {Promise}
   */
  getBidStats: async (itemId) => {
    const response = await api.get(`/items/${itemId}/bids/stats`);
    return response.data;
  },

  /**
   * Get all bids placed by current user
   * @param {String} status - Filter by item status (active, sold, expired)
   * @returns {Promise}
   */
  getAllMyBids: async (status = null) => {
    const response = await api.get('/bids/my-bids', {
      params: status ? { status } : {}
    });
    return response.data;
  }
};

export default bidsService;
