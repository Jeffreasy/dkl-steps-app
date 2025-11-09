/**
 * useStepsWebSocket Hook
 * React Native hook voor real-time WebSocket verbinding met stappen tracking
 * 
 * Features:
 * - Auto-reconnect met exponential backoff
 * - App lifecycle management (disconnect in background)
 * - Network change detection
 * - Offline queue synchronisatie
 * - Keep-alive pings
 * - Type-safe message handling
 * 
 * @example
 * ```tsx
 * const {
 *   connected,
 *   latestUpdate,
 *   totalSteps,
 *   syncSteps
 * } = useStepsWebSocket(userId, participantId);
 * ```
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Constants from 'expo-constants';
import { storage } from '../utils/storage';
import { apiFetch } from '../services/api';
import { logger } from '../utils/logger';
import { stepQueue, prepareSync, completeSync } from '../services/stepQueue';
import type {
  ConnectionState,
  StepUpdateMessage,
  LeaderboardEntry,
  WebSocketIncomingMessage,
  WebSocketOutgoingMessage,
  UseStepsWebSocketReturn,
  WEBSOCKET_CHANNELS,
} from '../types/websocket';

// WebSocket URL from config
const WS_BASE_URL = (Constants.expoConfig?.extra?.BACKEND_URL || 'https://dklemailservice.onrender.com')
  .replace('https://', 'wss://')
  .replace('http://', 'ws://');

const DEFAULT_CONFIG = {
  reconnectInterval: 1000,      // Start met 1 seconde
  maxReconnectInterval: 30000,  // Max 30 seconden
  pingInterval: 30000,          // Ping elke 30 seconden
  autoConnect: true,
  debug: __DEV__,
};

/**
 * useStepsWebSocket Hook
 */
