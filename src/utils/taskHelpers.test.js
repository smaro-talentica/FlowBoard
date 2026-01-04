import { createTask, filterTasks, getTaskCounts } from './taskHelpers';

describe('taskHelpers', () => {
  describe('createTask', () => {
    test('creates task with required fields', () => {
      const task = createTask('Test Task', 'TASK-001', 'todo', 0);

      expect(task).toHaveProperty('id');
      expect(task.title).toBe('Test Task');
      expect(task.taskNumber).toBe('TASK-001');
      expect(task.status).toBe('todo');
      expect(task.order).toBe(0);
      expect(task).toHaveProperty('createdAt');
      expect(typeof task.createdAt).toBe('number');
    });

    test('creates task with default status and order', () => {
      const task = createTask('Test Task', 'TASK-001');

      expect(task.status).toBe('todo');
      expect(task.order).toBe(0);
    });

    test('generates unique IDs for different tasks', () => {
      const task1 = createTask('Task 1', 'TASK-001');
      const task2 = createTask('Task 2', 'TASK-002');

      expect(task1.id).not.toBe(task2.id);
    });

    test('uses current timestamp for createdAt', () => {
      const before = Date.now();
      const task = createTask('Test Task', 'TASK-001');
      const after = Date.now();

      expect(task.createdAt).toBeGreaterThanOrEqual(before);
      expect(task.createdAt).toBeLessThanOrEqual(after);
    });
  });

  describe('filterTasks', () => {
    const tasks = [
      { id: '1', title: 'Fix bug in login', status: 'todo', taskNumber: 'TASK-001' },
      { id: '2', title: 'Add new feature', status: 'inProgress', taskNumber: 'TASK-002' },
      { id: '3', title: 'Update documentation', status: 'done', taskNumber: 'TASK-003' },
      { id: '4', title: 'Bug in payment', status: 'todo', taskNumber: 'TASK-004' },
    ];

    test('returns all tasks when query is empty', () => {
      const filtered = filterTasks(tasks, '');
      expect(filtered).toHaveLength(4);
    });

    test('filters tasks by title (case-insensitive)', () => {
      const filtered = filterTasks(tasks, 'bug');
      expect(filtered).toHaveLength(2);
      expect(filtered[0].title).toContain('bug');
      expect(filtered[1].title).toContain('Bug');
    });

    test('filters tasks by task number', () => {
      const filtered = filterTasks(tasks, 'TASK-002');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].taskNumber).toBe('TASK-002');
    });

    test('filters tasks by partial task number', () => {
      const filtered = filterTasks(tasks, '00');
      expect(filtered).toHaveLength(4); // All task numbers contain '00'
    });

    test('returns empty array when no matches', () => {
      const filtered = filterTasks(tasks, 'nonexistent');
      expect(filtered).toHaveLength(0);
    });

    test('handles null or undefined query', () => {
      expect(filterTasks(tasks, null)).toHaveLength(4);
      expect(filterTasks(tasks, undefined)).toHaveLength(4);
    });

    test('handles empty tasks array', () => {
      expect(filterTasks([], 'test')).toHaveLength(0);
    });

    test('handles tasks without taskNumber', () => {
      const tasksWithoutNumber = [
        { id: '1', title: 'Old Task', status: 'todo' },
      ];
      const filtered = filterTasks(tasksWithoutNumber, 'old');
      expect(filtered).toHaveLength(1);
    });
  });

  describe('getTaskCounts', () => {
    test('counts tasks by status', () => {
      const tasks = [
        { id: '1', status: 'todo' },
        { id: '2', status: 'todo' },
        { id: '3', status: 'inProgress' },
        { id: '4', status: 'done' },
        { id: '5', status: 'done' },
        { id: '6', status: 'done' },
      ];

      const counts = getTaskCounts(tasks);
      expect(counts.total).toBe(6);
      expect(counts.todo).toBe(2);
      expect(counts.inProgress).toBe(1);
      expect(counts.done).toBe(3);
    });

    test('returns zero counts for empty array', () => {
      const counts = getTaskCounts([]);
      expect(counts.total).toBe(0);
      expect(counts.todo).toBe(0);
      expect(counts.inProgress).toBe(0);
      expect(counts.done).toBe(0);
    });

    test('handles tasks with only one status', () => {
      const tasks = [
        { id: '1', status: 'todo' },
        { id: '2', status: 'todo' },
      ];

      const counts = getTaskCounts(tasks);
      expect(counts.total).toBe(2);
      expect(counts.todo).toBe(2);
      expect(counts.inProgress).toBe(0);
      expect(counts.done).toBe(0);
    });
  });
});
