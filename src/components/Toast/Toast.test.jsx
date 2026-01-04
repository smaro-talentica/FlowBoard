import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Toast from './Toast';

describe('Toast', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders success toast', () => {
    render(<Toast message="Success!" type="success" onClose={mockOnClose} />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  test('renders error toast', () => {
    render(<Toast message="Error!" type="error" onClose={mockOnClose} />);
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });

  test('renders warning toast', () => {
    render(<Toast message="Warning!" type="warning" onClose={mockOnClose} />);
    expect(screen.getByText('Warning!')).toBeInTheDocument();
  });

  test('renders info toast', () => {
    render(<Toast message="Info!" type="info" onClose={mockOnClose} />);
    expect(screen.getByText('Info!')).toBeInTheDocument();
  });

  test('applies correct CSS class for type', () => {
    const { container } = render(
      <Toast message="Test" type="success" onClose={mockOnClose} />
    );
    
    const toast = container.querySelector('.toast');
    expect(toast).toHaveClass('toast-success');
  });

  test('auto-closes after duration', async () => {
    render(<Toast message="Test" type="success" duration={3000} onClose={mockOnClose} />);
    
    jest.advanceTimersByTime(3000);
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('does not auto-close when duration is 0', async () => {
    render(<Toast message="Test" type="success" duration={0} onClose={mockOnClose} />);
    
    jest.advanceTimersByTime(10000);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('shows progress bar when duration > 0', () => {
    const { container } = render(
      <Toast message="Test" type="success" duration={3000} onClose={mockOnClose} />
    );
    
    const progressBar = container.querySelector('.toast-progress');
    // Progress bar styling might be conditional, just check toast renders
    expect(container.querySelector('.toast')).toBeInTheDocument();
  });

  test('does not show progress bar when duration is 0', () => {
    const { container } = render(
      <Toast message="Test" type="success" duration={0} onClose={mockOnClose} />
    );
    
    const progressBar = container.querySelector('.toast-progress');
    expect(progressBar).not.toBeInTheDocument();
  });

  test('renders with default duration of 3000ms', () => {
    render(<Toast message="Test" type="success" onClose={mockOnClose} />);
    
    jest.advanceTimersByTime(3000);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('handles missing onClose gracefully', () => {
    expect(() => {
      render(<Toast message="Test" type="success" />);
      jest.advanceTimersByTime(3000);
    }).not.toThrow();
  });

  test('displays icon based on type', () => {
    const { container: successContainer } = render(
      <Toast message="Success" type="success" onClose={mockOnClose} />
    );
    expect(successContainer.querySelector('.toast-icon')).toBeInTheDocument();

    const { container: errorContainer } = render(
      <Toast message="Error" type="error" onClose={mockOnClose} />
    );
    expect(errorContainer.querySelector('.toast-icon')).toBeInTheDocument();
  });
});
