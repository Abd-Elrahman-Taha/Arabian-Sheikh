/**
 * Arabian Sheikh — SignalR Real-Time Notification Service
 * 
 * Singleton WebSocket hub manager for live notification delivery.
 * Connects to /hubs/notifications with JWT Bearer via query string.
 * Auto-reconnects with exponential backoff.
 */
import * as signalR from '@microsoft/signalr';
import { TOKEN_KEY, ADMIN_TOKEN_KEY } from '../api/client';

// ─── Hub URL Resolution ──────────────────────────────────────────────────────
const SIGNALR_HUB_PATH = '/hubs/notifications';

function getHubUrl() {
  // WebSockets cannot go through Vite dev proxy — connect directly to the real backend
  if (import.meta.env.DEV) {
    // In dev, resolve from VITE_API_BASE_URL or the known production URL
    const base = import.meta.env.VITE_API_BASE_URL || 'https://arabian-sheikh.runasp.net';
    return base.replace(/\/+$/, '') + SIGNALR_HUB_PATH;
  }
  // In production, use relative path (same origin)
  return SIGNALR_HUB_PATH;
}

// ─── Singleton Service ───────────────────────────────────────────────────────
class SignalRNotificationService {
  constructor() {
    /** @type {signalR.HubConnection | null} */
    this._connection = null;
    /** @type {Set<Function>} */
    this._notificationListeners = new Set();
    /** @type {Set<Function>} */
    this._reconnectListeners = new Set();
    this._isStarting = false;
    this._isStopping = false;
  }

  // ─── Connection Lifecycle ────────────────────────────────────────────────

  /**
   * Start the SignalR connection with the given JWT token.
   * @param {string} [token] — JWT. If omitted, reads from localStorage.
   */
  async start(token) {
    if (this._isStopping) return;
    if (this._connection && this._connection.state === signalR.HubConnectionState.Connected) return;
    if (this._isStarting) return;

    this._isStarting = true;

    const resolvedToken = token || localStorage.getItem(TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY) || '';

    if (!resolvedToken) {
      this._isStarting = false;
      return;
    }

    try {
      this._connection = new signalR.HubConnectionBuilder()
        .withUrl(getHubUrl(), {
          accessTokenFactory: () => resolvedToken,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(import.meta.env.DEV ? signalR.LogLevel.Information : signalR.LogLevel.Warning)
        .build();

      // Wire up ReceiveNotification event
      this._connection.on('ReceiveNotification', (notification) => {
        this._notificationListeners.forEach((cb) => {
          try { cb(notification); } catch (e) { console.error('[SignalR] Listener error:', e); }
        });
      });

      // Wire up reconnection events
      this._connection.onreconnected(() => {
        if (import.meta.env.DEV) console.log('[SignalR] Reconnected');
        this._reconnectListeners.forEach((cb) => {
          try { cb(); } catch (e) { console.error('[SignalR] Reconnect listener error:', e); }
        });
      });

      this._connection.onreconnecting((err) => {
        if (import.meta.env.DEV) console.log('[SignalR] Reconnecting...', err?.message);
      });

      this._connection.onclose((err) => {
        if (import.meta.env.DEV) console.log('[SignalR] Connection closed', err?.message);
      });

      await this._connection.start();
      if (import.meta.env.DEV) console.log('[SignalR] Connected to', getHubUrl());
    } catch (err) {
      console.warn('[SignalR] Connection start failed:', err?.message || err);
    } finally {
      this._isStarting = false;
    }
  }

  /**
   * Stop the SignalR connection gracefully.
   */
  async stop() {
    this._isStopping = true;
    if (this._connection) {
      try {
        await this._connection.stop();
      } catch (e) {
        // Ignore stop errors
      }
      this._connection = null;
    }
    this._isStopping = false;
  }

  // ─── Event Subscriptions ─────────────────────────────────────────────────

  /**
   * Subscribe to incoming notifications.
   * @param {function(NotificationResponse): void} callback
   * @returns {function(): void} unsubscribe function
   */
  onNotification(callback) {
    this._notificationListeners.add(callback);
    return () => this._notificationListeners.delete(callback);
  }

  /**
   * Subscribe to reconnect events (to refresh unread count).
   * @param {function(): void} callback
   * @returns {function(): void} unsubscribe function
   */
  onReconnect(callback) {
    this._reconnectListeners.add(callback);
    return () => this._reconnectListeners.delete(callback);
  }

  // ─── State ───────────────────────────────────────────────────────────────

  /** @returns {boolean} */
  get isConnected() {
    return this._connection?.state === signalR.HubConnectionState.Connected;
  }

  /** @returns {string} */
  get state() {
    return this._connection?.state || 'Disconnected';
  }
}

export const signalRService = new SignalRNotificationService();
export default signalRService;
