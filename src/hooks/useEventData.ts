/**
 * useEventData Hook
 *
 * Fetch event data met React Query voor caching en retry logic.
 * Gebruikt de bestaande apiFetch met retry 3x zoals in de app.
 * Integreert met backend GET /api/events endpoint.
 *
 * Features:
 * - React Query caching (5 min stale time)
 * - Automatic retry (3x zoals in apiFetch)
 * - Active event detection (tussen start_time en end_time)
 * - Refetch on window focus
 * - Loading en error states
 *
 * @example
 * ```typescript
 * const { activeEvent, isLoading, error, refetch } = useEventData();
 *
 * if (activeEvent) {
 *   console.log('Active event:', activeEvent.name);
 *   console.log('Geofences:', activeEvent.geofences);
 * }
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/api';
import type { EventData } from '../types/geofencing';
import { isEventCurrentlyActive } from '../types/geofencing';
import { logger } from '../utils/logger';

/**
 * Fetch all events from API
 */
async function fetchEvents(): Promise<EventData[]> {
  try {
    // Backend GET /api/events returns array directly
    const events = await apiFetch<EventData[]>('/events', {
      method: 'GET',
      retries: 3, // Retry 3x zoals in je app
      timeout: 10000,
    });

    if (!Array.isArray(events)) {
      throw new Error('Invalid response from events API - expected array');
    }

    logger.info(`Fetched ${events.length} events`);
    
    // Debug: Log event details
    events.forEach((event, index) => {
      const isActive = isEventCurrentlyActive(event);
      logger.info(`Event ${index + 1}: "${event.name}"`, {
        is_active: event.is_active,
        status: event.status,
        isCurrentlyActive: isActive,
        start_time: event.start_time,
        end_time: event.end_time,
        geofences: event.geofences?.length ?? 0,
      });
    });
    
    return events;
  } catch (error) {
    logger.error('Failed to fetch events:', error);
    throw error;
  }
}

/**
 * Fetch active event from API
 * Uses dedicated GET /api/events/active endpoint
 * Returns null if no active event (404) instead of throwing
 */
async function fetchActiveEvent(): Promise<EventData | null> {
  try {
    const event = await apiFetch<EventData>('/events/active', {
      method: 'GET',
      retries: 3,
      timeout: 10000,
    });

    logger.info(`Fetched active event: ${event.name}`);
    return event;
  } catch (error: any) {
    // 404 is normal - geen actief event
    if (error?.statusCode === 404) {
      logger.info('No active event found (404) - this is normal');
      return null;
    }
    
    // Network errors zijn ook OK - graceful degradation
    if (error?.message?.includes('Network') || error?.message?.includes('timeout')) {
      logger.warn('Network error fetching events - will retry later');
      return null;
    }
    
    // Andere errors loggen maar niet crashen
    logger.error('Failed to fetch active event:', error);
    return null; // Graceful degradation - app blijft werken
  }
}

interface UseEventDataReturn {
  /**
   * Alle events (active + inactive)
   */
  events: EventData[];
  
  /**
   * Eerste actieve event (of null)
   */
  activeEvent: EventData | null;
  
  /**
   * Alle actieve events
   */
  activeEvents: EventData[];
  
  /**
   * Loading state
   */
  isLoading: boolean;
  
  /**
   * Error (indien fetch failed)
   */
  error: Error | null;
  
  /**
   * Refetch events
   */
  refetch: () => void;
  
  /**
   * Is query stale (cache expired)
   */
  isStale: boolean;
}

/**
 * Hook options
 */
interface UseEventDataOptions {
  /**
   * Enable automatic refetching
   * Default: true
   */
  enabled?: boolean;
  
  /**
   * Refetch interval (in ms)
   * Default: 5 minutes
   */
  refetchInterval?: number;
  
  /**
   * Stale time (in ms) - how long data is considered fresh
   * Default: 5 minutes
   */
  staleTime?: number;
}

/**
 * useEventData hook
 */
export function useEventData(options: UseEventDataOptions = {}): UseEventDataReturn {
  const {
    enabled = true,
    refetchInterval = 5 * 60 * 1000, // 5 minuten
    staleTime = 5 * 60 * 1000, // 5 minuten
  } = options;

  const {
    data: events = [],
    isLoading,
    error,
    refetch,
    isStale,
  } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    enabled,
    staleTime,
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes (was cacheTime in v4)
    refetchOnWindowFocus: true, // Refetch when user returns to app
    refetchInterval, // Auto-refetch every 5 minutes
    retry: false, // apiFetch already has retry logic (3x)
  });

  // Filter active events (gebruik is_active van backend + tijd check)
  const activeEvents = events.filter(event => {
    const currentlyActive = isEventCurrentlyActive(event);
    const result = event.is_active && currentlyActive;
    
    if (!result) {
      logger.info(`Event "${event.name}" filtered out:`, {
        is_active: event.is_active,
        currentlyActive,
        reason: !event.is_active ? 'is_active=false' : 'not between start/end time',
      });
    }
    
    return result;
  });
  
  // Get first active event (of null)
  const activeEvent = activeEvents.length > 0 ? activeEvents[0] : null;
  
  logger.info(`Active events: ${activeEvents.length}/${events.length}`, {
    activeEventName: activeEvent?.name ?? 'No active event',
  });

  return {
    events,
    activeEvent,
    activeEvents,
    isLoading,
    error: error as Error | null,
    refetch: () => {
      refetch();
    },
    isStale,
  };
}

/**
 * Helper hook: Get specific event by ID
 */
export function useEvent(eventId: string | null): {
  event: EventData | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { events, isLoading, error } = useEventData();
  
  const event = eventId 
    ? events.find(e => e.id === eventId) ?? null
    : null;
  
  return { event, isLoading, error };
}

/**
 * Helper: Check if any event is currently active
 */
export function useHasActiveEvent(): boolean {
  const { activeEvent, isLoading } = useEventData();
  return !isLoading && activeEvent !== null;
}