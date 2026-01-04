import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BoardProvider } from '../../context/BoardContext';
import ExportModal from './ExportModal';

// Mock the export/import helpers
jest.mock('../../utils/exportHelpers', () => ({
  exportToJSON: jest.fn(() => ({ success: true, count: 2 })),
  exportToCSV: jest.fn(() => ({ success: true, count: 2 })),
  importFromJSON: jest.fn(),
  getExportStats: jest.fn(() => ({ 
    total: 2, 
    byStatus: { todo: 1, inProgress: 0, done: 1 },
    withDescription: 0,
    oldestTask: null,
    newestTask: null
  })),
}));

import { exportToJSON, exportToCSV, importFromJSON } from '../../utils/exportHelpers';

describe('ExportModal', () => {
  const mockTasks = [
    { id: '1', title: 'Task 1', status: 'todo', taskNumber: 'TASK-001', createdAt: Date.now(), order: 0 },
    { id: '2', title: 'Task 2', status: 'done', taskNumber: 'TASK-002', createdAt: Date.now(), order: 1 },
  ];

  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('flowboard_tasks', JSON.stringify(mockTasks));
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders modal when open', () => {
    render(
      <BoardProvider>
        <ExportModal {...mockProps} />
      </BoardProvider>
    );
    expect(screen.getByText(/export.*import.*data/i)).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    render(
      <BoardProvider>
        <ExportModal {...mockProps} isOpen={false} />
      </BoardProvider>
    );
    expect(screen.queryByText(/export.*import.*data/i)).not.toBeInTheDocument();
  });

  test('displays task statistics', () => {
    render(
      <BoardProvider>
        <ExportModal {...mockProps} />
      </BoardProvider>
    );
    expect(screen.getByText(/total/i)).toBeInTheDocument();
  });

  test('shows JSON and CSV export options', () => {
    render(
      <BoardProvider>
        <ExportModal {...mockProps} />
      </BoardProvider>
    );
    expect(screen.getByLabelText(/json/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/csv/i)).toBeInTheDocument();
  });

  test('JSON is selected by default', () => {
    render(
      <BoardProvider>
        <ExportModal {...mockProps} />
      </BoardProvider>
    );
    const jsonRadio = screen.getByLabelText(/json/i);
    expect(jsonRadio).toBeChecked();
  });

  test('can switch to CSV format', () => {
    render(
      <BoardProvider>
        <ExportModal {...mockProps} />
      </BoardProvider>
    );
    const csvRadio = screen.getByLabelText(/csv/i);
    
    fireEvent.click(csvRadio);
    
    expect(csvRadio).toBeChecked();
  });

  test('calls exportToJSON when exporting JSON', () => {
    exportToJSON.mockReturnValue({ success: true, count: 2 });
    render(
      <BoardProvider>
        <ExportModal {...mockProps} />
      </BoardProvider>
    );
    const exportButton = screen.getByRole('button', { name: /export.*2.*tasks/i });
    
    fireEvent.click(exportButton);
    
    expect(exportToJSON).toHaveBeenCalled();
  });

  test('disables export button when no tasks', () => {
    localStorage.clear();
    render(
      <BoardProvider>
        <ExportModal {...mockProps} />
      </BoardProvider>
    );
    const exportButton = screen.getByRole('button', { name: /export.*0.*tasks/i });
    
    expect(exportButton).toBeDisabled();
  });

  test('renders import section', () => {
    render(
      <BoardProvider>
        <ExportModal {...mockProps} />
      </BoardProvider>
    );
    expect(screen.getByRole('heading', { name: /import.*tasks/i })).toBeInTheDocument();
  });
});
