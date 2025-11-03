/**
 * useOptimisticMutations Hook
 * 
 * Provides optimistic updates for CRUD operations with automatic rollback on error.
 * Updates UI immediately before server response for better UX.
 * 
 * @example
 * ```typescript
 * const { optimisticUpdate, optimisticDelete, optimisticCreate } = useOptimisticMutations({
 *   queryKey: ['adminRouteFunds'],
 *   onError: (error) => Alert.alert('Error', error.message)
 * });
 * 
 * // Usage
 * optimisticUpdate(itemId, { amount: newAmount });
 * ```
 */

import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useCallback } from 'react';
import { logger } from '../utils/logger';

interface OptimisticMutationOptions<T = any> {
  queryKey: QueryKey;
  onError?: (error: unknown, rollbackData: any) => void;
  onSuccess?: (data?: T) => void;
}

interface OptimisticMutationHook<T = any> {
  optimisticUpdate: (id: string, updates: Partial<T>) => void;
  optimisticDelete: (id: string) => void;
  optimisticCreate: (item: T) => void;
  rollback: () => void;
}

export function useOptimisticMutations<T extends { id: string }>(
  options: OptimisticMutationOptions<T>
): OptimisticMutationHook<T> {
  const { queryKey, onError, onSuccess } = options;
  const queryClient = useQueryClient();

  /**
   * Store previous data for rollback
   */
  let previousData: T[] | undefined;

  /**
   * Optimistically update an item
   */
  const optimisticUpdate = useCallback((id: string, updates: Partial<T>) => {
    // Cancel outgoing refetches
    queryClient.cancelQueries({ queryKey });

    // Snapshot previous value
    previousData = queryClient.getQueryData<T[]>(queryKey);

    // Optimistically update
    queryClient.setQueryData<T[]>(queryKey, (old = []) => {
      return old.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
    });

    logger.debug('Optimistic update applied:', { id, updates });

    return {
      previousData,
      rollback: () => {
        if (previousData) {
          queryClient.setQueryData(queryKey, previousData);
        }
      }
    };
  }, [queryKey, queryClient]);

  /**
   * Optimistically delete an item
   */
  const optimisticDelete = useCallback((id: string) => {
    // Cancel outgoing refetches
    queryClient.cancelQueries({ queryKey });

    // Snapshot previous value
    previousData = queryClient.getQueryData<T[]>(queryKey);

    // Optimistically remove
    queryClient.setQueryData<T[]>(queryKey, (old = []) => {
      return old.filter(item => item.id !== id);
    });

    logger.debug('Optimistic delete applied:', { id });

    return {
      previousData,
      rollback: () => {
        if (previousData) {
          queryClient.setQueryData(queryKey, previousData);
        }
      }
    };
  }, [queryKey, queryClient]);

  /**
   * Optimistically create an item
   */
  const optimisticCreate = useCallback((item: T) => {
    // Cancel outgoing refetches
    queryClient.cancelQueries({ queryKey });

    // Snapshot previous value
    previousData = queryClient.getQueryData<T[]>(queryKey);

    // Optimistically add
    queryClient.setQueryData<T[]>(queryKey, (old = []) => {
      return [...old, item];
    });

    logger.debug('Optimistic create applied:', { item });

    return {
      previousData,
      rollback: () => {
        if (previousData) {
          queryClient.setQueryData(queryKey, previousData);
        }
      }
    };
  }, [queryKey, queryClient]);

  /**
   * Manual rollback function
   */
  const rollback = useCallback(() => {
    if (previousData) {
      queryClient.setQueryData(queryKey, previousData);
      logger.debug('Manual rollback executed');
    }
  }, [queryKey, queryClient]);

  return {
    optimisticUpdate,
    optimisticDelete,
    optimisticCreate,
    rollback,
  };
}