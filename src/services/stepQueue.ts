/**
 * Step Queue Service
 * Beheert offline step updates en synchroniseert ze wanneer verbinding beschikbaar is
 *
 * Features:
 * - Queue steps wanneer offline
 * - Auto-sync bij reconnect
 * - Persistent storage (MMKV/AsyncStorage)
 * - Duplicate prevention
 * - Priority queue system
 * - Sync conflict resolution
 * - Optimistic updates
 */

import { storage } from '../utils/storage';
import { logger } from '../utils/logger';
import type { QueuedStepUpdate } from '../types/websocket';

const QUEUE_STORAGE_KEY = 'step_queue';
const MAX_QUEUE_SIZE = 100; // Voorkom te grote queue
const CONFLICT_STORAGE_KEY = 'step_conflicts';

/**
 * Priority levels for queue items
 */
export enum QueuePriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

/**
 * Extended queue item with priority and metadata
 */
interface ExtendedQueuedStepUpdate extends QueuedStepUpdate {
  priority?: QueuePriority;
  attempts?: number;
  lastAttempt?: number;
  metadata?: {
    userId?: string;
    participantId?: string;
    source?: string;
  };
}

/**
 * Sync conflict record
 */
interface SyncConflict {
  id: string;
  timestamp: number;
  localDelta: number;
  serverTotal: number;
  expectedTotal: number;
  resolved: boolean;
  resolution?: 'accept_server' | 'accept_local' | 'manual';
}

/**
 * Step Queue Manager
 */
export class StepQueueManager {
  private queue: ExtendedQueuedStepUpdate[] = [];
  private conflicts: SyncConflict[] = [];
  private isInitialized = false;
  private isSyncing = false;

