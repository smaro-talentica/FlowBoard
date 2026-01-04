import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardProvider } from '../../context/BoardContext';
import Column from './Column';

describe('Column', () => {
  const mockColumn = {
    id: 'todo',
    title: 'To Do',
    status: 'todo',
  };

  const mockTasks = [
    { id: '1', title: 'Task 1', status: 'todo', taskNumber: 'TASK-001', createdAt: Date.now(), order: 0 },
    { id: '2', title: 'Task 2', status: 'todo', taskNumber: 'TASK-002', createdAt: Date.now(), order: 1 },
  ];

  const mockHandlers = {
    onDragStart: jest.fn(),
    onDragOver: jest.fn(),
    onDrop: jest.fn(),
    onDragCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders column with title', () => {
    render(
      <BoardProvider>
        <Column column={mockColumn} tasks={[]} {...mockHandlers} />
      </BoardProvider>
    );
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  test('renders task count badge', () => {
    render(
      <BoardProvider>
        <Column column={mockColumn} tasks={mockTasks} {...mockHandlers} />
      </BoardProvider>
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('renders all tasks', () => {
    render(
      <BoardProvider>
        <Column column={mockColumn} tasks={mockTasks} {...mockHandlers} />
      </BoardProvider>
    );
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  test('shows empty state when no tasks', () => {
    render(
      <BoardProvider>
        <Column column={mockColumn} tasks={[]} {...mockHandlers} />
      </BoardProvider>
    );
    expect(screen.getByText(/no tasks|add.*task.*to.*get.*started/i)).toBeInTheDocument();
  });

  test('applies correct CSS classes', () => {
    const { container } = render(
      <BoardProvider>
        <Column column={mockColumn} tasks={[]} {...mockHandlers} />
      </BoardProvider>
    );
    const column = container.querySelector('.column');
    
    expect(column).toHaveClass('column');
  });

  test('renders TaskForm in todo column', () => {
    render(
      <BoardProvider>
        <Column column={mockColumn} tasks={[]} {...mockHandlers} />
      </BoardProvider>
    );
    
    // Check if task form trigger button is present (form is collapsed by default)
    const triggerButton = screen.queryByRole('button', { name: /add.*task/i });
    expect(triggerButton).toBeInTheDocument();
  });
});
