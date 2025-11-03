/**
 * WebSocket Type Definitions
 * Type definitions voor real-time WebSocket updates volgens backend architectuur
 * 
 * Gebaseerd op: STEPS_ARCHITECTURE_WEBSOCKETS.md
 */

/**
 * Message Types - Alle type berichten die via WebSocket kunnen worden verzonden/ontvangen
 */
export type MessageType =
  | 'step_update'           // Individuele deelnemer stappen update
  | 'total_update'          // Totaal stappen van alle deelnemers
  | 'leaderboard_update'    // Top N leaderboard update
  | 'badge_earned'          // Badge verdiend notificatie
  | 'subscribe'             // Subscribe to channels
  | 'unsubscribe'           // Unsubscribe from channels
  | 'ping'                  // Keep-alive ping (bidirectional)
  | 'pong'                  // Keep-alive pong response (bidirectional)
  | 'welcome';              // Server welcome message

/**
 * StepUpdateMessage - Individuele deelnemer update
 * Wordt verzonden wanneer iemand stappen toevoegt
 */
export interface StepUpdateMessage {
  type: 'step_update';
  participant_id: string;
  naam: string;
  steps: number;              // Nieuwe totaal
  delta: number;              // Toegevoegde stappen (kan negatief zijn)
  route: string;              // "6 KM", "10 KM", "15 KM", "20 KM"
  allocated_funds: number;    // Toegewezen fonds voor deze route
  timestamp: number;          // Unix timestamp (seconds)
}

/**
 * TotalUpdateMessage - Totaal stappen update
 * Wordt verzonden wanneer het totaal aantal stappen verandert
 */
export interface TotalUpdateMessage {
  type: 'total_update';
  total_steps: number;
  year: number;               // 0 = alle jaren, >0 = specifiek jaar
  timestamp: number;
}

/**
 * LeaderboardEntry - Enkele entry in leaderboard
 */
export interface LeaderboardEntry {
  rank: number;
  participant_id: string;
  naam: string;
  steps: number;
  achievement_points: number;
  total_score: number;        // steps + achievement_points
  route: string;
}

/**
 * LeaderboardUpdateMessage - Leaderboard update
 * Wordt verzonden wanneer rankings veranderen
 */
export interface LeaderboardUpdateMessage {
  type: 'leaderboard_update';
  top_n: number;              // Aantal entries (meestal 10)
  entries: LeaderboardEntry[];
  timestamp: number;
}

/**
 * BadgeEarnedMessage - Badge verdiend notificatie
 * Wordt verzonden wanneer een deelnemer een badge verdient
 */
export interface BadgeEarnedMessage {
  type: 'badge_earned';
  participant_id: string;
  badge_name: string;
  badge_icon: string;         // URL of emoji
  points: number;
  timestamp: number;
}

/**
 * SubscribeMessage - Subscribe to channels
 * Client → Server
 */
export interface SubscribeMessage {
  type: 'subscribe';
  channels: string[];         // ['step_updates', 'total_updates', 'leaderboard_updates', 'badge_earned']
}

/**
 * UnsubscribeMessage - Unsubscribe from channels
 * Client → Server
 */
export interface UnsubscribeMessage {
  type: 'unsubscribe';
  channels: string[];
}

/**
 * PingMessage - Keep-alive ping
 * Client → Server
 */
export interface PingMessage {
  type: 'ping';
  timestamp: number;
}

/**
 * PongMessage - Keep-alive pong response
 * Client → Server OR Server → Client (bidirectional)
 */
export interface PongMessage {
  type: 'pong';
  timestamp: number;
}

/**
 * WelcomeMessage - Server welcome message
 * Server → Client (bij eerste connectie)
 */
export interface WelcomeMessage {
  type: 'welcome';
  message: string;
  timestamp?: number;
}

/**
 * Union type voor alle inkomende berichten
 */
export type WebSocketIncomingMessage =
  | StepUpdateMessage
  | TotalUpdateMessage
  | LeaderboardUpdateMessage
  | BadgeEarnedMessage
  | PingMessage              // Server kan ook ping sturen
  | PongMessage
  | WelcomeMessage;          // Server welcome bij connect

/**
 * Union type voor alle uitgaande berichten
 */
export type WebSocketOutgoingMessage =
  | SubscribeMessage
  | UnsubscribeMessage
  | PingMessage
  | PongMessage;             // Client kan ook pong sturen

/**
 * WebSocket Connection State
 */
export type ConnectionState = 
  | 'disconnected'   // Niet verbonden
  | 'connecting'     // Aan het verbinden
  | 'connected'      // Verbonden en klaar
  | 'reconnecting'   // Aan het herverbinden na disconnect
  | 'error';         // Fout opgetreden

/**
 * WebSocket Hook Return Type
 */
export interface UseStepsWebSocketReturn {
  // Connection status
  connected: boolean;
  connectionState: ConnectionState;
  
  // Latest updates
  latestUpdate: StepUpdateMessage | null;
  totalSteps: number;
  leaderboard: LeaderboardEntry[];
  
  // Actions
  subscribe: (channels: string[]) => void;
  unsubscribe: (channels: string[]) => void;
  syncSteps: (delta: number) => Promise<void>;
  disconnect: () => void;
  reconnect: () => void;
}

/**
 * WebSocket Configuration
 */
export interface WebSocketConfig {
  url: string;                    // WebSocket URL (ws:// or wss://)
  reconnectInterval?: number;     // Tijd tussen reconnect pogingen (ms)
  maxReconnectInterval?: number;  // Max tijd tussen reconnects (ms)
  pingInterval?: number;          // Keep-alive ping interval (ms)
  autoConnect?: boolean;          // Auto-connect bij mount
  debug?: boolean;                // Debug logging
}

/**
 * Offline Queue Item
 * Voor steps die offline zijn toegevoegd
 */
export interface QueuedStepUpdate {
  delta: number;
  timestamp: number;
  synced: boolean;
}

/**
 * WebSocket Error Types
 */
export class WebSocketConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebSocketConnectionError';
  }
}

export class WebSocketTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebSocketTimeoutError';
  }
}

/**
 * Channel Names - Voor type-safe subscribe/unsubscribe
 */
export const WEBSOCKET_CHANNELS = {
  STEP_UPDATES: 'step_updates',
  TOTAL_UPDATES: 'total_updates',
  LEADERBOARD_UPDATES: 'leaderboard_updates',
  BADGE_EARNED: 'badge_earned',
} as const;

export type WebSocketChannel = typeof WEBSOCKET_CHANNELS[keyof typeof WEBSOCKET_CHANNELS];