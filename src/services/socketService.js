

import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

// Socket.IO lives at the server root, not under the REST `/api` prefix
// (a path in the URL would be read as a namespace).
const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

// Serverless backends (e.g. Vercel) cannot hold WebSocket connections.
// With VITE_REALTIME=off the client never connects and pages poll instead.
export const realtimeEnabled = import.meta.env.VITE_REALTIME !== 'off';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.itemRooms = new Set();
  }

  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    // Pass the JWT in the handshake. The backend uses it to bind the
    // socket to a user identity so private rooms (notifications) can
    // only be joined by their owner. The auth callback runs again on
    // every reconnect, so refreshed tokens are picked up automatically.
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: realtimeEnabled,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000,
      auth: (cb) => {
        const token = useAuthStore.getState().accessToken;
        cb({ token: token || null });
      }
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.connected = true;
      // Re-join item rooms after (re)connecting; server-side rooms don't survive a disconnect
      this.itemRooms.forEach((itemId) => this.socket.emit('join-item-room', itemId));
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error.message);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔴 Socket reconnection error:', error.message);
    });

    return this.socket;
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('Socket disconnected manually');
    }
  }

  /**
   * Join a specific item room to receive bid updates
   * @param {String} itemId - Item ID to watch
   */
  joinItemRoom(itemId) {
    if (!this.socket) {
      console.error('Socket not initialized. Call connect() first.');
      return;
    }

    // Recorded so the 'connect' handler joins it once the socket is up
    // (connect() returns before the handshake completes) and on reconnect.
    this.itemRooms.add(itemId);
    if (this.connected) {
      console.log(`📦 Joining room: item-${itemId}`);
      this.socket.emit('join-item-room', itemId);
    }
  }

  /**
   * Leave an item room
   * @param {String} itemId - Item ID to stop watching
   */
  leaveItemRoom(itemId) {
    this.itemRooms.delete(itemId);
    if (!this.socket || !this.connected) {
      return;
    }

    console.log(`📤 Leaving room: item-${itemId}`);
    this.socket.emit('leave-item-room', itemId);
  }

  /**
   * Listen for new bids on current item
   * @param {Function} callback - Function to call when new bid is received
   */
  onNewBid(callback) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on('new-bid', (data) => {
      console.log('📢 New bid received:', data);
      callback(data);
    });
  }

  /**
   * Listen for auction ended event
   * @param {Function} callback - Function to call when auction ends
   */
  onAuctionEnded(callback) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on('auction-ended', (data) => {
      console.log('🏁 Auction ended:', data);
      callback(data);
    });
  }

  /**
   * Listen for item updates
   * @param {Function} callback - Function to call when item is updated
   */
  onItemUpdate(callback) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on('item-updated', (data) => {
      console.log('🔄 Item updated:', data);
      callback(data);
    });
  }

  /**
   * Remove all event listeners for a specific event
   * @param {String} event - Event name
   */
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  /**
   * Check if socket is connected
   * @returns {Boolean}
   */
  isConnected() {
    return this.socket?.connected || false;
  }

  /**
   * Get socket instance
   * @returns {Object} Socket.IO instance
   */
  getSocket() {
    return this.socket;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
