/**
 * localStorage Utility Functions
 * Handles all localStorage operations with error handling
 */

import { STORAGE_KEYS, ERROR_MESSAGES } from '../constants';

/**
 * Saves data to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be JSON stringified)
 * @returns {boolean} - Success status
 */
export const setItem = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    
    // Check if it's a quota exceeded error
    if (error.name === 'QuotaExceededError') {
      console.error(ERROR_MESSAGES.STORAGE_FULL);
    }
    
    return false;
  }
};

/**
 * Retrieves data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} - Parsed value or default value
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    
    if (item === null) {
      return defaultValue;
    }
    
    return JSON.parse(item);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    console.error(ERROR_MESSAGES.INVALID_DATA);
    return defaultValue;
  }
};

/**
 * Removes an item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} - Success status
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
};

/**
 * Clears all localStorage data
 * @returns {boolean} - Success status
 */
export const clearAll = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Checks if localStorage is available
 * @returns {boolean} - True if localStorage is available
 */
export const isLocalStorageAvailable = () => {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('localStorage is not available:', error);
    return false;
  }
};

/**
 * Gets the size of localStorage in bytes
 * @returns {number} - Size in bytes
 */
export const getStorageSize = () => {
  let total = 0;
  
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  
  return total;
};

/**
 * Task-specific storage functions
 */

/**
 * Saves tasks array to localStorage
 * @param {Array} tasks - Array of task objects
 * @returns {boolean} - Success status
 */
export const saveTasks = (tasks) => {
  return setItem(STORAGE_KEYS.TASKS, tasks);
};

/**
 * Loads tasks array from localStorage
 * @returns {Array} - Array of task objects
 */
export const loadTasks = () => {
  const tasks = getItem(STORAGE_KEYS.TASKS, []);
  
  // Validate that it's an array
  if (!Array.isArray(tasks)) {
    console.error('Loaded tasks is not an array, returning empty array');
    return [];
  }
  
  return tasks;
};

/**
 * Validates task data structure
 * @param {Object} task - Task object to validate
 * @returns {Object} - Validation result with valid flag and errors array
 */
export const validateTask = (task) => {
  const errors = [];
  
  if (!task || typeof task !== 'object') {
    errors.push('Task must be an object');
    return { valid: false, errors };
  }
  
  if (typeof task.id !== 'string' || !task.id) {
    errors.push('Task must have a valid id');
  }
  
  if (typeof task.title !== 'string' || !task.title.trim()) {
    errors.push('Task must have a valid title');
  }
  
  if (typeof task.status !== 'string' || !task.status) {
    errors.push('Task must have a valid status');
  }
  
  if (typeof task.createdAt !== 'number') {
    errors.push('Task must have a valid createdAt timestamp');
  }
  
  if (typeof task.order !== 'number') {
    errors.push('Task must have a valid order number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validates and filters tasks array
 * @param {Array} tasks - Tasks array to validate
 * @returns {Array} - Validated tasks array
 */
export const validateTasks = (tasks) => {
  if (!Array.isArray(tasks)) {
    return [];
  }
  
  return tasks.filter(task => {
    const validation = validateTask(task);
    return validation.valid;
  });
};

/**
 * Saves application settings to localStorage
 * @param {Object} settings - Settings object
 * @returns {boolean} - Success status
 */
export const saveSettings = (settings) => {
  return setItem(STORAGE_KEYS.SETTINGS, settings);
};

/**
 * Loads application settings from localStorage
 * @returns {Object} - Settings object
 */
export const loadSettings = () => {
  return getItem(STORAGE_KEYS.SETTINGS, {
    theme: 'light',
    showCompletedTasks: true
  });
};

export default {
  setItem,
  getItem,
  removeItem,
  clearAll,
  isLocalStorageAvailable,
  getStorageSize,
  saveTasks,
  loadTasks,
  validateTask,
  validateTasks,
  saveSettings,
  loadSettings
};
