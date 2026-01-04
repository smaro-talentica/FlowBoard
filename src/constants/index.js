/**
 * FlowBoard Constants
 * Central location for all application constants
 */

// Column Statuses
export const COLUMN_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'inProgress',
  DONE: 'done'
};

// Column Configuration
export const COLUMNS = [
  {
    id: COLUMN_STATUS.TODO,
    title: 'To Do',
    status: COLUMN_STATUS.TODO
  },
  {
    id: COLUMN_STATUS.IN_PROGRESS,
    title: 'In Progress',
    status: COLUMN_STATUS.IN_PROGRESS
  },
  {
    id: COLUMN_STATUS.DONE,
    title: 'Done',
    status: COLUMN_STATUS.DONE
  }
];

// localStorage Keys
export const STORAGE_KEYS = {
  TASKS: 'flowboard_tasks',
  SETTINGS: 'flowboard_settings',
  LAST_TASK_NUMBER: 'flowboard_last_task_number'
};

// Filter Options
export const FILTER_OPTIONS = {
  ALL: 'all',
  TODO: COLUMN_STATUS.TODO,
  IN_PROGRESS: COLUMN_STATUS.IN_PROGRESS,
  DONE: COLUMN_STATUS.DONE
};

// Task Schema Template
export const TASK_SCHEMA = {
  id: '',           // Unique identifier (UUID or timestamp-based)
  taskNumber: '',   // Auto-incrementing task number (e.g., TASK-001)
  title: '',        // Task title (string, required)
  status: '',       // One of COLUMN_STATUS values
  createdAt: 0,     // Timestamp (Date.now())
  order: 0          // Order within column (for future sorting)
};

// Validation Rules
export const VALIDATION = {
  TASK_TITLE_MIN_LENGTH: 1,
  TASK_TITLE_MAX_LENGTH: 200
};

// UI Constants
export const UI = {
  COLUMN_WIDTH_PERCENT: 33.33,
  MAX_TASK_DISPLAY_LENGTH: 100,
  DRAG_THRESHOLD: 5, // pixels to move before considering it a drag
  DEBOUNCE_DELAY: 300 // ms for debouncing operations
};

// Error Messages
export const ERROR_MESSAGES = {
  EMPTY_TITLE: 'Task title cannot be empty',
  TITLE_TOO_LONG: `Task title cannot exceed ${VALIDATION.TASK_TITLE_MAX_LENGTH} characters`,
  STORAGE_FULL: 'Unable to save tasks. Storage quota exceeded.',
  INVALID_DATA: 'Unable to load tasks. Data may be corrupted.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  TASK_ADDED: 'Task added successfully',
  TASK_DELETED: 'Task deleted',
  TASK_MOVED: 'Task moved'
};

// Drag and Drop
export const DRAG_DROP = {
  DRAGGING_CLASS: 'dragging',
  DRAG_OVER_CLASS: 'drag-over',
  DROP_ZONE_CLASS: 'drop-zone',
  GHOST_CLASS: 'drag-ghost'
};
