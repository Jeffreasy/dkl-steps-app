/**
 * Tests for stepQueue service
 * Tests priority queue, conflict resolution, and sync handling
 */

import { stepQueue, QueuePriority, queueOfflineSteps, syncWithRetry } from '../stepQueue';
import { storage } from '../../utils/storage';

// Mock dependencies
jest.mock('../../utils/storage');
jest.mock('../../utils/logger');

describe('StepQueueManager', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    (storage.getObject as jest.Mock).mockResolvedValue(null);
    (storage.setObject as jest.Mock).mockResolvedValue(undefined);
    (storage.removeItem as jest.Mock).mockResolvedValue(undefined);
    await stepQueue.clear();
  });

  describe('Priority Queue System', () => {
    it('should queue steps with priority', async () => {
      await stepQueue.queueSteps(100, QueuePriority.NORMAL);
      await stepQueue.queueSteps(200, QueuePriority.HIGH);
      await stepQueue.queueSteps(50, QueuePriority.LOW);

      const unsynced = await stepQueue.getUnsyncedSteps();
      
      expect(unsynced).toHaveLength(3);
      // Should be sorted by priority (high to low)
      expect(unsynced[0].delta).toBe(200);
      expect(unsynced[0].priority).toBe(QueuePriority.HIGH);
      expect(unsynced[1].delta).toBe(100);
      expect(unsynced[1].priority).toBe(QueuePriority.NORMAL);
      expect(unsynced[2].delta).toBe(50);
      expect(unsynced[2].priority).toBe(QueuePriority.LOW);
    });

    it('should filter by priority level', async () => {
      await stepQueue.queueSteps(100, QueuePriority.LOW);
      await stepQueue.queueSteps(200, QueuePriority.NORMAL);
      await stepQueue.queueSteps(300, QueuePriority.HIGH);

      const highPriority = await stepQueue.getUnsyncedStepsByPriority(QueuePriority.HIGH);
      
      expect(highPriority).toHaveLength(1);
      expect(highPriority[0].delta).toBe(300);
    });

    it('should remove lowest priority items when queue is full', async () => {
      // Queue 101 items (max is 100)
      for (let i = 0; i < 101; i++) {
        const priority = i < 50 ? QueuePriority.HIGH : QueuePriority.LOW;
        await stepQueue.queueSteps(i, priority);
      }

      const unsynced = await stepQueue.getUnsyncedSteps();
      
      expect(unsynced).toHaveLength(100);
      // Should keep high priority items
      const highPriorityCount = unsynced.filter(
        item => item.priority === QueuePriority.HIGH
      ).length;
      expect(highPriorityCount).toBe(50);
    });
  });

  describe('Conflict Resolution', () => {
    it('should record sync conflicts', async () => {
      await stepQueue.recordConflict(100, 1000, 1100);

      const conflicts = await stepQueue.getUnresolvedConflicts();

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].localDelta).toBe(100);
      expect(conflicts[0].serverTotal).toBe(1000);
      expect(conflicts[0].expectedTotal).toBe(1100);
      expect(conflicts[0].resolved).toBe(false);
    });

    it('should return empty array when no conflicts exist', async () => {
      const conflicts = await stepQueue.getUnresolvedConflicts();

      expect(conflicts).toHaveLength(0);
    });

    it('should resolve conflicts', async () => {
      await stepQueue.recordConflict(100, 1000, 1100);
      const conflicts = await stepQueue.getUnresolvedConflicts();
      
      await stepQueue.resolveConflict(conflicts[0].id, 'accept_server');

      const unresolvedAfter = await stepQueue.getUnresolvedConflicts();
      expect(unresolvedAfter).toHaveLength(0);
    });

    it('should auto-resolve all conflicts', async () => {
      await stepQueue.recordConflict(100, 1000, 1100);
      await stepQueue.recordConflict(200, 2000, 2200);
      await stepQueue.recordConflict(300, 3000, 3300);

      const resolved = await stepQueue.autoResolveConflicts();
      
      expect(resolved).toBe(3);
      const unresolved = await stepQueue.getUnresolvedConflicts();
      expect(unresolved).toHaveLength(0);
    });
  });

  describe('Retry and Attempt Tracking', () => {
    it('should increment attempt counter', async () => {
      await stepQueue.queueSteps(100, QueuePriority.NORMAL);
      const items = await stepQueue.getUnsyncedSteps();
      const item = items[0];

      expect(item.attempts).toBe(0);

      await stepQueue.incrementAttempts(item);
      const updatedItems = await stepQueue.getUnsyncedSteps();
      
      expect(updatedItems[0].attempts).toBe(1);
      expect(updatedItems[0].lastAttempt).toBeDefined();
    });

    it('should remove items after max attempts', async () => {
      await stepQueue.queueSteps(100, QueuePriority.NORMAL);
      await stepQueue.queueSteps(200, QueuePriority.NORMAL);
      
      const items = await stepQueue.getUnsyncedSteps();
      
      // Simulate multiple failed attempts
      for (let i = 0; i < 6; i++) {
        await stepQueue.incrementAttempts(items[0]);
      }

      const removed = await stepQueue.removeFailedItems(5);
      
      expect(removed).toBe(1);
      const remaining = await stepQueue.getUnsyncedSteps();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].delta).toBe(200);
    });
  });

  describe('Sync Operations', () => {
    it('should calculate total unsynced delta', async () => {
      await stepQueue.queueSteps(100, QueuePriority.NORMAL);
      await stepQueue.queueSteps(200, QueuePriority.NORMAL);
      await stepQueue.queueSteps(50, QueuePriority.NORMAL);

      const total = await stepQueue.getTotalUnsyncedDelta();
      
      expect(total).toBe(350);
    });

    it('should mark all items as synced', async () => {
      await stepQueue.queueSteps(100, QueuePriority.NORMAL);
      await stepQueue.queueSteps(200, QueuePriority.NORMAL);

      await stepQueue.markAllSynced();

      const unsynced = await stepQueue.getUnsyncedSteps();
      expect(unsynced).toHaveLength(0);
    });

    it('should clear synced items', async () => {
      await stepQueue.queueSteps(100, QueuePriority.NORMAL);
      await stepQueue.queueSteps(200, QueuePriority.NORMAL);

      await stepQueue.markAllSynced();
      await stepQueue.clearSynced();

      expect(stepQueue.getSize()).toBe(0);
    });

    it('should prevent concurrent syncs', async () => {
      await stepQueue.queueSteps(100, QueuePriority.NORMAL);
      
      stepQueue.setSyncInProgress(true);
      
      expect(stepQueue.isSyncInProgress()).toBe(true);
      
      stepQueue.setSyncInProgress(false);
      
      expect(stepQueue.isSyncInProgress()).toBe(false);
    });
  });

  describe('Queue Statistics', () => {
    it('should provide accurate statistics', async () => {
      await stepQueue.queueSteps(100, QueuePriority.NORMAL);
      await stepQueue.queueSteps(200, QueuePriority.NORMAL);
      await stepQueue.queueSteps(300, QueuePriority.NORMAL);

      const stats = await stepQueue.getStats();
      
      expect(stats.total).toBe(3);
      expect(stats.unsynced).toBe(3);
      expect(stats.synced).toBe(0);
      expect(stats.totalDelta).toBe(600);

      await stepQueue.markAllSynced();
      const statsAfter = await stepQueue.getStats();
      
      expect(statsAfter.synced).toBe(3);
      expect(statsAfter.unsynced).toBe(0);
    });
  });

  describe('Persistence', () => {
    it('should persist queue to storage', async () => {
      await stepQueue.queueSteps(100, QueuePriority.NORMAL);

      expect(storage.setObject).toHaveBeenCalledWith(
        'step_queue',
        expect.arrayContaining([
          expect.objectContaining({
            delta: 100,
            priority: QueuePriority.NORMAL,
          }),
        ])
      );
    });

    it('should load queue from storage on init', async () => {
      const storedQueue = [
        {
          delta: 100,
          timestamp: Date.now(),
          synced: false,
          priority: QueuePriority.NORMAL,
          attempts: 0,
        },
      ];

      (storage.getObject as jest.Mock).mockResolvedValueOnce(storedQueue);

      // Force re-initialization
      await stepQueue.clear();
      await stepQueue.initialize();

      const unsynced = await stepQueue.getUnsyncedSteps();
      expect(unsynced).toHaveLength(1);
      expect(unsynced[0].delta).toBe(100);
    });
  });
});

