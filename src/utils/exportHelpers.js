/**
 * Export/Import Helpers
 * Utility functions for exporting and importing board data
 */

import { validateTask } from './localStorage';
import { COLUMN_STATUS } from '../constants';

/**
 * Export tasks to JSON file
 * @param {Array} tasks - Tasks to export
 * @param {string} filename - Optional filename
 */
export const exportToJSON = (tasks, filename = 'flowboard-export') => {
  try {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      tasks: tasks
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${Date.now()}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    return { success: true, count: tasks.length };
  } catch (error) {
    console.error('Export failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Import tasks from JSON file
 * @param {File} file - File to import
 * @returns {Promise} Resolves with imported tasks or error
 */
export const importFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (!file.name.endsWith('.json')) {
      reject(new Error('Invalid file type. Please select a JSON file.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const data = JSON.parse(content);

        // Validate data structure
        if (!data.tasks || !Array.isArray(data.tasks)) {
          reject(new Error('Invalid file format. Expected tasks array.'));
          return;
        }

        // Validate each task
        const validTasks = [];
        const errors = [];

        data.tasks.forEach((task, index) => {
          const validation = validateTask(task);
          if (validation.valid) {
            // Ensure task has taskNumber for backwards compatibility
            if (!task.taskNumber) {
              task.taskNumber = `TASK-${String(index + 1).padStart(3, '0')}`;
            }
            validTasks.push(task);
          } else {
            errors.push(`Task ${index + 1}: ${validation.errors.join(', ')}`);
          }
        });

        if (validTasks.length === 0) {
          reject(new Error('No valid tasks found in file.'));
          return;
        }

        resolve({
          success: true,
          tasks: validTasks,
          count: validTasks.length,
          errors: errors.length > 0 ? errors : null,
          skipped: errors.length
        });
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

/**
 * Export tasks to CSV format
 * @param {Array} tasks - Tasks to export
 * @param {string} filename - Optional filename
 */
export const exportToCSV = (tasks, filename = 'flowboard-export') => {
  try {
    const headers = ['ID', 'Title', 'Description', 'Status', 'Created At', 'Updated At'];
    const rows = tasks.map(task => [
      task.id,
      `"${(task.title || '').replace(/"/g, '""')}"`,
      `"${(task.description || '').replace(/"/g, '""')}"`,
      task.status,
      task.createdAt,
      task.updatedAt
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${Date.now()}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    return { success: true, count: tasks.length };
  } catch (error) {
    console.error('CSV export failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get export statistics
 * @param {Array} tasks - Tasks to analyze
 * @returns {Object} Export statistics
 */
export const getExportStats = (tasks) => {
  const stats = {
    total: tasks.length,
    byStatus: {
      todo: tasks.filter(t => t.status === COLUMN_STATUS.TODO).length,
      inProgress: tasks.filter(t => t.status === COLUMN_STATUS.IN_PROGRESS).length,
      done: tasks.filter(t => t.status === COLUMN_STATUS.DONE).length
    },
    withDescription: tasks.filter(t => t.description && t.description.trim()).length,
    oldestTask: tasks.length > 0 
      ? new Date(Math.min(...tasks.map(t => new Date(t.createdAt))))
      : null,
    newestTask: tasks.length > 0
      ? new Date(Math.max(...tasks.map(t => new Date(t.createdAt))))
      : null
  };

  return stats;
};
