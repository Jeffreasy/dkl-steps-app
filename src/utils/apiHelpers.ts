/**
 * API Helper Utilities
 * Helper functies voor API data transformatie en validatie
 */

import { logger } from './logger';
import type { RouteFund } from '../types';

/**
 * Transform en valideer route funds API response
 * Handelt verschillende backend response formats af en normaliseert naar RouteFund[]
 * 
 * @param result - Raw API response
 * @returns Validated and transformed RouteFund array
 * @throws Error als response format ongeldig is
 */
export function transformRouteFundsResponse(result: any): RouteFund[] {
  // Handle null/undefined
  if (!result) {
    logger.warn('Empty response from route funds API');
    return [];
  }
  
  // Validate array format
  if (!Array.isArray(result)) {
    logger.error('Expected array but got:', typeof result, result);
    throw new Error('Invalid API response: verwacht array van routes');
  }
  
  // Transform each item to ensure consistent structure
  const transformed: RouteFund[] = result.map((item: any, index: number) => {
    // Generate fallback ID if missing (backend compatibility)
    const id = item.id || item._id || `${item.route || 'route'}-${index}`;
    
    // Extract route name (support multiple field names)
    const route = item.route || item.name || 'Unknown';
    
    // Parse amount (handle string/number)
    const amount = typeof item.amount === 'number' 
      ? item.amount 
      : parseInt(item.amount) || 0;
    
    // Validate required fields
    if (!route || typeof amount !== 'number') {
      logger.warn(`Invalid route fund item at index ${index}:`, item);
    }
    
    return {
      id,
      route,
      amount,
    };
  });
  
  logger.debug(`Transformed ${transformed.length} route funds`);
  return transformed;
}

/**
 * Validate single route fund object
 * @param item - Item to validate
 * @returns true if valid
 */
export function isValidRouteFund(item: any): item is RouteFund {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.route === 'string' &&
    typeof item.amount === 'number' &&
    item.route.length > 0
  );
}

/**
 * Sanitize route fund data voor API requests
 * @param data - Route fund data
 * @returns Sanitized data
 */
export function sanitizeRouteFundData(data: Partial<RouteFund>): {
  route: string;
  amount: number;
} {
  const route = (data.route || '').trim();
  const amount = typeof data.amount === 'number' ? data.amount : 0;
  
  if (!route) {
    throw new Error('Route naam is verplicht');
  }
  
  if (amount < 0) {
    throw new Error('Bedrag kan niet negatief zijn');
  }
  
  return { route, amount };
}