describe('Helper Functions', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    (storage.getObject as jest.Mock).mockResolvedValue(null);
    (storage.setObject as jest.Mock).mockResolvedValue(undefined);
    await stepQueue.clear();
  });

  describe('queueOfflineSteps', () => {
    it('should queue steps with default priority', async () => {
      await queueOfflineSteps(100);

      const unsynced = await stepQueue.getUnsyncedSteps();
      expect(unsynced).toHaveLength(1);
      expect(unsynced[0].priority).toBe(QueuePriority.NORMAL);
    });

    it('should queue steps with custom priority', async () => {
      await queueOfflineSteps(100, QueuePriority.HIGH);

      const unsynced = await stepQueue.getUnsyncedSteps();
      expect(unsynced[0].priority).toBe(QueuePriority.HIGH);
    });
  });

  describe('syncWithRetry', () => {
    it('should sync successfully on first attempt', async () => {
      await stepQueue.queueSteps(100, QueuePriority.NORMAL);
      
      const mockSyncFn = jest.fn().mockResolvedValue(1100);

      const result = await syncWithRetry(mockSyncFn);

      expect(result.success).toBe(true);
      expect(result.serverTotal).toBe(1100);
      expect(mockSyncFn).toHaveBeenCalledWith(100);
    });

    it('should retry on failure', async () => {
      await stepQueue.queueSteps(100, QueuePriority.NORMAL);
      
      const mockSyncFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue(1100);

      const result = await syncWithRetry(mockSyncFn, 3);

      expect(result.success).toBe(true);
      expect(mockSyncFn).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      await stepQueue.queueSteps(100, QueuePriority.NORMAL);
      
      const mockSyncFn = jest.fn().mockRejectedValue(new Error('Persistent error'));

      const result = await syncWithRetry(mockSyncFn, 3);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(mockSyncFn).toHaveBeenCalledTimes(3);
    });

    it('should skip sync when queue is empty', async () => {
      const mockSyncFn = jest.fn();

      const result = await syncWithRetry(mockSyncFn);

      expect(result.success).toBe(true);
      expect(mockSyncFn).not.toHaveBeenCalled();
    });
  });
});