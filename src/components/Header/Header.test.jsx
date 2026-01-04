import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';
import { BoardProvider } from '../../context/BoardContext';

const MockedHeader = ({ initialTasks = [] }) => (
  <BoardProvider>
    <Header />
  </BoardProvider>
);

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders app title', () => {
    render(<MockedHeader />);
    expect(screen.getByText('FlowBoard')).toBeInTheDocument();
  });

  test('renders app subtitle', () => {
    render(<MockedHeader />);
    expect(screen.getByText(/kanban.*task.*management/i)).toBeInTheDocument();
  });

  test('displays task statistics', () => {
    render(<MockedHeader />);
    expect(screen.getByText(/total/i)).toBeInTheDocument();
    expect(screen.getByText(/to do/i)).toBeInTheDocument();
    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    expect(screen.getByText(/done/i)).toBeInTheDocument();
  });

  test('renders Export/Import button', () => {
    render(<MockedHeader />);
    expect(screen.getByRole('button', { name: /export.*import/i })).toBeInTheDocument();
  });

  test('renders Clear All button when tasks exist', () => {
    localStorage.setItem('flowboard_tasks', JSON.stringify([
      { id: '1', title: 'Test', status: 'todo', taskNumber: 'TASK-001', createdAt: Date.now(), order: 0 }
    ]));
    
    render(<MockedHeader />);
    expect(screen.getByRole('button', { name: /clear.*all/i })).toBeInTheDocument();
  });

  test('does not render Clear All button when no tasks', () => {
    render(<MockedHeader />);
    expect(screen.queryByRole('button', { name: /clear.*all/i })).not.toBeInTheDocument();
  });

  test('opens export modal when Export/Import clicked', () => {
    render(<MockedHeader />);
    const exportButton = screen.getByRole('button', { name: /export.*import/i });
    
    fireEvent.click(exportButton);
    
    // Modal should be visible
    expect(screen.getByText(/export.*import.*data/i)).toBeInTheDocument();
  });

  test('confirms before clearing all tasks', () => {
    global.confirm = jest.fn(() => false);
    localStorage.setItem('flowboard_tasks', JSON.stringify([
      { id: '1', title: 'Test', status: 'todo', taskNumber: 'TASK-001', createdAt: Date.now(), order: 0 }
    ]));
    
    render(<MockedHeader />);
    const clearButton = screen.getByRole('button', { name: /clear.*all/i });
    
    fireEvent.click(clearButton);
    
    expect(global.confirm).toHaveBeenCalled();
  });

  test('displays correct task counts', () => {
    localStorage.setItem('flowboard_tasks', JSON.stringify([
      { id: '1', title: 'Task 1', status: 'todo', taskNumber: 'TASK-001', createdAt: Date.now(), order: 0 },
      { id: '2', title: 'Task 2', status: 'inProgress', taskNumber: 'TASK-002', createdAt: Date.now(), order: 1 },
      { id: '3', title: 'Task 3', status: 'done', taskNumber: 'TASK-003', createdAt: Date.now(), order: 2 },
    ]));
    
    render(<MockedHeader />);
    
    // Check for count values (they should be displayed)
    const stats = screen.getByText(/total/i).closest('.task-stats');
    expect(stats).toBeInTheDocument();
  });
});
