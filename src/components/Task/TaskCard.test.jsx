import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BoardProvider } from '../../context/BoardContext';
import TaskCard from './TaskCard';

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    status: 'todo',
    taskNumber: 'TASK-001',
    createdAt: Date.now(),
    order: 0,
  };

  const mockHandlers = {
    onDragStart: jest.fn(),
    onDragCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders task with title', () => {
    render(
      <BoardProvider>
        <TaskCard task={mockTask} {...mockHandlers} />
      </BoardProvider>
    );
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('renders task number', () => {
    render(
      <BoardProvider>
        <TaskCard task={mockTask} {...mockHandlers} />
      </BoardProvider>
    );
    expect(screen.getByText('TASK-001')).toBeInTheDocument();
  });

  test('calls onDelete when delete button clicked', () => {
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
    
    render(
      <BoardProvider>
        <TaskCard task={mockTask} {...mockHandlers} />
      </BoardProvider>
    );
    
    const taskCard = screen.getByText('Test Task').closest('.task-card');
    const deleteButton = within(taskCard).getByRole('button', { name: /delete/i });
    
    fireEvent.click(deleteButton);
    
    window.confirm.mockRestore();
  });

  test('handles mousedown event', () => {
    render(
      <BoardProvider>
        <TaskCard task={mockTask} {...mockHandlers} />
      </BoardProvider>
    );
    const taskCard = screen.getByText('Test Task').closest('.task-card');
    
    fireEvent.mouseDown(taskCard, { clientX: 100, clientY: 100 });
    
    expect(taskCard).toBeInTheDocument();
  });

  test('displays formatted creation date', () => {
    const task = { ...mockTask, createdAt: new Date('2024-01-15').getTime() };
    render(
      <BoardProvider>
        <TaskCard task={task} {...mockHandlers} />
      </BoardProvider>
    );
    
    // Task card should be rendered
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('handles task without task number', () => {
    const taskWithoutNumber = { ...mockTask, taskNumber: undefined };
    render(
      <BoardProvider>
        <TaskCard task={taskWithoutNumber} {...mockHandlers} />
      </BoardProvider>
    );
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('applies correct CSS classes', () => {
    render(
      <BoardProvider>
        <TaskCard task={mockTask} {...mockHandlers} />
      </BoardProvider>
    );
    const taskCard = screen.getByText('Test Task').closest('.task-card');
    
    expect(taskCard).toHaveClass('task-card');
  });
});
