import { exportToJSON, exportToCSV, importFromJSON } from '../utils/exportHelpers';

describe('exportHelpers', () => {
  const mockTasks = [
    {
      id: '1',
      title: 'Test Task 1',
      status: 'todo',
      taskNumber: 'TASK-001',
      createdAt: 1609459200000,
      order: 0,
    },
    {
      id: '2',
      title: 'Test Task 2',
      status: 'inProgress',
      taskNumber: 'TASK-002',
      createdAt: 1609545600000,
      order: 1,
    },
  ];

  beforeEach(() => {
    // Suppress console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();

    // Mock document.createElement and click
    document.createElement = jest.fn((tag) => {
      const element = {
        href: '',
        download: '',
        click: jest.fn(),
        style: {},
      };
      return element;
    });

    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    console.error.mockRestore();
  });

  describe('exportToJSON', () => {
    test('exports tasks as JSON file', () => {
      const result = exportToJSON(mockTasks);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
    });

    test('exports empty array', () => {
      const result = exportToJSON([]);
      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });

    test('includes all task properties', () => {
      const createObjectURLMock = jest.fn((blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          const data = JSON.parse(reader.result);
          expect(data).toHaveLength(2);
          expect(data[0]).toHaveProperty('id');
          expect(data[0]).toHaveProperty('title');
          expect(data[0]).toHaveProperty('status');
          expect(data[0]).toHaveProperty('taskNumber');
        };
        reader.readAsText(blob);
        return 'mock-url';
      });
      global.URL.createObjectURL = createObjectURLMock;

      exportToJSON(mockTasks);
    });
  });

  describe('exportToCSV', () => {
    test('exports tasks as CSV file', () => {
      const result = exportToCSV(mockTasks);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
    });

    test('includes CSV headers', () => {
      const createObjectURLMock = jest.fn((blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          const csvContent = reader.result;
          expect(csvContent).toContain('Task Number,Title,Status,Created At,Order');
        };
        reader.readAsText(blob);
        return 'mock-url';
      });
      global.URL.createObjectURL = createObjectURLMock;

      exportToCSV(mockTasks);
    });

    test('formats task data correctly', () => {
      const createObjectURLMock = jest.fn((blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          const csvContent = reader.result;
          expect(csvContent).toContain('TASK-001');
          expect(csvContent).toContain('Test Task 1');
          expect(csvContent).toContain('todo');
        };
        reader.readAsText(blob);
        return 'mock-url';
      });
      global.URL.createObjectURL = createObjectURLMock;

      exportToCSV(mockTasks);
    });

    test('escapes commas in titles', () => {
      const tasksWithCommas = [
        {
          id: '1',
          title: 'Task with, comma',
          status: 'todo',
          taskNumber: 'TASK-001',
          createdAt: Date.now(),
          order: 0,
        },
      ];

      const createObjectURLMock = jest.fn((blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          const csvContent = reader.result;
          expect(csvContent).toContain('"Task with, comma"');
        };
        reader.readAsText(blob);
        return 'mock-url';
      });
      global.URL.createObjectURL = createObjectURLMock;

      exportToCSV(tasksWithCommas);
    });
  });

  describe('importFromJSON', () => {
    test('imports valid JSON file', async () => {
      const jsonContent = JSON.stringify({ tasks: mockTasks });
      const file = new File([jsonContent], 'tasks.json', { type: 'application/json' });

      const result = await importFromJSON(file);

      expect(result.success).toBe(true);
      expect(result.tasks).toHaveLength(2);
      expect(result.skipped).toBe(0);
      expect(result.errors).toBeNull();
    });

    test('assigns task numbers to imported tasks without them', async () => {
      const tasksWithoutNumbers = [
        { id: '1', title: 'Old Task', status: 'todo', createdAt: Date.now(), order: 0 },
      ];
      const jsonContent = JSON.stringify({ tasks: tasksWithoutNumbers });
      const file = new File([jsonContent], 'tasks.json', { type: 'application/json' });

      const result = await importFromJSON(file);

      expect(result.success).toBe(true);
      expect(result.tasks[0].taskNumber).toMatch(/^TASK-\d{3}$/);
    });

    test('rejects invalid JSON', async () => {
      const file = new File(['invalid json'], 'tasks.json', { type: 'application/json' });

      await expect(importFromJSON(file)).rejects.toThrow('Failed to parse file');
    });

    test('skips invalid tasks and reports errors', async () => {
      const mixedTasks = [
        ...mockTasks,
        { id: '3', title: '', status: 'invalid' }, // Invalid
        { id: '4', title: 'Valid Task', status: 'done', taskNumber: 'TASK-003', createdAt: Date.now(), order: 2 },
      ];
      const jsonContent = JSON.stringify({ tasks: mixedTasks });
      const file = new File([jsonContent], 'tasks.json', { type: 'application/json' });

      const result = await importFromJSON(file);

      expect(result.success).toBe(true);
      expect(result.tasks).toHaveLength(3); // Only valid tasks
      expect(result.skipped).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('handles empty array', async () => {
      const jsonContent = JSON.stringify({ tasks: [] });
      const file = new File([jsonContent], 'tasks.json', { type: 'application/json' });

      await expect(importFromJSON(file)).rejects.toThrow('No valid tasks found in file.');
    });
  });
});
