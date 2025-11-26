import { io } from 'socket.io-client';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Determine WebSocket URL based on platform
// const DEV_API_HOST = typeof process !== 'undefined' && process.env && process.env.REACT_NATIVE_API_HOST
//   ? process.env.REACT_NATIVE_API_HOST
//   : (Platform.OS === 'android' ? '192.168.1.28' : 'localhost');

/**
 * WebSocket Configuration
 * Uses EXPO_PUBLIC_API_URL from .env file (removes /api suffix for WS)
 */
const WS_BASE_URL = process.env.EXPO_PUBLIC_API_URL
  ? process.env.EXPO_PUBLIC_API_URL.replace('/api', '')
  : 'http://localhost:5000';
console.debug('[PoseWebSocket] WS_BASE_URL ->', WS_BASE_URL);

class PoseWebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.sessionId = null;
    this.currentExercise = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
    this.messageQueue = [];
    this.callbacks = {
      onFrameResult: null,
      onSessionStarted: null,
      onError: null,
      onConnected: null,
      onDisconnected: null,
    };
    this.frameIdCounter = 0;
    this.pendingPromises = new Map(); // frameId -> {resolve, reject, timeout}
    this.listeners = new Map(); // event -> [callbacks]
  }

  /**
   * Connect to WebSocket server
   */
  async connect() {
    if (this.socket && this.isConnected) {
      console.log('[PoseWebSocket] Already connected');
      return;
    }

    try {
      // Get auth token if available
      const token = await AsyncStorage.getItem('authToken');

      this.socket = io(WS_BASE_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        forceNew: true,
        auth: token ? { token } : undefined,
      });

      this.setupEventHandlers();

    } catch (error) {
      console.error('[PoseWebSocket] Connection error:', error);
      throw error;
    }
  }

  /**
   * Setup socket event handlers
   */
  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('[PoseWebSocket] Connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      // Note: pending promises are NOT rejected on reconnect
      // They will be resolved/rejected when results arrive or timeout
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[PoseWebSocket] Disconnected:', reason);
      this.isConnected = false;

      // Reject all pending promises when disconnected
      this.pendingPromises.forEach(({ reject, timeout }, frameId) => {
        clearTimeout(timeout);
        reject(new Error(`WebSocket disconnected: ${reason}`));
      });
      this.pendingPromises.clear();

      this.emit('disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[PoseWebSocket] Connection error:', error);
      this.reconnectAttempts++;
      this.emit('error', error);
    });

    // Handle pose evaluation result
    this.socket.on('pose:result', (data) => {
      console.log('[PoseWebSocket] Received pose:result from server:', {
        frameId: data.frameId,
        hasKeypoints: !!data.keypoints,
        keypointsCount: data.keypoints?.length || 0,
        isCorrect: data.isCorrect,
        score: data.score,
        phase: data.phase,
      });
      this.emit('pose:result', data);
    });

    // Handle pose evaluation errors
    this.socket.on('pose:error', (data) => {
      console.log('[PoseWebSocket] Received pose:error from server:', {
        frameId: data.frameId,
        error: data.error,
      });
      this.emit('pose:error', data);
    });

    // Handle session started
    this.socket.on('pose:started', (data) => {
      this.emit('pose:started', data);
    });

    // Handle session stopped
    this.socket.on('pose:stopped', (data) => {
      this.emit('pose:stopped', data);
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    // Reject all pending promises
    this.pendingPromises.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('WebSocket manually disconnected'));
    });
    this.pendingPromises.clear();

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  /**
   * Start a pose detection session
   */
  startSession(exerciseName) {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected. Call connect() first.');
    }
    this.socket.emit('pose:start', { exerciseName });
  }

  /**
   * Stop a pose detection session
   */
  stopSession(exerciseName) {
    if (!this.isConnected) {
      return;
    }
    this.socket.emit('pose:stop', { exerciseName });
  }

  /**
   * Evaluate pose for a single frame
   * @param {Object} params - Evaluation parameters
   * @param {string} params.user_id - User ID
   * @param {string} params.exerciseName - Exercise name
   * @param {string} params.imageBase64 - Base64 encoded image
   * @param {Array} params.keypoints - Optional keypoints array
   * @param {boolean} params.usePython - Use Python-based PoseRAC evaluation (default: false)
   * @param {number} params.enter_threshold - Enter threshold for Python evaluation (default: 0.78)
   * @param {number} params.exit_threshold - Exit threshold for Python evaluation (default: 0.4)
   * @returns {Promise} Promise that resolves when frame is sent
   */
  async evaluateFrame({ user_id, exerciseName, imageBase64 }) {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected. Call connect() first.');
    }

    const frameId = ++this.frameIdCounter;

    return new Promise((resolve, reject) => {
      // Set up one-time listeners for this frame
      const resultHandler = (data) => {
        if (data.frameId === frameId) {
          // Cleanup
          this.socket.off('pose:result', resultHandler);
          this.socket.off('pose:error', errorHandler);
          const pending = this.pendingPromises.get(frameId);
          if (pending) {
            clearTimeout(pending.timeout);
            this.pendingPromises.delete(frameId);
          }
          resolve(data);
        }
      };

      const errorHandler = (data) => {
        if (data.frameId === frameId) {
          // Cleanup
          this.socket.off('pose:result', resultHandler);
          this.socket.off('pose:error', errorHandler);
          const pending = this.pendingPromises.get(frameId);
          if (pending) {
            clearTimeout(pending.timeout);
            this.pendingPromises.delete(frameId);
          }
          reject(new Error(data.error || 'Pose evaluation failed'));
        }
      };

      this.socket.on('pose:result', resultHandler);
      this.socket.on('pose:error', errorHandler);

      // Send frame for evaluation
      const emitData = {
        user_id,
        exerciseName,
        imageBase64,
        frameId,
      };

      this.socket.emit('pose:evaluate', emitData);

      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        // Cleanup
        this.socket.off('pose:result', resultHandler);
        this.socket.off('pose:error', errorHandler);
        this.pendingPromises.delete(frameId);
        reject(new Error('Pose evaluation timeout'));
      }, 10000);

      // Track this promise for cleanup on disconnect
      this.pendingPromises.set(frameId, { resolve, reject, timeout });
    });
  }

  /**
   * Subscribe to pose evaluation results (for streaming)
   * @param {Function} callback - Callback function to receive results
   */
  onResult(callback) {
    this.on('pose:result', callback);
  }

  /**
   * Subscribe to pose evaluation errors
   * @param {Function} callback - Callback function to receive errors
   */
  onError(callback) {
    this.on('pose:error', callback);
  }

  /**
   * Subscribe to connection events
   */
  onConnected(callback) {
    this.on('connected', callback);
  }

  /**
   * Subscribe to disconnection events
   */
  onDisconnected(callback) {
    this.on('disconnected', callback);
  }

  /**
   * Generic event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to registered listeners
   */
  emit(event, ...args) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`[PoseWebSocket] Error in listener for ${event}:`, error);
        }
      });
    }
  }
}

// Export singleton instance
export default new PoseWebSocketService();

