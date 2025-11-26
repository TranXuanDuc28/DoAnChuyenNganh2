/**
 * CameraWebSocket Service - Raw WebSocket Client for Python Server
 * Matches server JSON format: {type: '...', exercise_name: '...', image_base64: '...'}
 */

import { Platform } from 'react-native';

class CameraWebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.sessionId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectDelay = 2000;
    this.callbacks = {
      onFrameResult: null,
      onSessionStarted: null,
      onError: null,
      onConnected: null,
      onDisconnected: null,
    };
  }

  setCallbacks(callbacks) {
    Object.assign(this.callbacks, callbacks);
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(url) {
    if (this.isConnected) {
      console.log('[CameraWebSocket] Already connected');
      return;
    }

    if (this.ws) {
      this.ws.close();
    }

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      const connectTimeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);

      this.ws.onopen = () => {
        clearTimeout(connectTimeout);
        console.log('[CameraWebSocket] Connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.callbacks.onConnected?.();
        resolve();
      };

      this.ws.onclose = (event) => {
        console.log('[CameraWebSocket] Disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.callbacks.onDisconnected?.(event);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(url), this.reconnectDelay * this.reconnectAttempts);
        }
      };

      this.ws.onerror = (error) => {
        clearTimeout(connectTimeout);
        console.error('[CameraWebSocket] Error:', error);
        this.callbacks.onError?.(error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (e) {
          console.error('[CameraWebSocket] Parse error:', e);
          this.callbacks.onError?.(new Error('Invalid JSON response'));
        }
      };
    });
  }

  handleMessage(data) {
    switch (data.type) {
      case 'frame_result':
        console.log('[CameraWebSocket] Frame result:', {
          success: data.success,
          keypoints: data.keypoints?.length || 0,
          rep_count: data.rep_count,
          isCorrect: data.isCorrect,
        });
        this.callbacks.onFrameResult?.(data);
        break;
      case 'session_started':
        console.log('[CameraWebSocket] Session started:', data);
        this.sessionId = data.session_id; // Use server's if provided
        this.callbacks.onSessionStarted?.(data);
        break;
      case 'session_ended':
      case 'session_reset':
        console.log('[CameraWebSocket] Session event:', data.type, data);
        break;
      case 'error':
        console.error('[CameraWebSocket] Server error:', data.message);
        this.callbacks.onError?.(new Error(data.message));
        break;
      default:
        console.log('[CameraWebSocket] Unknown message:', data);
    }
  }

  /**
   * Send a message (returns Promise for await compatibility)
   */
  sendMessage(message) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      this.ws.send(JSON.stringify(message));
      resolve();
    });
  }

  /**
   * Start a pose detection session
   */
  async startSession(exerciseName) {
    if (!this.isConnected) throw new Error('WebSocket not connected. Call connect() first.');

    if (!this.sessionId) {
      this.sessionId = this.generateSessionId();
    }

    return this.sendMessage({
      type: 'start_session',
      session_id: this.sessionId,
      exercise_name: exerciseName,
    });
  }

  /**
   * End session
   */
  async endSession() {
    if (!this.isConnected || !this.sessionId) return;

    await this.sendMessage({
      type: 'end_session',
      session_id: this.sessionId,
    });

    this.sessionId = null;
  }

  /**
   * Reset session counter
   */
  async resetSession() {
    if (!this.isConnected || !this.sessionId) return;

    await this.sendMessage({
      type: 'reset_session',
      session_id: this.sessionId,
    });
  }

  /**
   * Evaluate pose for a single frame
   */
  async evaluateFrame({ user_id, exerciseName, imageBase64 }) {
    if (!this.isConnected || !this.sessionId) {
      throw new Error('WebSocket not connected or session not started');
    }

    // Strip data URI prefix for server
    let cleanBase64 = imageBase64;
    if (imageBase64.startsWith('data:image')) {
      cleanBase64 = imageBase64.split(',')[1];
    }

    return this.sendMessage({
      type: 'evaluate_frame',
      session_id: this.sessionId,
      exercise_name: exerciseName,
      user_id,
      image_base64: cleanBase64,
    });
  }

  /**
   * Disconnect
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.sessionId = null;
    this.reconnectAttempts = 0;
  }
}

// Singleton export
export default new CameraWebSocketService();