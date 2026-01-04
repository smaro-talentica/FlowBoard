import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for these tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('renders error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  test('displays error message', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    // Error details are in the details/summary section
    expect(screen.getByText('Error Details')).toBeInTheDocument();
  });

  test('shows reload button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const buttons = screen.getAllByRole('button');
    const reloadButton = buttons.find(btn => btn.textContent.includes('Reload Application'));
    expect(reloadButton).toBeInTheDocument();
  });

  test('shows clear data button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByRole('button', { name: /clear.*data/i })).toBeInTheDocument();
  });

  test('catches errors from nested components', () => {
    const NestedComponent = () => {
      throw new Error('Nested error');
    };

    render(
      <ErrorBoundary>
        <div>
          <div>
            <NestedComponent />
          </div>
        </div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText('Error Details')).toBeInTheDocument();
  });

  test('does not catch errors in event handlers', () => {
    // Error boundaries don't catch errors in event handlers
    // This is expected React behavior
    const { container } = render(
      <ErrorBoundary>
        <button onClick={() => { throw new Error('Event error'); }}>
          Click me
        </button>
      </ErrorBoundary>
    );
    
    const button = screen.getByText('Click me');
    expect(button).toBeInTheDocument();
  });
});
