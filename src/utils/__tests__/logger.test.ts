/**
 * Logger Utility Tests
 * 
 * Tests for the centralized logging service
 */

import { logger } from '../logger';

describe('Logger Utility', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleGroupSpy: jest.SpyInstance;
  let consoleGroupCollapsedSpy: jest.SpyInstance;
  let consoleGroupEndSpy: jest.SpyInstance;
  let consoleTableSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation();
    consoleGroupCollapsedSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation();
    consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation();
    consoleTableSpy = jest.spyOn(console, 'table').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('debug', () => {
    it('should log debug messages in development', () => {
      logger.debug('Test debug message', { data: 'test' });

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls[0][0]).toContain('DEBUG:');
      expect(consoleLogSpy.mock.calls[0][1]).toBe('Test debug message');
    });

    it('should handle multiple arguments', () => {
      logger.debug('Message', 'arg1', 'arg2', { key: 'value' });

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls[0].length).toBeGreaterThan(2);
    });
  });

  describe('info', () => {
    it('should log info messages in development', () => {
      logger.info('Test info message');

      expect(consoleInfoSpy).toHaveBeenCalled();
      expect(consoleInfoSpy.mock.calls[0][0]).toContain('INFO:');
      expect(consoleInfoSpy.mock.calls[0][1]).toBe('Test info message');
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning');

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('WARN:');
      expect(consoleWarnSpy.mock.calls[0][1]).toBe('Test warning');
    });

    it('should always log warnings even in production', () => {
      logger.warn('Production warning');

      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('ERROR:');
      expect(consoleErrorSpy.mock.calls[0][1]).toBe('Error occurred');
      expect(consoleErrorSpy.mock.calls[0][2]).toBe(error);
    });

    it('should always log errors even in production', () => {
      logger.error('Production error');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('api', () => {
    it('should log API calls with endpoint', () => {
      logger.api('/users', 'GET', { status: 200 });

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls[0][0]).toContain('API:');
      expect(consoleLogSpy.mock.calls[0][1]).toBe('/users');
    });

    it('should handle API responses', () => {
      const response = { data: { id: 1, name: 'Test' } };
      logger.api('/users/1', response);

      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('success', () => {
    it('should log success messages', () => {
      logger.success('Operation completed');

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls[0][0]).toContain('SUCCESS:');
      expect(consoleLogSpy.mock.calls[0][1]).toBe('Operation completed');
    });
  });

  describe('perf', () => {
    it('should log performance measurements', () => {
      logger.perf('API Call', 125.42);

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls[0][0]).toContain('PERF:');
      expect(consoleLogSpy.mock.calls[0][0]).toContain('API Call');
      expect(consoleLogSpy.mock.calls[0][0]).toContain('125.42ms');
    });

    it('should format duration with 2 decimal places', () => {
      logger.perf('Test', 123.456789);

      expect(consoleLogSpy.mock.calls[0][0]).toContain('123.46ms');
    });
  });

  describe('group', () => {
    it('should create console group', () => {
      logger.group('Test Group');

      expect(consoleGroupSpy).toHaveBeenCalled();
      expect(consoleGroupSpy.mock.calls[0][0]).toContain('Test Group');
    });

    it('should create collapsed group when specified', () => {
      logger.group('Collapsed Group', true);

      expect(consoleGroupCollapsedSpy).toHaveBeenCalled();
      expect(consoleGroupCollapsedSpy.mock.calls[0][0]).toContain('Collapsed Group');
    });
  });

  describe('groupEnd', () => {
    it('should end console group', () => {
      logger.groupEnd();

      expect(consoleGroupEndSpy).toHaveBeenCalled();
    });
  });

  describe('table', () => {
    it('should log data as table', () => {
      const data = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
      ];
      logger.table(data);

      expect(consoleTableSpy).toHaveBeenCalledWith(data);
    });
  });

  describe('timer', () => {
    it('should measure execution time', () => {
      const timer = logger.timer('Test Operation');
      
      // Simulate some work
      const duration = timer.end();

      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThanOrEqual(0);
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls[0][0]).toContain('PERF:');
      expect(consoleLogSpy.mock.calls[0][0]).toContain('Test Operation');
    });

    it('should return duration when timer ends', () => {
      const timer = logger.timer('Duration Test');
      const duration = timer.end();

      expect(duration).toBeGreaterThanOrEqual(0);
      expect(typeof duration).toBe('number');
    });
  });

  describe('timestamp formatting', () => {
    it('should include timestamp in log messages', () => {
      logger.warn('Timestamped message');

      const logMessage = consoleWarnSpy.mock.calls[0][0];
      // Accept both . and , as decimal separator (locale differences)
      expect(logMessage).toMatch(/\[\d{2}:\d{2}:\d{2}[,.]\d{3}\]/);
    });
  });

  describe('type safety', () => {
    it('should handle various data types', () => {
      logger.info('String');
      logger.info(123);
      logger.info({ key: 'value' });
      logger.info([1, 2, 3]);
      logger.info(null);
      logger.info(undefined);
      logger.info(true);

      expect(consoleInfoSpy).toHaveBeenCalledTimes(7);
    });
  });
});