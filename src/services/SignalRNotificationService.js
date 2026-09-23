/**
 * Arabian Sheikh - SignalR Notification Service (WebSocket Singleton)
 * 
 * Provides real-time bidirectional connection to /hubs/notifications.
 * Listens for 'ReceiveNotification' push events, executes automatic backoff reconnection,
 * and notifies active subscribers across the storefront & admin suite.
 */

import * as signalR from '@microsoft/signalr';
import { resolveBaseUrl } from '../api/client';

export function resolveHubUrl() {
  const apiBase = resolveBaseUrl();
  if (apiBase.startsWith('http')) {
    return apiBase.replace(/\/api\/?$/i, '') + '/hubs/notifications';
  }
  return '/hubs/notifications';
}

class SignalRNotificationService {
  constructor() {
    this.connection = null;
    this.notificationListeners = new Set();
    this.reconnectListeners = new Set();
    this.isStarting = false;
    this.currentToken = null;
  }

  /**
   * Start or attach to existing SignalR connection
   * @param {string} token - JWT bearer token
   * @param {function} onNotification - Callback for incoming notification
   * @param {function} onReconnect - Optional callback when connection is restored
   */
  startConnection(token, onNotification, onReconnect) {
    if (onNotification) {
      this.notificationListeners.add(onNotification);
    }
    if (onReconnect) {
      this.reconnectListeners.add(onReconnect);
    }

    if (!token) return;
    this.currentToken = token;

    // If connection already established and healthy, do nothing
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.isStarting) return;
    this.isStarting = true;

    try {
      const hubUrl = resolveHubUrl();

      // If connection exists in disconnected state, stop cleanly first
      if (this.connection) {
        try {
          this.connection.stop();
        } catch {
          // ignore
        }
      }

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => this.currentToken || '',
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      // Handle real-time push event
      this.connection.on('ReceiveNotification', (notification) => {
        this.notificationListeners.forEach((callback) => {
          try {
            callback(notification);
          } catch (e) {
            console.error('[SignalR] Listener error:', e);
          }
        });
      });

      // Handle reconnection event (re-synchronize state)
      this.connection.onreconnected((connectionId) => {
        console.info('[SignalR] Connection re-established. Connection ID:', connectionId);
        this.reconnectListeners.forEach((callback) => {
          try {
            callback();
          } catch (e) {
            console.error('[SignalR] Reconnect listener error:', e);
          }
        });
      });

      this.connection
        .start()
        .then(() => {
          console.info('[SignalR] Connected successfully to notification hub');
        })
        .catch((err) => {
          console.warn('[SignalR] Connection start failed (will retry if reconnecting):', err?.message || err);
        })
        .finally(() => {
          this.isStarting = false;
        });
    } catch (err) {
      console.warn('[SignalR] Init error:', err);
      this.isStarting = false;
    }
  }

  /**
   * Remove a specific listener
   */
  removeListener(onNotification, onReconnect) {
    if (onNotification) {
      this.notificationListeners.delete(onNotification);
    }
    if (onReconnect) {
      this.reconnectListeners.delete(onReconnect);
    }
  }

  /**
   * Stop connection cleanly (e.g. on logout)
   */
  stopConnection() {
    this.notificationListeners.clear();
    this.reconnectListeners.clear();
    this.currentToken = null;
    this.isStarting = false;

    if (this.connection) {
      try {
        this.connection.stop().catch(() => {});
      } catch {
        // ignore
      }
      this.connection = null;
    }
  }

  /**
   * Check connection status
   */
  isConnected() {
    return this.connection && this.connection.state === signalR.HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRNotificationService();
export default signalRService;
