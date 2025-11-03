/**
 * useEventMutations Hook
 * 
 * CRUD mutations voor event management (admin only).
 * Gebruikt React Query mutations met optimistic updates.
 * 
 * Features:
 * - Create event
 * - Update event
 * - Delete event
 * - Toggle is_active status
 * - Optimistic updates voor snelle UX
 * 
 * @example
 * ```typescript
 * const { toggleActive, deleteEvent, isLoading } = useEventMutations();
 * 
 * toggleActive.mutate({ eventId, isActive: true });
 * deleteEvent.mutate(eventId);
 * ```
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../services/api';
import type { EventData, BackendGeofence, EventConfig } from '../types/geofencing';
import { logger } from '../utils/logger';
import { haptics } from '../utils/haptics';

/**
 * Create event request
 */
interface CreateEventRequest {
  name: string;
  description?: string;
  start_time: string; // ISO 8601
  end_time?: string; // ISO 8601
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled';
  is_active?: boolean;
  geofences: BackendGeofence[];
  event_config?: EventConfig;
}

/**
 * Update event request (partial)
 */
interface UpdateEventRequest {
  eventId: string;
  name?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled';
  is_active?: boolean;
  geofences?: BackendGeofence[];
  event_config?: EventConfig;
}

/**
 * Toggle active request
 */
interface ToggleActiveRequest {
  eventId: string;
  isActive: boolean;
}

export function useEventMutations() {
  const queryClient = useQueryClient();

  /**
   * Create new event
   */
  const createEvent = useMutation({
    mutationFn: async (data: CreateEventRequest): Promise<EventData> => {
      logger.info('Creating event:', { name: data.name });
      
      const response = await apiFetch<EventData>('/events', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      logger.info('Event created successfully:', response.id);
      await haptics.success();
      return response;
    },
    onSuccess: () => {
      // Invalidate events cache om lijst te refreshen
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      logger.error('Failed to create event:', error);
      haptics.error();
    },
  });

  /**
   * Update existing event
   */
  const updateEvent = useMutation({
    mutationFn: async ({ eventId, ...data }: UpdateEventRequest): Promise<EventData> => {
      logger.info('Updating event:', eventId);
      
      const response = await apiFetch<EventData>(`/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      logger.info('Event updated successfully');
      await haptics.success();
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      logger.error('Failed to update event:', error);
      haptics.error();
    },
  });

  /**
   * Delete event
   */
  const deleteEvent = useMutation({
    mutationFn: async (eventId: string): Promise<void> => {
      logger.info('Deleting event:', eventId);
      
      await apiFetch(`/events/${eventId}`, {
        method: 'DELETE',
      });

      logger.info('Event deleted successfully');
      await haptics.success();
    },
    // Optimistic update
    onMutate: async (eventId) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['events'] });

      // Snapshot previous value
      const previousEvents = queryClient.getQueryData<EventData[]>(['events']);

      // Optimistically remove from cache
      queryClient.setQueryData<EventData[]>(['events'], (old) =>
        old ? old.filter((event) => event.id !== eventId) : []
      );

      return { previousEvents };
    },
    onError: (error, eventId, context) => {
      // Rollback on error
      if (context?.previousEvents) {
        queryClient.setQueryData(['events'], context.previousEvents);
      }
      logger.error('Failed to delete event:', error);
      haptics.error();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  /**
   * Toggle event active status (quick action)
   */
  const toggleActive = useMutation({
    mutationFn: async ({ eventId, isActive }: ToggleActiveRequest): Promise<EventData> => {
      logger.info(`Toggling event ${eventId} to ${isActive ? 'active' : 'inactive'}`);
      
      const response = await apiFetch<EventData>(`/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          is_active: isActive,
          status: isActive ? 'active' : 'upcoming',
        }),
      });

      await haptics.light();
      return response;
    },
    // Optimistic update
    onMutate: async ({ eventId, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ['events'] });
      
      const previousEvents = queryClient.getQueryData<EventData[]>(['events']);

      // Optimistically update cache
      queryClient.setQueryData<EventData[]>(['events'], (old) =>
        old ? old.map((event) =>
          event.id === eventId
            ? { ...event, is_active: isActive, status: isActive ? 'active' : 'upcoming' }
            : event
        ) : []
      );

      return { previousEvents };
    },
    onError: (error, variables, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['events'], context.previousEvents);
      }
      logger.error('Failed to toggle event:', error);
      haptics.error();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    toggleActive,
    isLoading: createEvent.isPending || updateEvent.isPending || deleteEvent.isPending,
  };
}