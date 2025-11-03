/**
 * Logger Utility
 * 
 * Centrale logging service die alleen in development mode actieve logs toont.
 * In production worden debug en info logs automatisch onderdrukt.
 * 
 * @example
 * ```typescript
 * import { logger } from '@/utils/logger';
 * 
 * logger.debug('User data:', userData);    // Alleen in dev
 * logger.info('API call started');          // Alleen in dev
 * logger.warn('Deprecated method used');    // Altijd
 * logger.error('Failed to fetch data');     // Altijd
 * logger.api('GET /users', response);       // Alleen in dev
 * ```
 */

const isDevelopment = __DEV__;

// Allow disabling debug/info logs even in development
const ENABLE_DEBUG_LOGS = false; // Set to true to enable debug spam
const ENABLE_API_LOGS = false;   // Set to true to enable API logs

/**
 * Format timestamp voor log entries
 */
const getTimestamp = (): string => {
  const now = new Date();
  return now.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
};

/**
 * Logger interface met verschillende log levels
 */
export const logger = {
  /**
   * Debug logs - alleen in development
   * Gebruik voor gedetailleerde debugging informatie
   */
  debug: (...args: any[]) => {
    if (isDevelopment && ENABLE_DEBUG_LOGS) {
      console.log(`[${getTimestamp()}] 🐛 DEBUG:`, ...args);
    }
  },

  /**
   * Info logs - alleen in development
   * Gebruik voor algemene informatie over app flow
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(`[${getTimestamp()}] ℹ️  INFO:`, ...args);
    }
  },

  /**
   * Warning logs - altijd getoond
   * Gebruik voor potentiële problemen die aandacht verdienen
   */
  warn: (...args: any[]) => {
    console.warn(`[${getTimestamp()}] ⚠️  WARN:`, ...args);
  },

  /**
   * Error logs - altijd getoond
   * Gebruik voor errors die user experience beïnvloeden
   */
  error: (...args: any[]) => {
    console.error(`[${getTimestamp()}] ❌ ERROR:`, ...args);
    
    // Optioneel: integreer met error tracking service
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureException(args[0]);
    // }
  },

  /**
   * API logs - alleen in development
   * Specifiek voor API calls en responses
   */
  api: (endpoint: string, ...args: any[]) => {
    if (isDevelopment && ENABLE_API_LOGS) {
      console.log(`[${getTimestamp()}] 🌐 API:`, endpoint, ...args);
    }
  },

  /**
   * Success logs - alleen in development
   * Gebruik voor succesvolle operaties
   */
  success: (...args: any[]) => {
    if (isDevelopment) {
      console.log(`[${getTimestamp()}] ✅ SUCCESS:`, ...args);
    }
  },

  /**
   * Performance logs - alleen in development
   * Gebruik voor performance measurements
   */
  perf: (label: string, duration: number) => {
    if (isDevelopment) {
      console.log(`[${getTimestamp()}] ⚡ PERF: ${label} took ${duration.toFixed(2)}ms`);
    }
  },

  /**
   * Group logs - alleen in development
   * Gebruik om gerelateerde logs te groeperen
   */
  group: (label: string, collapsed = false) => {
    if (isDevelopment) {
      if (collapsed) {
        console.groupCollapsed(`[${getTimestamp()}] 📁 ${label}`);
      } else {
        console.group(`[${getTimestamp()}] 📁 ${label}`);
      }
    }
  },

  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },

  /**
   * Table logs - alleen in development
   * Gebruik voor tabular data display
   */
  table: (data: any) => {
    if (isDevelopment) {
      console.table(data);
    }
  },

  /**
   * Performance timer utility
   * Gebruik om execution tijd te meten
   *
   * @example
   * ```typescript
   * const timer = logger.timer('API Call');
   * await fetchData();
   * timer.end(); // Logs: "⚡ PERF: API Call took 125.42ms"
   * ```
   */
  timer: (label: string) => {
    const start = performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - start;
        logger.perf(label, duration);
        return duration;
      },
    };
  },
};

/**
 * Type-safe logger instance export
 */
export type Logger = typeof logger;

/**
 * Default export
 */
export default logger;