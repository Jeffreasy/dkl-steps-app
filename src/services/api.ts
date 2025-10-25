import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import {
  APIError,
  NetworkError,
  TimeoutError,
  isAPIError,
  type APIFetchOptions
} from '../types';
import { logger } from '../utils/logger';

const BASE_URL = Constants.expoConfig?.extra?.BACKEND_URL || 'https://dklemailservice.onrender.com/api';

/**
 * Enhanced API fetch with retry logic, timeout, and proper error handling
 *
 * @param endpoint - API endpoint (e.g., '/auth/login')
 * @param options - Fetch options with optional retry/timeout config
 * @param isTestMode - Enable test mode header
 * @returns Parsed JSON response
 * @throws {APIError} For HTTP errors with status codes
 * @throws {NetworkError} For network connectivity issues
 * @throws {TimeoutError} For request timeouts
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: APIFetchOptions = {},
  isTestMode = false
): Promise<T> {
  const {
    retries = 3,
    timeout = 10000,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  const token = await AsyncStorage.getItem('authToken');
  
  // Debug logging (development only)
  logger.api(endpoint, 'Token:', token ? `${token.substring(0, 20)}...` : 'NONE');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isTestMode ? { 'X-Test-Mode': 'true' } : {}),
    ...fetchOptions.headers,
  };

  // Retry loop with exponential backoff
  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Debug logging (development only)
      logger.api(endpoint, 'Status:', response.status);

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = getErrorMessage(response.status, errorData);
        throw new APIError(response.status, message, errorData);
      }

      // Success - return parsed JSON
      return await response.json();

    } catch (error: unknown) {
      clearTimeout(timeoutId);

      // Handle AbortController timeout
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new TimeoutError(`Request timeout na ${timeout}ms`);
        
        // Don't retry on last attempt
        if (attempt === retries - 1) {
          throw timeoutError;
        }
        
        // Retry with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        logger.info(`Timeout - Retry ${attempt + 1}/${retries} na ${delay}ms voor ${endpoint}`);
        await sleep(delay);
        continue;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('Network')) {
        const networkError = new NetworkError('Geen internetverbinding');
        
        // Don't retry on last attempt
        if (attempt === retries - 1) {
          throw networkError;
        }
        
        // Retry with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        logger.info(`Network error - Retry ${attempt + 1}/${retries} na ${delay}ms voor ${endpoint}`);
        await sleep(delay);
        continue;
      }

      // Don't retry on authentication errors (401, 403)
      if (isAPIError(error) && error.isAuthError()) {
        throw error;
      }

      // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
      if (isAPIError(error) && error.isClientError()) {
        if (error.statusCode !== 408 && error.statusCode !== 429) {
          throw error;
        }
      }

      // Last attempt - throw error
      if (attempt === retries - 1) {
        throw error;
      }

      // Retry with exponential backoff
      const delay = retryDelay * Math.pow(2, attempt);
      logger.info(`Error - Retry ${attempt + 1}/${retries} na ${delay}ms voor ${endpoint}`);
      await sleep(delay);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw new Error('Unexpected: Reached end of retry loop');
}

/**
 * Get user-friendly error message based on status code
 */
function getErrorMessage(status: number, errorData: any): string {
  const message = errorData?.message || '';
  
  switch (status) {
    case 400:
      return message || 'Ongeldige request (400)';
    case 401:
      return 'Niet geauthenticeerd (401)';
    case 403:
      return 'Geen toestemming (403)';
    case 404:
      return message || 'Niet gevonden (404)';
    case 408:
      return 'Request timeout (408)';
    case 429:
      return 'Te veel requests, probeer later opnieuw (429)';
    case 500:
      return 'Server fout (500)';
    case 502:
      return 'Bad Gateway - Server tijdelijk niet bereikbaar (502)';
    case 503:
      return 'Service Unavailable - Server tijdelijk niet bereikbaar (503)';
    case 504:
      return 'Gateway Timeout - Server reageert niet (504)';
    default:
      return message || `API fout (${status})`;
  }
}

/**
 * Helper function to sleep/delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}