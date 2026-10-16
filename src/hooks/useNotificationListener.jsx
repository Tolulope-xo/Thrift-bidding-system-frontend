/**
 * useNotificationListener Hook
 * Listens for real-time notifications via Socket.IO and shows toast notifications
 */

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import socketService, { realtimeEnabled } from '../services/socketService';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';

const useNotificationListener = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { addNotification, setUnreadCount, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    // Without sockets, keep the bell's unread count fresh by polling
    if (!realtimeEnabled) {
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }

    // Connect to Socket.IO
    const socket = socketService.connect();

    // Join user's notification room now if already connected, and again on
    // every (re)connect since server-side rooms don't survive a disconnect
    const joinUserRoom = () => socket.emit('join-user-room', user.id);
    if (socket.connected) joinUserRoom();
    socket.on('connect', joinUserRoom);

    // Listen for new notifications
    socket.on('notification', (data) => {
      const { notification } = data;

      // Add to store
      addNotification(notification);

      // Show toast notification
      showToast(notification, navigate);
    });

    // Listen for unread count updates
    socket.on('unread-count-update', (data) => {
      setUnreadCount(data.count);
    });

    // Cleanup on unmount
    return () => {
      socket.off('connect', joinUserRoom);
      socket.off('notification');
      socket.off('unread-count-update');
    };
  }, [isAuthenticated, user, addNotification, setUnreadCount, fetchUnreadCount, navigate]);
};

/**
 * Show toast notification based on type
 */
const showToast = (notification, navigate) => {
  const icon = getNotificationIcon(notification.type);

  // Create custom toast with icon and action
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <span className="text-2xl">{icon}</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{notification.message}</p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          {notification.itemId && (
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate(`/items/${notification.itemId}`);
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              View
            </button>
          )}
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: 'top-right'
    }
  );

  // Also play notification sound if available
  playNotificationSound(notification.type);
};

/**
 * Get emoji icon for notification type
 */
const getNotificationIcon = (type) => {
  switch (type) {
    case 'outbid':
      return '🔴';
    case 'auction_ending':
      return '⏰';
    case 'auction_won':
      return '🎉';
    case 'new_bid':
      return '💰';
    case 'item_sold':
      return '✅';
    case 'auction_expired':
      return '⏱️';
    default:
      return '🔔';
  }
};

/**
 * Play notification sound (optional enhancement)
 */
const playNotificationSound = (type) => {
  try {
    // Only play sound for important notifications
    if (['outbid', 'auction_won', 'auction_ending'].includes(type)) {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore errors if sound playback fails
      });
    }
  } catch {
    // Silently fail if sound not available
  }
};

export default useNotificationListener;
