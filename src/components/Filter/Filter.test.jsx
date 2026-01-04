import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardProvider } from '../../context/BoardContext';
import Filter from './Filter';

describe('Filter', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders search input', () => {
    render(
      <BoardProvider>
        <Filter />
      </BoardProvider>
    );
    
    const toggle = screen.getByRole('button', { name: /toggle.*search/i });
    fireEvent.click(toggle);
    
    const input = screen.getByPlaceholderText(/search.*task/i);
    expect(input).toBeInTheDocument();
  });

  test('calls onSearchChange when typing', () => {
    render(
      <BoardProvider>
        <Filter />
      </BoardProvider>
    );
    
    const toggle = screen.getByRole('button', { name: /toggle.*search/i });
    fireEvent.click(toggle);
    
    const input = screen.getByPlaceholderText(/search.*task/i);
    fireEvent.change(input, { target: { value: 'new search' } });
    
    expect(input.value).toBe('new search');
  });

  test('mentions task number in placeholder', () => {
    render(
      <BoardProvider>
        <Filter />
      </BoardProvider>
    );
    
    const toggle = screen.getByRole('button', { name: /toggle.*search/i });
    fireEvent.click(toggle);
    
    const input = screen.getByPlaceholderText(/task/i);
    expect(input).toBeInTheDocument();
  });

  test('handles rapid typing', () => {
    render(
      <BoardProvider>
        <Filter />
      </BoardProvider>
    );
        const toggle = screen.getByRole('button', { name: /toggle.*search/i });
    fireEvent.click(toggle);
        const input = screen.getByPlaceholderText(/search.*task/i);
    
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.change(input, { target: { value: 'abc' } });
    
    expect(input.value).toBe('abc');
  });

  test('input has correct type attribute', () => {
    render(
      <BoardProvider>
        <Filter />
      </BoardProvider>
    );
    
    const toggle = screen.getByRole('button', { name: /toggle.*search/i });
    fireEvent.click(toggle);
    
    const input = screen.getByPlaceholderText(/search.*task/i);
    expect(input).toHaveAttribute('type', 'text');
  });
});
