/**
 * useAuditLog Hook
 * 
 * Tracks user actions and maintains an audit trail for compliance and debugging.
 * Logs who did what, when, and optionally syncs to backend.
 * 
 * @example
 * ```typescript
 * const { logAction, getAuditLog, clearLog } = useAuditLog({
 *   persistToBackend: true,
 *   maxLogSize: 1000
 * });
 * 
 * // Log an action
 * logAction({
 *   action: 'create',
 *   resource: 'route_fund',
 *   resourceId: '123',
 *   details: { route: '5 KM', amount: 100 },
 *   userId: user.id,
 *   userName: user.naam
 * });
 * ```
 */

import { useState, useCallback, useEffect } from 'react';
import { storage } from '../utils/storage';
import { logger } from '../utils/logger';
import { apiFetch } from '../services/api';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: 'create' | 'update' | 'delete' | 'batch_delete' | 'import' | 'export';
  resource: string;
  resourceId?: string;
  userId: string;
  userName: string;
  details?: Record<string, any>;
  previousValue?: any;
  newValue?: any;
  ipAddress?: string;
}

interface UseAuditLogOptions {
  persistToBackend?: boolean;
  persistToLocal?: boolean;
  maxLogSize?: number;
  storageKey?: string;
}

interface UseAuditLogReturn {
  logAction: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => Promise<void>;
  getAuditLog: (filters?: AuditLogFilters) => AuditLogEntry[];
  clearLog: () => Promise<void>;
  exportLog: () => string;
  auditLog: AuditLogEntry[];
  isLogging: boolean;
}

interface AuditLogFilters {
  action?: string;
  resource?: string;
  userId?: string;
  startDate?: number;
  endDate?: number;
}

const STORAGE_KEY = 'auditLog';

export function useAuditLog(options: UseAuditLogOptions = {}): UseAuditLogReturn {
  const {
    persistToBackend = false,
    persistToLocal = true,
    maxLogSize = 1000,
    storageKey = STORAGE_KEY,
  } = options;

  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [isLogging, setIsLogging] = useState(false);

  /**
   * Load audit log from storage on mount
   */
  useEffect(() => {
    const loadLog = async () => {
      if (persistToLocal) {
        try {
          const stored = await storage.getItem(storageKey);
          if (stored) {
            const parsed = JSON.parse(stored) as AuditLogEntry[];
            setAuditLog(parsed);
            logger.debug('Audit log loaded:', { entries: parsed.length });
          }
        } catch (error) {
          logger.error('Failed to load audit log:', error);
        }
      }
    };

    loadLog();
  }, [persistToLocal, storageKey]);

  /**
   * Log an action
   */
  const logAction = useCallback(async (
    entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
  ) => {
    setIsLogging(true);

    try {
      const logEntry: AuditLogEntry = {
        ...entry,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      // Add to state
      setAuditLog(prev => {
        const newLog = [...prev, logEntry];
        
        // Limit log size
        if (newLog.length > maxLogSize) {
          const trimmed = newLog.slice(-maxLogSize);
          
          // Persist trimmed log
          if (persistToLocal) {
            storage.setItem(storageKey, JSON.stringify(trimmed));
          }
          
          return trimmed;
        }
        
        // Persist to local storage
        if (persistToLocal) {
          storage.setItem(storageKey, JSON.stringify(newLog));
        }
        
        return newLog;
      });

      // Persist to backend if enabled
      if (persistToBackend) {
        try {
          await apiFetch('/audit-log', {
            method: 'POST',
            body: JSON.stringify(logEntry),
          });
        } catch (error) {
          logger.error('Failed to persist audit log to backend:', error);
          // Don't throw - local logging still succeeded
        }
      }

      logger.debug('Audit log entry created:', {
        action: entry.action,
        resource: entry.resource,
        user: entry.userName,
      });
    } catch (error) {
      logger.error('Failed to log action:', error);
      throw error;
    } finally {
      setIsLogging(false);
    }
  }, [maxLogSize, persistToBackend, persistToLocal, storageKey]);

  /**
   * Get filtered audit log
   */
  const getAuditLog = useCallback((filters?: AuditLogFilters): AuditLogEntry[] => {
    if (!filters) {
      return auditLog;
    }

    return auditLog.filter(entry => {
      if (filters.action && entry.action !== filters.action) return false;
      if (filters.resource && entry.resource !== filters.resource) return false;
      if (filters.userId && entry.userId !== filters.userId) return false;
      if (filters.startDate && entry.timestamp < filters.startDate) return false;
      if (filters.endDate && entry.timestamp > filters.endDate) return false;
      return true;
    });
  }, [auditLog]);

  /**
   * Clear audit log
   */
  const clearLog = useCallback(async () => {
    setAuditLog([]);
    
    if (persistToLocal) {
      await storage.removeItem(storageKey);
    }
    
    logger.debug('Audit log cleared');
  }, [persistToLocal, storageKey]);

  /**
   * Export audit log as JSON string
   */
  const exportLog = useCallback((): string => {
    return JSON.stringify(auditLog, null, 2);
  }, [auditLog]);

  return {
    logAction,
    getAuditLog,
    clearLog,
    exportLog,
    auditLog,
    isLogging,
  };
}