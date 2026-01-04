/**
 * Task Helper Utilities
 * Pure functions for task operations
 */

import { COLUMN_STATUS, VALIDATION } from '../constants';

/**
 * Create a new task object
 * @param {string} title - Task title
 * @param {string} taskNumber - Task number (e.g., TASK-001)
 * @param {string} status - Initial status
 * @param {number} order - Order in column
 * @returns {Object} Task object
 */
export const createTask = (title, taskNumber, status = COLUMN_STATUS.TODO, order = 0) => {
  return {
    id: generateTaskId(),
    taskNumber,
    title: title.trim(),
    status,
    createdAt: Date.now(),
    order
  };
};

/**
 * Generate unique task ID
 * @returns {string} Unique ID
 */
export const generateTaskId = () => {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate task title
 * @param {string} title - Title to validate
 * @returns {Object} { isValid, error }
 */
export const validateTaskTitle = (title) => {
  const trimmed = title.trim();
  
  if (trimmed.length < VALIDATION.TASK_TITLE_MIN_LENGTH) {
    return {
      isValid: false,
      error: 'Task title cannot be empty'
    };
  }
  
  if (trimmed.length > VALIDATION.TASK_TITLE_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Task title cannot exceed ${VALIDATION.TASK_TITLE_MAX_LENGTH} characters`
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

/**
 * Filter tasks by status
 * @param {Array} tasks - All tasks
 * @param {string} status - Status to filter by
 * @returns {Array} Filtered tasks
 */
export const filterTasksByStatus = (tasks, status) => {
  return tasks.filter(task => task.status === status);
};

/**
 * Sort tasks by order
 * @param {Array} tasks - Tasks to sort
 * @returns {Array} Sorted tasks
 */
export const sortTasksByOrder = (tasks) => {
  return [...tasks].sort((a, b) => a.order - b.order);
};

/**
 * Get next column status
 * @param {string} currentStatus - Current status
 * @returns {string|null} Next status or null
 */
export const getNextStatus = (currentStatus) => {
  switch (currentStatus) {
    case COLUMN_STATUS.TODO:
      return COLUMN_STATUS.IN_PROGRESS;
    case COLUMN_STATUS.IN_PROGRESS:
      return COLUMN_STATUS.DONE;
    default:
      return null;
  }
};

/**
 * Get previous column status
 * @param {string} currentStatus - Current status
 * @returns {string|null} Previous status or null
 */
export const getPreviousStatus = (currentStatus) => {
  switch (currentStatus) {
    case COLUMN_STATUS.DONE:
      return COLUMN_STATUS.IN_PROGRESS;
    case COLUMN_STATUS.IN_PROGRESS:
      return COLUMN_STATUS.TODO;
    default:
      return null;
  }
};

/**
 * Reorder tasks after drag and drop
 * @param {Array} tasks - All tasks
 * @param {string} taskId - Task being moved
 * @param {string} newStatus - New status
 * @param {number} newOrder - New order in column
 * @returns {Array} Updated tasks
 */
export const reorderTasks = (tasks, taskId, newStatus, newOrder = 0) => {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return tasks;

  const oldStatus = task.status;
  
  // Get tasks in source and destination columns
  const sourceColumnTasks = tasks.filter(t => t.status === oldStatus && t.id !== taskId);
  const destColumnTasks = tasks.filter(t => t.status === newStatus && t.id !== taskId);
  
  // Reorder source column
  const updatedSourceTasks = sourceColumnTasks.map((t, index) => ({
    ...t,
    order: index
  }));
  
  // Insert task at new position in destination column
  destColumnTasks.splice(newOrder, 0, { ...task, status: newStatus, order: newOrder });
  
  // Reorder destination column
  const updatedDestTasks = destColumnTasks.map((t, index) => ({
    ...t,
    status: newStatus,
    order: index
  }));
  
  // Merge all tasks
  const otherTasks = tasks.filter(
    t => t.status !== oldStatus && t.status !== newStatus
  );
  
  return [...otherTasks, ...updatedSourceTasks, ...updatedDestTasks];
};

/**
 * Get task counts by status
 * @param {Array} tasks - All tasks
 * @returns {Object} Counts object
 */
export const getTaskCounts = (tasks) => {
  return {
    todo: tasks.filter(t => t.status === COLUMN_STATUS.TODO).length,
    inProgress: tasks.filter(t => t.status === COLUMN_STATUS.IN_PROGRESS).length,
    done: tasks.filter(t => t.status === COLUMN_STATUS.DONE).length,
    total: tasks.length
  };
};

/**
 * Search tasks by title
 * @param {Array} tasks - All tasks
 * @param {string} query - Search query
 * @returns {Array} Matching tasks
 */
export const searchTasks = (tasks, query) => {
  if (!query || query.trim() === '') {
    return tasks;
  }
  
  const lowerQuery = query.toLowerCase();
  return tasks.filter(task => 
    task.title.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Filter tasks by title or task number
 * @param {Array} tasks - All tasks
 * @param {string} query - Search query
 * @returns {Array} Matching tasks
 */
export const filterTasks = (tasks, query) => {
  if (!query || query.trim() === '') {
    return tasks;
  }
  
  const lowerQuery = query.toLowerCase();
  return tasks.filter(task => 
    task.title.toLowerCase().includes(lowerQuery) ||
    (task.taskNumber && task.taskNumber.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Format date for display
 * @param {number} timestamp - Timestamp
 * @returns {string} Formatted date
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Get relative time string
 * @param {number} timestamp - Timestamp
 * @returns {string} Relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

export default {
  createTask,
  generateTaskId,
  validateTaskTitle,
  filterTasksByStatus,
  filterTasks,
  sortTasksByOrder,
  getNextStatus,
  getPreviousStatus,
  reorderTasks,
  getTaskCounts,
  searchTasks,
  formatDate,
  getRelativeTime
};
