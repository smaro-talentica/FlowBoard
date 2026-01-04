import { renderHook, act } from '@testing-library/react';
import useHistory from './useHistory';

describe('useHistory', () => {
  test('initializes with initial state', () => {
    const initialState = { count: 0 };
    const { result } = renderHook(() => useHistory(initialState));

    expect(result.current.state).toEqual({ count: 0 });
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  test('setState updates current state', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.setState({ count: 1 });
    });

    expect(result.current.state).toEqual({ count: 1 });
  });

  test('setState enables undo after change', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.setState({ count: 1 });
    });

    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  test('undo restores previous state', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.setState({ count: 1 });
      result.current.setState({ count: 2 });
    });

    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toEqual({ count: 1 });
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(true);
  });

  test('redo restores next state', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.setState({ count: 1 });
      result.current.setState({ count: 2 });
      result.current.undo();
    });

    act(() => {
      result.current.redo();
    });

    expect(result.current.state).toEqual({ count: 2 });
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  test('undo does nothing when no history', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toEqual({ count: 0 });
    expect(result.current.canUndo).toBe(false);
  });

  test('redo does nothing when no future', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.setState({ count: 1 });
      result.current.redo();
    });

    expect(result.current.state).toEqual({ count: 1 });
    expect(result.current.canRedo).toBe(false);
  });

  test('setState clears redo history', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.setState({ count: 1 });
      result.current.setState({ count: 2 });
      result.current.undo();
    });

    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.setState({ count: 3 });
    });

    expect(result.current.canRedo).toBe(false);
  });

  test('handles multiple undo/redo operations', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }));

    act(() => {
      result.current.setState({ count: 1 });
      result.current.setState({ count: 2 });
      result.current.setState({ count: 3 });
    });

    act(() => {
      result.current.undo();
      result.current.undo();
    });

    expect(result.current.state).toEqual({ count: 1 });

    act(() => {
      result.current.redo();
    });

    expect(result.current.state).toEqual({ count: 2 });
  });

  test('respects maxHistory limit', () => {
    const { result } = renderHook(() => useHistory({ count: 0 }, 3));

    act(() => {
      result.current.setState({ count: 1 });
      result.current.setState({ count: 2 });
      result.current.setState({ count: 3 });
      result.current.setState({ count: 4 });
    });

    // Should have current state + 2 previous states (maxHistory - 1)
    let undoCount = 0;
    while (result.current.canUndo) {
      act(() => {
        result.current.undo();
      });
      undoCount++;
    }

    expect(undoCount).toBe(2);
  });

  test('handles object state updates', () => {
    const { result } = renderHook(() => useHistory({ name: 'John', age: 30 }));

    act(() => {
      result.current.setState({ name: 'Jane', age: 30 });
    });

    expect(result.current.state).toEqual({ name: 'Jane', age: 30 });

    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toEqual({ name: 'John', age: 30 });
  });
});
