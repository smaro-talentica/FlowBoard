import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BoardProvider, useBoard } from './BoardContext';

// Test component that uses the context
const TestComponent = () => {
  const {
    tasks,
    searchQuery,
    setSearchQuery,
    addTask,
    deleteTask,
    moveTask,
    clearAllTasks,
  } = useBoard();

  // Compute filtered tasks locally
  const filteredTasks = searchQuery
    ? tasks.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.taskNumber && task.taskNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : tasks;

  return (
    <div>
      <div data-testid="task-count">{tasks.length}</div>
      <div data-testid="filtered-count">{filteredTasks.length}</div>
      <input
        data-testid="search-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={() => addTask('New Task')}>Add Task</button>
      <button onClick={() => deleteTask(tasks[0]?.id)}>Delete First</button>
      <button onClick={() => moveTask(tasks[0]?.id, 'done')}>Move First</button>
      <button onClick={clearAllTasks}>Clear All</button>
      <div data-testid="tasks">
        {filteredTasks.map(task => (
          <div key={task.id} data-testid={`task-${task.id}`}>
            {task.title} - {task.status} - {task.taskNumber}
          </div>
        ))}
      </div>
    </div>
  );
};

describe('BoardContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('provides initial empty state', () => {
    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    expect(screen.getByTestId('task-count')).toHaveTextContent('0');
    expect(screen.getByTestId('filtered-count')).toHaveTextContent('0');
  });

  test('loads tasks from localStorage on mount', () => {
    const savedTasks = [
      { id: '1', title: 'Saved Task', status: 'todo', taskNumber: 'TASK-001', createdAt: Date.now(), order: 0 },
    ];
    localStorage.setItem('flowboard_tasks', JSON.stringify(savedTasks));

    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    expect(screen.getByText(/Saved Task/)).toBeInTheDocument();
    expect(screen.getByTestId('task-count')).toHaveTextContent('1');
  });

  test('adds new task', () => {
    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);

    expect(screen.getByText(/New Task/)).toBeInTheDocument();
    expect(screen.getByTestId('task-count')).toHaveTextContent('1');
  });

  test('auto-assigns task number to new tasks', () => {
    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);

    expect(screen.getByText(/TASK-001/)).toBeInTheDocument();
  });

  test('increments task number for each new task', () => {
    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    expect(screen.getByText(/TASK-001/)).toBeInTheDocument();
    expect(screen.getByText(/TASK-002/)).toBeInTheDocument();
  });

  test('deletes task', () => {
    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);

    expect(screen.getByTestId('task-count')).toHaveTextContent('1');

    const deleteButton = screen.getByText('Delete First');
    fireEvent.click(deleteButton);

    expect(screen.getByTestId('task-count')).toHaveTextContent('0');
  });

  test('moves task to different status', () => {
    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);

    expect(screen.getByText(/todo/)).toBeInTheDocument();

    const moveButton = screen.getByText('Move First');
    fireEvent.click(moveButton);

    expect(screen.getByText(/done/)).toBeInTheDocument();
  });

  test('filters tasks by search query', () => {
    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    // Add two tasks
    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    expect(screen.getByTestId('filtered-count')).toHaveTextContent('2');

    // Search for specific task
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'TASK-001' } });

    expect(screen.getByTestId('filtered-count')).toHaveTextContent('1');
  });

  test('clears all tasks', () => {
    // Mock window.confirm to return true
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
    
    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    expect(screen.getByTestId('task-count')).toHaveTextContent('2');

    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);

    expect(screen.getByTestId('task-count')).toHaveTextContent('0');
    
    // Restore mock
    window.confirm.mockRestore();
  });

  test('persists tasks to localStorage', async () => {
    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('flowboard_tasks'));
      expect(stored).toHaveLength(1);
      expect(stored[0].title).toBe('New Task');
    });
  });

  test('persists last task number to localStorage', async () => {
    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);

    await waitFor(() => {
      const lastNumber = localStorage.getItem('flowboard_last_task_number');
      expect(lastNumber).toBe('1');
    });
  });

  test('recovers task number from existing tasks', () => {
    const savedTasks = [
      { id: '1', title: 'Task 1', status: 'todo', taskNumber: 'TASK-005', createdAt: Date.now(), order: 0 },
    ];
    localStorage.setItem('flowboard_tasks', JSON.stringify(savedTasks));

    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);

    // Should continue from TASK-005
    expect(screen.getByText(/TASK-006/)).toBeInTheDocument();
  });

  test('handles empty search query', () => {
    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: '' } });

    expect(screen.getByTestId('filtered-count')).toHaveTextContent('2');
  });

  test('case-insensitive search', () => {
    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    const addButton = screen.getByText('Add Task');
    fireEvent.click(addButton);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'new' } });

    expect(screen.getByTestId('filtered-count')).toHaveTextContent('1');
    expect(screen.getByText(/New Task/)).toBeInTheDocument();
  });
});
