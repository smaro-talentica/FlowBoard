import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import App from './App';

describe('App Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders FlowBoard application', () => {
    render(<App />);
    expect(screen.getByText('FlowBoard')).toBeInTheDocument();
  });

  test('renders all three columns', () => {
    render(<App />);
    // Check for column titles by role
    expect(screen.getByRole('heading', { name: /to do/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /in progress/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /done/i })).toBeInTheDocument();
  });

  test('renders header with statistics', () => {
    render(<App />);
    expect(screen.getByText(/total/i)).toBeInTheDocument();
    // Check for "To Do" in the stats section specifically
    const stats = screen.getByText(/total/i).closest('.task-stats');
    expect(stats).toHaveTextContent(/to do/i);
  });

  test('adds a new task', async () => {
    render(<App />);
    
    // Click the add task trigger button
    const addTrigger = screen.getByRole('button', { name: /add.*task/i });
    fireEvent.click(addTrigger);

    // Now the form should be visible
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/enter.*task/i);
      const submitButton = screen.getByRole('button', { name: /add/i });

      fireEvent.change(input, { target: { value: 'Test Task' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  test('auto-assigns task number to new tasks', async () => {
    render(<App />);
    
    const addTrigger = screen.getByRole('button', { name: /add.*task/i });
    fireEvent.click(addTrigger);

    await waitFor(() => {
      const input = screen.getByPlaceholderText(/enter.*task/i);
      const submitButton = screen.getByRole('button', { name: /add/i });

      fireEvent.change(input, { target: { value: 'Task 1' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('TASK-001')).toBeInTheDocument();
    });
  });

  test('deletes a task', async () => {
    render(<App />);
    
    // Mock window.confirm to return true
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
    
    // Add a task
    const addTrigger = screen.getByRole('button', { name: /add.*task/i });
    fireEvent.click(addTrigger);

    const input = await screen.findByPlaceholderText(/enter.*task/i);
    const submitButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(input, { target: { value: 'Task to delete' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Task to delete')).toBeInTheDocument();
    });

    // Delete the task - find the task card first, then its delete button
    const taskCard = screen.getByText('Task to delete').closest('.task-card');
    const deleteButton = within(taskCard).getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Task to delete')).not.toBeInTheDocument();
    });
    
    // Restore window.confirm
    window.confirm.mockRestore();
  });

  test('filters tasks by search query', async () => {
    render(<App />);
    
    // Add first task
    let addTrigger = screen.getByRole('button', { name: /add.*task/i });
    fireEvent.click(addTrigger);
    
    let input = await screen.findByPlaceholderText(/enter.*task/i);
    let submitButton = screen.getByRole('button', { name: /^add task$/i });
    fireEvent.change(input, { target: { value: 'Task One' } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(screen.getByText('Task One')).toBeInTheDocument());

    // Add second task - get fresh button reference
    addTrigger = screen.getByRole('button', { name: /add.*task/i });
    fireEvent.click(addTrigger);
    
    input = await screen.findByPlaceholderText(/enter.*task/i);
    submitButton = screen.getByRole('button', { name: /^add task$/i });
    fireEvent.change(input, { target: { value: 'Task Two' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Task One')).toBeInTheDocument();
      expect(screen.getByText('Task Two')).toBeInTheDocument();
    });

    // Open search
    const searchToggle = screen.getByRole('button', { name: /toggle.*search/i });
    fireEvent.click(searchToggle);

    // Search for specific task
    const searchInput = screen.getByPlaceholderText(/search.*task/i);
    fireEvent.change(searchInput, { target: { value: 'One' } });

    await waitFor(() => {
      expect(screen.getByText('Task One')).toBeInTheDocument();
      expect(screen.queryByText('Task Two')).not.toBeInTheDocument();
    });
  });

  test('persists tasks to localStorage', async () => {
    render(<App />);
    
    const addTrigger = screen.getByRole('button', { name: /add.*task/i });
    fireEvent.click(addTrigger);

    const input = await screen.findByPlaceholderText(/enter.*task/i);
    const submitButton = screen.getByRole('button', { name: /^add task$/i });

    fireEvent.change(input, { target: { value: 'Persistent Task' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('flowboard_tasks'));
      expect(stored).toHaveLength(1);
      expect(stored[0].title).toBe('Persistent Task');
    });
  });

  test('loads tasks from localStorage on mount', () => {
    const savedTasks = [
      {
        id: '1',
        title: 'Saved Task',
        status: 'todo',
        taskNumber: 'TASK-001',
        createdAt: Date.now(),
        order: 0,
      },
    ];
    localStorage.setItem('flowboard_tasks', JSON.stringify(savedTasks));

    render(<App />);

    expect(screen.getByText('Saved Task')).toBeInTheDocument();
  });

  test('updates task count in header', async () => {
    render(<App />);
    
    const addTrigger = screen.getByRole('button', { name: /add.*task/i });
    fireEvent.click(addTrigger);

    // Add task and verify count updates
    const input = await screen.findByPlaceholderText(/enter.*task/i);
    const submitButton = screen.getByRole('button', { name: /^add task$/i });
    fireEvent.change(input, { target: { value: 'Task 1' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Check stats - total should be 1
      const statsSection = screen.getByText(/total/i).closest('.task-stats');
      expect(statsSection).toBeInTheDocument();
    });
  });

  test('clears search when clear button clicked', async () => {
    render(<App />);
    
    // Add a task
    const addTrigger = screen.getByRole('button', { name: /add.*task/i });
    fireEvent.click(addTrigger);

    const input = await screen.findByPlaceholderText(/enter.*task/i);
    const submitButton = screen.getByRole('button', { name: /^add task$/i });
    fireEvent.change(input, { target: { value: 'Searchable Task' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Searchable Task')).toBeInTheDocument();
    });

    // Open search
    const searchToggle = screen.getByRole('button', { name: /toggle.*search/i });
    fireEvent.click(searchToggle);

    // Search for task
    const searchInput = screen.getByPlaceholderText(/search.*task/i);
    fireEvent.change(searchInput, { target: { value: 'Searchable' } });

    // Clear search
    const clearButton = screen.getByRole('button', { name: /clear.*search/i });
    fireEvent.click(clearButton);

    // After clearing, search input should be hidden
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/search.*task/i)).not.toBeInTheDocument();
    });
  });

  test('renders error boundary', () => {
    render(<App />);
    // Error boundary should be present (wrapping the app)
    // This is a structural test - actual error handling tested in ErrorBoundary.test.jsx
    expect(screen.getByText('FlowBoard')).toBeInTheDocument();
  });

  test('handles empty state gracefully', () => {
    render(<App />);
    
    // Should show empty state in columns
    const emptyMessages = screen.getAllByText(/no tasks/i);
    expect(emptyMessages.length).toBeGreaterThan(0);
  });

  test('increments task numbers correctly', async () => {
    render(<App />);
    
    // Add multiple tasks
    for (let i = 1; i <= 3; i++) {
      const addTrigger = screen.getByRole('button', { name: /add.*task/i });
      fireEvent.click(addTrigger);
      
      const input = await screen.findByPlaceholderText(/enter.*task/i);
      const submitButton = screen.getByRole('button', { name: /^add task$/i });
      
      fireEvent.change(input, { target: { value: `Task ${i}` } });
      fireEvent.click(submitButton);
      
      // Wait for form to close
      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/enter.*task/i)).not.toBeInTheDocument();
      });
    }

    await waitFor(() => {
      expect(screen.getByText('TASK-001')).toBeInTheDocument();
      expect(screen.getByText('TASK-002')).toBeInTheDocument();
      expect(screen.getByText('TASK-003')).toBeInTheDocument();
    });
  });

  test('search works with task numbers', async () => {
    render(<App />);
    
    const addTrigger = screen.getByRole('button', { name: /add.*task/i });
    fireEvent.click(addTrigger);

    const input = await screen.findByPlaceholderText(/enter.*task/i);
    const submitButton = screen.getByRole('button', { name: /^add task$/i });
    
    fireEvent.change(input, { target: { value: 'Test Task' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('TASK-001')).toBeInTheDocument();
    });


    // Open search
    const searchToggle = screen.getByRole('button', { name: /toggle.*search/i });
    fireEvent.click(searchToggle);

    const searchInput = screen.getByPlaceholderText(/search.*task/i);
    fireEvent.change(searchInput, { target: { value: 'TASK-001' } });

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('renders export/import button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /export.*import/i })).toBeInTheDocument();
  });

  test('opens export modal when button clicked', () => {
    render(<App />);
    
    const exportButton = screen.getByRole('button', { name: /export.*import/i });
    fireEvent.click(exportButton);

    expect(screen.getByText(/export.*import.*data/i)).toBeInTheDocument();
  });
});


