import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for managing state history (undo/redo functionality)
 * @param {*} initialState - Initial state value
 * @param {number} maxHistory - Maximum history size (default: 50)
 * @returns {Object} State and history control methods
 */
const useHistory = (initialState, maxHistory = 50) => {
  const [state, setState] = useState(initialState);
  const historyRef = useRef([initialState]);
  const indexRef = useRef(0);

  const setStateWithHistory = useCallback((newState) => {
    setState(newState);
    
    // Remove any future states if we're not at the end
    historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
    
    // Add new state
    historyRef.current.push(newState);
    
    // Limit history size
    if (historyRef.current.length > maxHistory) {
      historyRef.current.shift();
    } else {
      indexRef.current = historyRef.current.length - 1;
    }
  }, [maxHistory]);

  const undo = useCallback(() => {
    if (indexRef.current > 0) {
      indexRef.current -= 1;
      setState(historyRef.current[indexRef.current]);
    }
  }, []);

  const redo = useCallback(() => {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current += 1;
      setState(historyRef.current[indexRef.current]);
    }
  }, []);

  const canUndo = indexRef.current > 0;
  const canRedo = indexRef.current < historyRef.current.length - 1;

  return {
    state,
    setState: setStateWithHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};

export default useHistory;
