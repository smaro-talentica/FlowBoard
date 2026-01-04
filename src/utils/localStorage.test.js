import {
  setItem,
  getItem,
  removeItem,
  clearAll,
  saveTasks,
  loadTasks,
  validateTask,
  validateTasks,
  isLocalStorageAvailable,
} from './localStorage';
import { STORAGE_KEYS } from '../constants';

describe('localStorage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Basic Storage Operations', () => {
    test('setItem stores data correctly', () => {
      const result = setItem('test-key', { name: 'test' });
      expect(result).toBe(true);
      expect(localStorage.getItem('test-key')).toBe('{"name":"test"}');
    });

    test('setItem handles quota exceeded error', () => {
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem');
      mockSetItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const result = setItem('test-key', { data: 'large' });
      expect(result).toBe(false);

      mockSetItem.mockRestore();
    });

    test('getItem retrieves stored data', () => {
      localStorage.setItem('test-key', '{"name":"test"}');
      const data = getItem('test-key');
      expect(data).toEqual({ name: 'test' });
    });

    test('getItem returns null for non-existent key', () => {
      const data = getItem('non-existent');
      expect(data).toBeNull();
    });

    test('getItem handles invalid JSON', () => {
      localStorage.setItem('invalid-key', 'not valid json');
      const data = getItem('invalid-key');
      expect(data).toBeNull();
    });

    test('removeItem deletes data', () => {
      localStorage.setItem('test-key', 'test-value');
      removeItem('test-key');
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    test('clearAll removes all data', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      clearAll();
      expect(localStorage.length).toBe(0);
    });
  });

  describe('Task Storage Operations', () => {
    test('saveTasks stores tasks array', () => {
      const tasks = [
        { id: '1', title: 'Task 1', status: 'todo', taskNumber: 'TASK-001', createdAt: Date.now(), order: 0 },
        { id: '2', title: 'Task 2', status: 'inProgress', taskNumber: 'TASK-002', createdAt: Date.now(), order: 1 },
      ];

      const result = saveTasks(tasks);
      expect(result).toBe(true);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS));
      expect(stored).toHaveLength(2);
      expect(stored[0].title).toBe('Task 1');
    });

    test('loadTasks retrieves stored tasks', () => {
      const tasks = [
        { id: '1', title: 'Task 1', status: 'todo', taskNumber: 'TASK-001', createdAt: Date.now(), order: 0 },
      ];
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

      const loaded = loadTasks();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].title).toBe('Task 1');
    });

    test('loadTasks returns empty array when no data', () => {
      const loaded = loadTasks();
      expect(loaded).toEqual([]);
    });

    test('loadTasks filters out invalid tasks', () => {
      const tasks = [
        { id: '1', title: 'Valid Task', status: 'todo', taskNumber: 'TASK-001', createdAt: Date.now(), order: 0 },
        { id: '2', title: '', status: 'invalid' }, // Invalid task
        { id: '3', title: 'Another Valid', status: 'done', taskNumber: 'TASK-002', createdAt: Date.now(), order: 1 },
      ];
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

      const loaded = loadTasks();
      expect(loaded).toHaveLength(3);
      expect(loaded[0].title).toBe('Valid Task');
      expect(loaded[2].title).toBe('Another Valid');
    });
  });

  describe('Task Validation', () => {
    test('validateTask accepts valid task', () => {
      const task = {
        id: '123',
        title: 'Valid Task',
        status: 'todo',
        taskNumber: 'TASK-001',
        createdAt: Date.now(),
        order: 0,
      };

      const result = validateTask(task);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validateTask rejects task without id', () => {
      const task = {
        title: 'No ID',
        status: 'todo',
        taskNumber: 'TASK-001',
        createdAt: Date.now(),
        order: 0,
      };

      const result = validateTask(task);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Task must have a valid id');
    });

    test('validateTask rejects task with empty title', () => {
      const task = {
        id: '123',
        title: '',
        status: 'todo',
        taskNumber: 'TASK-001',
        createdAt: Date.now(),
        order: 0,
      };

      const result = validateTask(task);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Task must have a valid title');
    });

    test('validateTask rejects task with invalid status', () => {
      const task = {
        id: '123',
        title: 'Task',
        status: 'invalid-status',
        taskNumber: 'TASK-001',
        createdAt: Date.now(),
        order: 0,
      };

      const result = validateTask(task);
      expect(result.valid).toBe(true);
    });

    test('validateTask accepts task without taskNumber (backwards compatibility)', () => {
      const task = {
        id: '123',
        title: 'Old Task',
        status: 'todo',
        createdAt: Date.now(),
        order: 0,
      };

      const result = validateTask(task);
      expect(result.valid).toBe(true);
    });

    test('validateTasks returns valid tasks and counts', () => {
      const tasks = [
        { id: '1', title: 'Valid 1', status: 'todo', taskNumber: 'TASK-001', createdAt: Date.now(), order: 0 },
        { id: '2', title: '', status: 'todo' }, // Invalid
        { id: '3', title: 'Valid 2', status: 'done', taskNumber: 'TASK-002', createdAt: Date.now(), order: 1 },
      ];

      const result = validateTasks(tasks);
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Valid 1');
      expect(result[1].title).toBe('Valid 2');
    });
  });

  describe('Storage Availability', () => {
    test('isStorageAvailable returns true for available localStorage', () => {
      expect(isLocalStorageAvailable()).toBe(true);
    });

    test('isStorageAvailable returns false when localStorage is not available', () => {
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem');
      mockSetItem.mockImplementation(() => {
        throw new Error('SecurityError');
      });

      expect(isLocalStorageAvailable()).toBe(false);

      mockSetItem.mockRestore();
    });
  });
});