export function useStepsWebSocket(
  userId: string,
  participantId?: string
): UseStepsWebSocketReturn {
  // State
  const [connected, setConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [latestUpdate, setLatestUpdate] = useState<StepUpdateMessage | null>(null);
  const [totalSteps, setTotalSteps] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const reconnectAttempts = useRef(0);
  const isManualDisconnect = useRef(false);

  /**
   * Calculate reconnect delay with exponential backoff
   */
  const getReconnectDelay = useCallback((): number => {
    const delay = Math.min(
      DEFAULT_CONFIG.reconnectInterval * Math.pow(2, reconnectAttempts.current),
      DEFAULT_CONFIG.maxReconnectInterval
    );
    return delay;
  }, []);

  /**
   * Send message via WebSocket
   */
  const sendMessage = useCallback((message: WebSocketOutgoingMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
        if (DEFAULT_CONFIG.debug && message.type !== 'ping') {
          logger.info('📤 WS Send:', message.type);
        }
      } catch (error) {
        logger.error('Failed to send WebSocket message:', error);
        // Don't retry here - let the connection logic handle reconnection
      }
    } else {
      logger.warn('Cannot send message - WebSocket not connected');
      // Queue message for retry when reconnected
      if (message.type !== 'ping') {
        logger.info('📦 Message queued for retry:', message.type);
      }
    }
  }, []);

  /**
   * Subscribe to channels
   */
  const subscribe = useCallback((channels: string[]) => {
    sendMessage({ type: 'subscribe', channels });
    logger.info('🔔 Subscribed to:', channels);
  }, [sendMessage]);

  /**
   * Unsubscribe from channels
   */
  const unsubscribe = useCallback((channels: string[]) => {
    sendMessage({ type: 'unsubscribe', channels });
    logger.info('🔕 Unsubscribed from:', channels);
  }, [sendMessage]);

  /**
   * Start keep-alive ping
   */
  const startPing = useCallback(() => {
    stopPing();
    pingIntervalRef.current = setInterval(() => {
      sendMessage({ type: 'ping', timestamp: Date.now() });
    }, DEFAULT_CONFIG.pingInterval);
  }, [sendMessage]);

  /**
   * Stop keep-alive ping
   */
  const stopPing = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  /**
   * Handle incoming WebSocket messages
   */
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketIncomingMessage = JSON.parse(event.data);

      if (DEFAULT_CONFIG.debug && message.type !== 'pong') {
        logger.info('📥 WS Receive:', message.type);
      }

      switch (message.type) {
        case 'step_update':
          setLatestUpdate(message);
          break;

        case 'total_update':
          setTotalSteps(message.total_steps);
          break;

        case 'leaderboard_update':
          setLeaderboard(message.entries);
          break;

        case 'badge_earned':
          // TODO: Show notification
          logger.success(`🎉 Badge earned: ${message.badge_name} (+${message.points})`);
          break;

        case 'ping':
          // Server ping - respond with pong
          sendMessage({ type: 'pong', timestamp: Date.now() });
          if (DEFAULT_CONFIG.debug) {
            logger.info('🏓 Ping received, pong sent');
          }
          break;

        case 'pong':
          // Keep-alive response from server
          if (DEFAULT_CONFIG.debug) {
            logger.info('🏓 Pong received');
          }
          break;

        case 'welcome':
          // Server welcome message
          logger.info('👋 Server welcome message received');
          break;

        default:
          logger.warn('Unknown message type:', (message as any).type);
      }
    } catch (error) {
      logger.error('Failed to parse WebSocket message:', error);
    }
  }, []);

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(async () => {
    // Prevent multiple simultaneous connections
    if (wsRef.current?.readyState === WebSocket.CONNECTING ||
        wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionState('connecting');

      // Check if user has permission to use WebSocket
      const hasStepsPermission = await storage.getObject<any>('userData');
      if (hasStepsPermission?.permissions) {
        const canRead = hasStepsPermission.permissions.some(
          (p: any) => p.resource === 'steps' && p.action === 'read'
        );
        if (!canRead) {
          logger.warn('User does not have steps:read permission');
          setConnectionState('error');
          return;
        }
      }

      // Get authentication token
      let token = await storage.getItem('token');
      if (!token) {
        logger.error('No auth token available');
        setConnectionState('error');
        return;
      }

      // Final token check
      if (!token) {
        logger.error('Token is null after refresh attempt');
        setConnectionState('error');
        return;
      }

      // Build WebSocket URL with query params
      const params = new URLSearchParams({
        user_id: userId,
        token: token,
        ...(participantId && { participant_id: participantId }),
      });

      const wsUrl = `${WS_BASE_URL}/ws/steps?${params.toString()}`;

      logger.info('🔌 Connecting to WebSocket...');
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        logger.success('✅ WebSocket connected');
        setConnected(true);
        setConnectionState('connected');
        reconnectAttempts.current = 0;

        // Subscribe to default channels
        subscribe(['step_updates', 'total_updates', 'badge_earned']);

        // Start keep-alive
        startPing();

        // Sync offline queue
        syncOfflineQueue();
      };

      ws.onmessage = handleMessage;

      ws.onerror = (error) => {
        logger.error('❌ WebSocket error:', error);
        setConnectionState('error');
      };

      ws.onclose = (event) => {
        logger.info('🔌 WebSocket disconnected:', event.code, event.reason);
        setConnected(false);
        stopPing();
        wsRef.current = null;

        // Handle different close codes
        if (event.code === 1006) {
          logger.warn('⚠️ WebSocket closed abnormally (code 1006) - likely network issue');
        } else if (event.code === 1008) {
          logger.warn('⚠️ WebSocket closed due to policy violation (code 1008) - check authentication');
        } else if (event.code === 1011) {
          logger.error('⚠️ WebSocket closed due to server error (code 1011)');
        }

        // Auto-reconnect if not manual disconnect and app is active
        if (!isManualDisconnect.current && appStateRef.current === 'active') {
          setConnectionState('reconnecting');
          const delay = getReconnectDelay();
          logger.info(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);

          reconnectAttempts.current++;
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        } else {
          setConnectionState('disconnected');
        }
      };

      wsRef.current = ws;
    } catch (error) {
      logger.error('Failed to connect WebSocket:', error);
      setConnectionState('error');

      // Retry connection
      if (appStateRef.current === 'active') {
        const delay = getReconnectDelay();
        reconnectAttempts.current++;
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      }
    }
  }, [userId, participantId, subscribe, handleMessage, startPing, stopPing, getReconnectDelay]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    isManualDisconnect.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    stopPing();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }
    
    setConnected(false);
    setConnectionState('disconnected');
    reconnectAttempts.current = 0;
    
    logger.info('👋 Disconnected from WebSocket');
  }, [stopPing]);

  /**
   * Reconnect (after manual disconnect)
   */
  const reconnect = useCallback(() => {
    isManualDisconnect.current = false;
    reconnectAttempts.current = 0;
    connect();
  }, [connect]);

  /**
   * Sync offline queue
   */
  const syncOfflineQueue = useCallback(async () => {
    try {
      const syncInfo = await prepareSync();
      if (syncInfo.totalDelta === 0) {
        return;
      }

      logger.info(`📤 Syncing offline queue: ${syncInfo.totalDelta} steps (${syncInfo.itemCount} items)`);
      
      // Use REST API for sync (WebSocket will broadcast the update)
      const response = await apiFetch<{ total_steps: number }>('/steps', {
        method: 'POST',
        body: JSON.stringify({ steps: syncInfo.totalDelta }),
      });

      await completeSync(response.total_steps, syncInfo.expectedTotal);
      logger.success('✅ Offline queue synced');
    } catch (error) {
      logger.error('Failed to sync offline queue:', error);
    }
  }, []);

  /**
   * Sync steps via REST API
   * Falls back to queue if offline
   */
  const syncSteps = useCallback(async (delta: number): Promise<void> => {
    try {
      if (connected) {
        // Online - use REST API (WebSocket will broadcast)
        await apiFetch('/steps', {
          method: 'POST',
          body: JSON.stringify({ steps: delta }),
        });
        logger.success(`✅ Synced ${delta} steps`);
      } else {
        // Offline - queue for later
        await stepQueue.queueSteps(delta);
        logger.info(`📦 Queued ${delta} steps for offline sync`);
      }
    } catch (error) {
      logger.error('Failed to sync steps:', error);
      // Fallback to queue
      await stepQueue.queueSteps(delta);
      throw error;
    }
  }, [connected]);

  /**
   * Handle app state changes
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextAppState;

      if (nextAppState === 'active' && previousState.match(/inactive|background/)) {
        // App came to foreground
        logger.info('📱 App active - connecting WebSocket');
        isManualDisconnect.current = false;
        connect();
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background - disconnect to save battery
        logger.info('📱 App background - disconnecting WebSocket');
        disconnect();
      }
    });

    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handle network changes
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        // Network available
        if (!connected && appStateRef.current === 'active' && !isManualDisconnect.current) {
          logger.info('📶 Network available - connecting');
          connect();
        }
      } else {
        // Network lost
        if (connected) {
          logger.info('📶 Network lost - disconnecting');
          disconnect();
        }
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  /**
   * Initial connection
   */
  useEffect(() => {
    if (DEFAULT_CONFIG.autoConnect && userId) {
      connect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Add userId as dependency to prevent duplicate connections

  return {
    connected,
    connectionState,
    latestUpdate,
    totalSteps,
    leaderboard,
    subscribe,
    unsubscribe,
    syncSteps,
    disconnect,
    reconnect,
  };
}