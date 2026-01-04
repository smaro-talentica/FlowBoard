/**
 * BoardContext - Global state management for FlowBoard
 * Provides task state and operations to all components
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { COLUMN_STATUS, STORAGE_KEYS } from '../constants';
import { saveTasks, loadTasks, validateTasks } from '../utils/localStorage';

// Create Context
const BoardContext = createContext(undefined);

/**
 * Custom hook to use Board Context
 * @returns {Object} Context value with tasks and operations
 */
export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};

/**
 * BoardProvider Component
 * Wraps the application and provides task state and operations
 */
export const BoardProvider = ({ children }) => {
  // Load initial tasks from localStorage
  const [tasks, setTasks] = useState(() => {
    const loadedTasks = loadTasks();
    return validateTasks(loadedTasks);
  });

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const lastTaskNumberRef = useRef(0);

  // Initialize last task number from localStorage
  useEffect(() => {
    const savedLastNumber = localStorage.getItem(STORAGE_KEYS.LAST_TASK_NUMBER);
    if (savedLastNumber) {
      lastTaskNumberRef.current = parseInt(savedLastNumber, 10);
    } else {
      // If no saved number, calculate from existing tasks
      const maxNumber = tasks.reduce((max, task) => {
        if (task.taskNumber) {
          const num = parseInt(task.taskNumber.replace('TASK-', ''), 10);
          return num > max ? num : max;
        }
        return max;
      }, 0);
      lastTaskNumberRef.current = maxNumber;
      localStorage.setItem(STORAGE_KEYS.LAST_TASK_NUMBER, maxNumber.toString());
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  /**
   * Generate unique ID for new tasks
   * @returns {string} Unique ID
   */
  const generateId = useCallback(() => {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Add a new task to the To Do column
   * @param {string} title - Task title
   * @returns {Object} Created task
   */
  const addTask = useCallback((title) => {
    // Generate next task number
    lastTaskNumberRef.current += 1;
    const taskNumber = `TASK-${String(lastTaskNumberRef.current).padStart(3, '0')}`;
    
    // Save last task number to localStorage
    localStorage.setItem(STORAGE_KEYS.LAST_TASK_NUMBER, lastTaskNumberRef.current.toString());

    const newTask = {
      id: generateId(),
      taskNumber,
      title: title.trim(),
      status: COLUMN_STATUS.TODO,
      createdAt: Date.now(),
      order: tasks.filter(t => t.status === COLUMN_STATUS.TODO).length
    };

    setTasks(prevTasks => [...prevTasks, newTask]);
    return newTask;
  }, [tasks, generateId]);

  /**
   * Delete a task by ID
   * @param {string} taskId - Task ID to delete
   */
  const deleteTask = useCallback((taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, []);

  /**
   * Move a task to a different column
   * @param {string} taskId - Task ID to move
   * @param {string} newStatus - New column status
   */
  const moveTask = useCallback((taskId, newStatus) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus }
          : task
      )
    );
  }, []);

  /**
   * Update task properties
   * @param {string} taskId - Task ID to update
   * @param {Object} updates - Properties to update
   */
  const updateTask = useCallback((taskId, updates) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, ...updates }
          : task
      )
    );
  }, []);

  /**
   * Get tasks by column status
   * @param {string} status - Column status
   * @returns {Array} Filtered tasks
   */
  const getTasksByStatus = useCallback((status) => {
    const statusTasks = tasks
      .filter(task => task.status === status)
      .sort((a, b) => a.order - b.order);
    
    // Apply search query if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return statusTasks.filter(task => 
        task.taskNumber.toLowerCase().includes(query) ||
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    return statusTasks;
  }, [tasks, searchQuery]);

  /**
   * Get filtered tasks based on current filter
   * @returns {Array} Filtered tasks
   */
  const getFilteredTasks = useCallback(() => {
    if (filter === 'all') {
      return tasks;
    }
    return tasks.filter(task => task.status === filter);
  }, [tasks, filter]);

  /**
   * Clear all tasks
   */
  const clearAllTasks = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all tasks?')) {
      setTasks([]);
    }
  }, []);

  /**
   * Get task counts by status
   * @returns {Object} Count object
   */
  const getTaskCounts = useCallback(() => {
    return {
      todo: tasks.filter(t => t.status === COLUMN_STATUS.TODO).length,
      inProgress: tasks.filter(t => t.status === COLUMN_STATUS.IN_PROGRESS).length,
      done: tasks.filter(t => t.status === COLUMN_STATUS.DONE).length,
      total: tasks.length
    };
  }, [tasks]);

  // Context value
  const value = {
    tasks,
    setTasks,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    addTask,
    deleteTask,
    moveTask,
    updateTask,
    getTasksByStatus,
    getFilteredTasks,
    clearAllTasks,
    getTaskCounts
  };

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
};

export default BoardContext;
