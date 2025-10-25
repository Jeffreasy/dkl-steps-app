/**
 * Error Type Definitions
 * Centrale error types voor consistent error handling
 */

/**
 * Custom API Error Class
 * Uitgebreide error met status code en additional data
 * 
 * @example
 * throw new APIError(401, 'Niet geauthenticeerd', { reason: 'Token expired' });
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'APIError';
    
    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }

  /**
   * Check if error is authentication related
   */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  /**
   * Check if error is client error (4xx)
   */
  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if error is server error (5xx)
   */
  isServerError(): boolean {
    return this.statusCode >= 500 && this.statusCode < 600;
  }
}

/**
 * Network Error Class
 * Voor network connectivity issues
 */
export class NetworkError extends Error {
  constructor(message: string = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NetworkError);
    }
  }
}

/**
 * Timeout Error Class
 * Voor request timeouts
 */
export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TimeoutError);
    }
  }
}

/**
 * Type guard voor APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Type guard voor NetworkError
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Type guard voor TimeoutError
 */
export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError;
}

/**
 * Type guard voor Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Safe error message extraction
 * Extraheert een message van elke error type
 * 
 * @example
 * try { ... } catch (error) {
 *   const message = getErrorMessage(error);
 *   console.error(message);
 * }
 */
export function getErrorMessage(error: unknown): string {
  if (isAPIError(error)) {
    return error.message;
  }
  
  if (isError(error)) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Er ging iets mis';
}