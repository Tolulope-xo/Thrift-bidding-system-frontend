/**
 * Notification Store
 * Manages notification state using Zustand
 */

import { create } from 'zustand';
import api from '../services/api';

const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  hasMore: false,
  preferences: null,
  preferencesLoading: false,

  /**
   * Fetch notifications from the API
   * @param {Object} options - Query options
   * @param {Number} options.limit - Max number to fetch
   * @param {Number} options.offset - Offset for pagination
   * @param {Boolean} options.unreadOnly - Filter only unread
   */
  fetchNotifications: async (options = {}) => {
    set({ loading: true, error: null });

    try {
      const { limit = 20, offset = 0, unreadOnly = false } = options;

      const response = await api.get('/notifications', {
        params: { limit, offset, unreadOnly }
      });

      const { notifications, pagination } = response.data.data;

      set({
        notifications: offset === 0 ? notifications : [...get().notifications, ...notifications],
        hasMore: pagination.hasMore,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({
        error: error.response?.data?.message || 'Failed to fetch notifications',
        loading: false
      });
    }
  },

  /**
   * Fetch unread count
   */
  fetchUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      set({ unreadCount: response.data.data.count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  },

  /**
   * Mark a notification as read
   * @param {String} notificationId - Notification ID
   */
  markAsRead: async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);

      // Update local state
      set((state) => ({
        notifications: state.notifications.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true, readAt: new Date().toISOString() } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/mark-all-read');
      const { count } = response.data.data;

      // Update local state
      set((state) => ({
        notifications: state.notifications.map((notif) => ({
          ...notif,
          isRead: true,
          readAt: new Date().toISOString()
        })),
        unreadCount: 0
      }));

      return count;
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },

  /**
   * Delete a notification
   * @param {String} notificationId - Notification ID
   */
  deleteNotification: async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);

      // Update local state
      set((state) => {
        const notification = state.notifications.find((n) => n.id === notificationId);
        const wasUnread = notification && !notification.isRead;

        return {
          notifications: state.notifications.filter((notif) => notif.id !== notificationId),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        };
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  /**
   * Add a new notification (used for real-time updates)
   * @param {Object} notification - Notification object
   */
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1
    }));
  },

  /**
   * Update unread count (used for real-time updates)
   * @param {Number} count - New count
   */
  setUnreadCount: (count) => {
    set({ unreadCount: count });
  },

  /**
   * Fetch notification preferences
   */
  fetchPreferences: async () => {
    set({ preferencesLoading: true });

    try {
      const response = await api.get('/notifications/preferences');
      set({
        preferences: response.data.data.preferences,
        preferencesLoading: false
      });
    } catch (error) {
      console.error('Error fetching preferences:', error);
      set({ preferencesLoading: false });
    }
  },

  /**
   * Update notification preferences
   * @param {Object} updates - Preference updates
   */
  updatePreferences: async (updates) => {
    set({ preferencesLoading: true });

    try {
      const response = await api.put('/notifications/preferences', updates);
      set({
        preferences: response.data.data.preferences,
        preferencesLoading: false
      });

      return response.data.data.preferences;
    } catch (error) {
      console.error('Error updating preferences:', error);
      set({ preferencesLoading: false });
      throw error;
    }
  },

  /**
   * Clear all notifications (used for logout)
   */
  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      hasMore: false,
      preferences: null
    });
  }
}));

export default useNotificationStore;