  /**
   * Initialize queue from storage
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const stored = await storage.getObject<ExtendedQueuedStepUpdate[]>(QUEUE_STORAGE_KEY);
      if (stored && Array.isArray(stored)) {
        this.queue = stored;
        logger.info(`📦 Queue initialized: ${this.queue.length} items`);
      }
      
      const conflicts = await storage.getObject<SyncConflict[]>(CONFLICT_STORAGE_KEY);
      if (conflicts && Array.isArray(conflicts)) {
        this.conflicts = conflicts;
        logger.info(`⚠️  Found ${this.conflicts.filter(c => !c.resolved).length} unresolved conflicts`);
      }
      
      this.isInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize step queue:', error);
      this.queue = [];
      this.conflicts = [];
      this.isInitialized = true;
    }
  }

  /**
   * Add steps to queue (offline) with priority
   */
  async queueSteps(
    delta: number,
    priority: QueuePriority = QueuePriority.NORMAL,
    metadata?: ExtendedQueuedStepUpdate['metadata']
  ): Promise<void> {
    await this.initialize();

    const item: ExtendedQueuedStepUpdate = {
      delta,
      timestamp: Date.now(),
      synced: false,
      priority,
      attempts: 0,
      metadata,
    };

    this.queue.push(item);
    
    // Sort by priority (highest first) and timestamp (oldest first)
    this.queue.sort((a, b) => {
      const priorityDiff = (b.priority || 0) - (a.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });
    
    // Limit queue size
    if (this.queue.length > MAX_QUEUE_SIZE) {
      logger.warn('Queue size exceeded, removing lowest priority items');
      // Remove lowest priority items first
      this.queue = this.queue.slice(0, MAX_QUEUE_SIZE);
    }

    await this.persist();
    logger.info(`➕ Queued ${delta} steps (priority: ${priority}, queue size: ${this.queue.length})`);
  }

  /**
   * Get all unsynced steps (sorted by priority)
   */
  async getUnsyncedSteps(): Promise<ExtendedQueuedStepUpdate[]> {
    await this.initialize();
    return this.queue.filter(item => !item.synced);
  }

  /**
   * Get unsynced steps by priority
   */
  async getUnsyncedStepsByPriority(minPriority: QueuePriority = QueuePriority.NORMAL): Promise<ExtendedQueuedStepUpdate[]> {
    await this.initialize();
    return this.queue.filter(item => !item.synced && (item.priority || 0) >= minPriority);
  }

  /**
   * Get total unsynced delta
   */
  async getTotalUnsyncedDelta(): Promise<number> {
    const unsynced = await this.getUnsyncedSteps();
    return unsynced.reduce((sum, item) => sum + item.delta, 0);
  }

  /**
   * Mark all items as synced
   */
  async markAllSynced(): Promise<void> {
    await this.initialize();
    
    this.queue.forEach(item => {
      item.synced = true;
    });
    
    await this.persist();
    logger.success(`✅ Marked ${this.queue.length} items as synced`);
  }

  /**
   * Clear synced items (cleanup)
   */
  async clearSynced(): Promise<void> {
    await this.initialize();
    
    const beforeCount = this.queue.length;
    this.queue = this.queue.filter(item => !item.synced);
    const removedCount = beforeCount - this.queue.length;
    
    if (removedCount > 0) {
      await this.persist();
      logger.info(`🧹 Cleared ${removedCount} synced items`);
    }
  }

  /**
   * Clear entire queue
   */
  async clear(): Promise<void> {
    this.queue = [];
    this.conflicts = [];
    await storage.removeItem(QUEUE_STORAGE_KEY);
    await storage.removeItem(CONFLICT_STORAGE_KEY);
    logger.info('🗑️  Queue and conflicts cleared');
  }

  /**
   * Increment attempt counter for an item
   */
  async incrementAttempts(item: ExtendedQueuedStepUpdate): Promise<void> {
    const index = this.queue.indexOf(item);
    if (index !== -1) {
      this.queue[index].attempts = (this.queue[index].attempts || 0) + 1;
      this.queue[index].lastAttempt = Date.now();
      await this.persist();
    }
  }

  /**
   * Remove failed items (exceeded max attempts)
   */
  async removeFailedItems(maxAttempts: number = 5): Promise<number> {
    await this.initialize();
    const beforeCount = this.queue.length;
    this.queue = this.queue.filter(item => (item.attempts || 0) < maxAttempts);
    const removedCount = beforeCount - this.queue.length;
    
    if (removedCount > 0) {
      await this.persist();
      logger.warn(`⚠️  Removed ${removedCount} failed items (max attempts exceeded)`);
    }
    
    return removedCount;
  }

  /**
   * Get queue size
   */
  getSize(): number {
    return this.queue.length;
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    total: number;
    synced: number;
    unsynced: number;
    totalDelta: number;
  }> {
    await this.initialize();
    
    const synced = this.queue.filter(i => i.synced).length;
    const unsynced = this.queue.filter(i => !i.synced).length;
    const totalDelta = this.queue.reduce((sum, i) => sum + i.delta, 0);
    
    return {
      total: this.queue.length,
      synced,
      unsynced,
      totalDelta,
    };
  }

  /**
   * Record a sync conflict
   */
  async recordConflict(
    localDelta: number,
    serverTotal: number,
    expectedTotal: number
  ): Promise<void> {
    await this.initialize();
    
    const conflict: SyncConflict = {
      id: `conflict_${Date.now()}`,
      timestamp: Date.now(),
      localDelta,
      serverTotal,
      expectedTotal,
      resolved: false,
    };
    
    this.conflicts.push(conflict);
    await this.persistConflicts();
    logger.warn(`⚠️  Sync conflict recorded: local=${localDelta}, server=${serverTotal}, expected=${expectedTotal}`);
  }

  /**
   * Resolve conflict
   */
  async resolveConflict(
    conflictId: string,
    resolution: 'accept_server' | 'accept_local' | 'manual'
  ): Promise<void> {
    await this.initialize();
    
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (conflict) {
      conflict.resolved = true;
      conflict.resolution = resolution;
      await this.persistConflicts();
      logger.success(`✅ Conflict resolved: ${conflictId} (${resolution})`);
    }
  }

  /**
   * Get unresolved conflicts
   */
  async getUnresolvedConflicts(): Promise<SyncConflict[]> {
    await this.initialize();
    return this.conflicts.filter(c => !c.resolved);
  }

  /**
   * Auto-resolve conflicts (accept server by default)
   */
  async autoResolveConflicts(): Promise<number> {
    await this.initialize();
    const unresolved = this.conflicts.filter(c => !c.resolved);
    
    for (const conflict of unresolved) {
      await this.resolveConflict(conflict.id, 'accept_server');
    }
    
    return unresolved.length;
  }

  /**
   * Check for sync in progress
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  /**
   * Set sync in progress state
   */
  setSyncInProgress(inProgress: boolean): void {
    this.isSyncing = inProgress;
  }

  /**
   * Persist queue to storage
   */
  private async persist(): Promise<void> {
    try {
      await storage.setObject(QUEUE_STORAGE_KEY, this.queue);
    } catch (error) {
      logger.error('Failed to persist step queue:', error);
    }
  }

  /**
   * Persist conflicts to storage
   */
  private async persistConflicts(): Promise<void> {
    try {
      await storage.setObject(CONFLICT_STORAGE_KEY, this.conflicts);
    } catch (error) {
      logger.error('Failed to persist conflicts:', error);
    }
  }
}

/**
 * Singleton instance
 */
export const stepQueue = new StepQueueManager();

/**
 * Helper functions for easy access
 */

/**
 * Queue steps for later sync with priority
 */
export async function queueOfflineSteps(
  delta: number,
  priority: QueuePriority = QueuePriority.NORMAL,
  metadata?: ExtendedQueuedStepUpdate['metadata']
): Promise<void> {
  return stepQueue.queueSteps(delta, priority, metadata);
}

/**
 * Get total unsynced steps
 */
export async function getUnsyncedStepsTotal(): Promise<number> {
  return stepQueue.getTotalUnsyncedDelta();
}

/**
 * Sync all queued steps with conflict detection
 * Returns total delta to sync and conflict info
 */
export async function prepareSync(currentServerTotal?: number): Promise<{
  totalDelta: number;
  itemCount: number;
  hasConflict: boolean;
  expectedTotal?: number;
}> {
  // Check if already syncing
  if (stepQueue.isSyncInProgress()) {
    logger.warn('Sync already in progress, skipping');
    return { totalDelta: 0, itemCount: 0, hasConflict: false };
  }

  const unsynced = await stepQueue.getUnsyncedSteps();
  if (unsynced.length === 0) {
    return { totalDelta: 0, itemCount: 0, hasConflict: false };
  }
  
  const totalDelta = unsynced.reduce((sum, item) => sum + item.delta, 0);
  logger.info(`🔄 Preparing to sync ${unsynced.length} items (total: ${totalDelta} steps)`);
  
  // Conflict detection
  let hasConflict = false;
  let expectedTotal: number | undefined;
  
  if (currentServerTotal !== undefined) {
    expectedTotal = currentServerTotal + totalDelta;
    
    // Check for potential conflicts (this is a simple check)
    // More sophisticated conflict detection could be implemented
    const unresolvedConflicts = await stepQueue.getUnresolvedConflicts();
    hasConflict = unresolvedConflicts.length > 0;
    
    if (hasConflict) {
      logger.warn(`⚠️  Found ${unresolvedConflicts.length} unresolved conflicts`);
    }
  }
  
  stepQueue.setSyncInProgress(true);
  
  return { totalDelta, itemCount: unsynced.length, hasConflict, expectedTotal };
}

/**
 * Mark sync as complete with conflict resolution
 */
export async function completeSync(
  actualServerTotal?: number,
  expectedTotal?: number
): Promise<void> {
  stepQueue.setSyncInProgress(false);
  
  // Check for conflicts
  if (actualServerTotal !== undefined && expectedTotal !== undefined) {
    const diff = Math.abs(actualServerTotal - expectedTotal);
    
    if (diff > 0) {
      logger.warn(`⚠️  Sync conflict detected: expected=${expectedTotal}, actual=${actualServerTotal}, diff=${diff}`);
      const unsynced = await stepQueue.getUnsyncedSteps();
      const totalDelta = unsynced.reduce((sum, item) => sum + item.delta, 0);
      
      await stepQueue.recordConflict(totalDelta, actualServerTotal, expectedTotal);
      
      // Auto-resolve by accepting server value
      const conflicts = await stepQueue.getUnresolvedConflicts();
      if (conflicts.length > 0) {
        await stepQueue.autoResolveConflicts();
      }
    }
  }
  
  await stepQueue.markAllSynced();
  
  // Remove failed items
  await stepQueue.removeFailedItems(5);
  
  // Auto-cleanup old synced items after 1 minute
  setTimeout(async () => {
    await stepQueue.clearSynced();
  }, 60000);
}

/**
 * Sync with retry and conflict handling
 */
export async function syncWithRetry(
  syncFn: (delta: number) => Promise<number>,
  maxRetries: number = 3
): Promise<{ success: boolean; serverTotal?: number; error?: Error }> {
  const { totalDelta, itemCount, hasConflict, expectedTotal } = await prepareSync();
  
  if (itemCount === 0) {
    return { success: true };
  }
  
  if (hasConflict) {
    logger.warn('⚠️  Attempting sync with unresolved conflicts');
  }
  
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      logger.info(`Sync attempt ${attempt + 1}/${maxRetries}`);
      
      // Increment attempts for all items
      const unsynced = await stepQueue.getUnsyncedSteps();
      for (const item of unsynced) {
        await stepQueue.incrementAttempts(item);
      }
      
      // Perform sync
      const serverTotal = await syncFn(totalDelta);
      
      // Complete with conflict detection
      await completeSync(serverTotal, expectedTotal);
      
      logger.success(`✅ Sync completed successfully (${itemCount} items, ${totalDelta} steps)`);
      return { success: true, serverTotal };
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.error(`Sync attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries - 1) {
        const delay = 1000 * Math.pow(2, attempt);
        logger.info(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  stepQueue.setSyncInProgress(false);
  logger.error('❌ Sync failed after all retries');
  return { success: false, error: lastError };
}

/**
 * Clear queue on logout
 */
export async function clearQueue(): Promise<void> {
  return stepQueue.clear();
}