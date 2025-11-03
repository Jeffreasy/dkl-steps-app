/**
 * useUndoRedo Hook
 * 
 * Provides undo/redo functionality with history stack management.
 * Tracks actions and allows reverting changes with automatic cleanup.
 * 
 * @example
 * ```typescript
 * const { canUndo, canRedo, undo, redo, addToHistory, clearHistory } = useUndoRedo({
 *   maxHistorySize: 50
 * });
 * 
 * // Add action to history
 * addToHistory({
 *   type: 'update',
 *   undo: () => updateMutation({ id, oldValue }),
 *   redo: () => updateMutation({ id, newValue }),
 *   description: 'Updated route amount'
 * });
 * 
 * // Undo/Redo
 * if (canUndo) undo();
 * if (canRedo) redo();
 * ```
 */

import { useState, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

export interface HistoryAction {
  type: 'create' | 'update' | 'delete' | 'batch';
  undo: () => void | Promise<void>;
  redo: () => void | Promise<void>;
  description: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface UseUndoRedoOptions {
  maxHistorySize?: number;
  onUndo?: (action: HistoryAction) => void;
  onRedo?: (action: HistoryAction) => void;
}

interface UseUndoRedoReturn {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  addToHistory: (action: Omit<HistoryAction, 'timestamp'>) => void;
  clearHistory: () => void;
  history: HistoryAction[];
  futureHistory: HistoryAction[];
  historySize: number;
}

export function useUndoRedo(options: UseUndoRedoOptions = {}): UseUndoRedoReturn {
  const { maxHistorySize = 50, onUndo, onRedo } = options;
  
  const [history, setHistory] = useState<HistoryAction[]>([]);
  const [futureHistory, setFutureHistory] = useState<HistoryAction[]>([]);
  const isExecutingRef = useRef(false);

  /**
   * Add action to history stack
   */
  const addToHistory = useCallback((action: Omit<HistoryAction, 'timestamp'>) => {
    const newAction: HistoryAction = {
      ...action,
      timestamp: Date.now(),
    };

    setHistory(prev => {
      const newHistory = [...prev, newAction];
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        return newHistory.slice(-maxHistorySize);
      }
      
      return newHistory;
    });

    // Clear future history when new action is added
    setFutureHistory([]);

    logger.debug('Action added to history:', {
      type: action.type,
      description: action.description,
      historySize: history.length + 1,
    });
  }, [maxHistorySize, history.length]);

  /**
   * Undo last action
   */
  const undo = useCallback(async () => {
    if (history.length === 0 || isExecutingRef.current) {
      return;
    }

    isExecutingRef.current = true;

    try {
      const lastAction = history[history.length - 1];
      
      logger.debug('Undoing action:', {
        type: lastAction.type,
        description: lastAction.description,
      });

      // Execute undo
      await lastAction.undo();

      // Move to future history
      setHistory(prev => prev.slice(0, -1));
      setFutureHistory(prev => [...prev, lastAction]);

      if (onUndo) {
        onUndo(lastAction);
      }
    } catch (error) {
      logger.error('Undo failed:', error);
      throw error;
    } finally {
      isExecutingRef.current = false;
    }
  }, [history, onUndo]);

  /**
   * Redo last undone action
   */
  const redo = useCallback(async () => {
    if (futureHistory.length === 0 || isExecutingRef.current) {
      return;
    }

    isExecutingRef.current = true;

    try {
      const nextAction = futureHistory[futureHistory.length - 1];
      
      logger.debug('Redoing action:', {
        type: nextAction.type,
        description: nextAction.description,
      });

      // Execute redo
      await nextAction.redo();

      // Move back to history
      setFutureHistory(prev => prev.slice(0, -1));
      setHistory(prev => [...prev, nextAction]);

      if (onRedo) {
        onRedo(nextAction);
      }
    } catch (error) {
      logger.error('Redo failed:', error);
      throw error;
    } finally {
      isExecutingRef.current = false;
    }
  }, [futureHistory, onRedo]);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    setFutureHistory([]);
    logger.debug('History cleared');
  }, []);

  return {
    canUndo: history.length > 0 && !isExecutingRef.current,
    canRedo: futureHistory.length > 0 && !isExecutingRef.current,
    undo,
    redo,
    addToHistory,
    clearHistory,
    history,
    futureHistory,
    historySize: history.length,
  };
}