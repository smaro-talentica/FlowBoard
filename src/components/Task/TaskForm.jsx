/**
 * TaskForm Component
 * Form to add new tasks to the To Do column
 */

import { useState } from 'react';
import { useBoard } from '../../context/BoardContext';
import { VALIDATION, ERROR_MESSAGES } from '../../constants';
import './TaskForm.css';

const TaskForm = () => {
  const { addTask } = useBoard();
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Validate task title
   * @param {string} value - Title to validate
   * @returns {string} Error message or empty string
   */
  const validateTitle = (value) => {
    const trimmed = value.trim();
    
    if (trimmed.length === 0) {
      return ERROR_MESSAGES.EMPTY_TITLE;
    }
    
    if (trimmed.length > VALIDATION.TASK_TITLE_MAX_LENGTH) {
      return ERROR_MESSAGES.TITLE_TOO_LONG;
    }
    
    return '';
  };

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  /**
   * Handle form submit
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationError = validateTitle(title);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Add task
    addTask(title);
    
    // Reset form
    setTitle('');
    setError('');
    setIsExpanded(false);
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    setTitle('');
    setError('');
    setIsExpanded(false);
  };

  /**
   * Handle input focus
   */
  const handleFocus = () => {
    setIsExpanded(true);
  };

  return (
    <div className="task-form-container">
      {!isExpanded ? (
        <button 
          className="add-task-trigger"
          onClick={handleFocus}
        >
          + Add a task
        </button>
      ) : (
        <form className="task-form" onSubmit={handleSubmit}>
          <textarea
            className={`task-input ${error ? 'error' : ''}`}
            value={title}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Enter task title..."
            autoFocus
            rows={3}
            maxLength={VALIDATION.TASK_TITLE_MAX_LENGTH}
            aria-label="Task title"
            aria-invalid={!!error}
            aria-describedby={error ? 'task-error' : undefined}
          />
          
          {error && (
            <div id="task-error" className="error-message" role="alert">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-add"
              disabled={!title.trim()}
            >
              Add Task
            </button>
            <button 
              type="button" 
              className="btn-cancel"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>

          <div className="character-count">
            {title.length} / {VALIDATION.TASK_TITLE_MAX_LENGTH}
          </div>
        </form>
      )}
    </div>
  );
};

export default TaskForm;
