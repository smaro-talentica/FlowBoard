/**
 * TaskCard Component
 * Displays an individual task with drag functionality and actions
 */

import { useRef, useState } from 'react';
import { useBoard } from '../../context/BoardContext';
import { COLUMN_STATUS } from '../../constants';
import './TaskCard.css';

const TaskCard = ({ task, onDragStart, onDragCancel, isDragging }) => {
  const { deleteTask, moveTask } = useBoard();
  const cardRef = useRef(null);
  const dragThreshold = 5; // pixels to move before considering it a drag
  const mouseDownPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);

  /**
   * Handle mouse down - start potential drag
   */
  const handleMouseDown = (e) => {
    // Ignore if clicking on buttons
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
      return;
    }

    // Store initial position
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
    hasMoved.current = false;

    // Add mousemove listener to detect drag threshold
    const handleMouseMove = (moveEvent) => {
      const deltaX = Math.abs(moveEvent.clientX - mouseDownPos.current.x);
      const deltaY = Math.abs(moveEvent.clientY - mouseDownPos.current.y);

      if (deltaX > dragThreshold || deltaY > dragThreshold) {
        hasMoved.current = true;
        // Start drag
        onDragStart(task, { x: moveEvent.clientX, y: moveEvent.clientY });
        
        // Remove this listener
        document.removeEventListener('mousemove', handleMouseMove);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  /**
   * Handle touch start - mobile drag
   */
  const handleTouchStart = (e) => {
    // Ignore if touching buttons
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
      return;
    }

    const touch = e.touches[0];
    mouseDownPos.current = { x: touch.clientX, y: touch.clientY };
    hasMoved.current = false;

    const handleTouchMove = (moveEvent) => {
      const touch = moveEvent.touches[0];
      const deltaX = Math.abs(touch.clientX - mouseDownPos.current.x);
      const deltaY = Math.abs(touch.clientY - mouseDownPos.current.y);

      if (deltaX > dragThreshold || deltaY > dragThreshold) {
        hasMoved.current = true;
        moveEvent.preventDefault(); // Prevent scrolling
        onDragStart(task, { x: touch.clientX, y: touch.clientY });
        
        document.removeEventListener('touchmove', handleTouchMove);
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  /**
   * Handle delete button click
   */
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete task "${task.title}"?`)) {
      deleteTask(task.id);
    }
  };

  /**
   * Handle move left button
   */
  const handleMoveLeft = (e) => {
    e.stopPropagation();
    
    if (task.status === COLUMN_STATUS.IN_PROGRESS) {
      moveTask(task.id, COLUMN_STATUS.TODO);
    } else if (task.status === COLUMN_STATUS.DONE) {
      moveTask(task.id, COLUMN_STATUS.IN_PROGRESS);
    }
  };

  /**
   * Handle move right button
   */
  const handleMoveRight = (e) => {
    e.stopPropagation();
    
    if (task.status === COLUMN_STATUS.TODO) {
      moveTask(task.id, COLUMN_STATUS.IN_PROGRESS);
    } else if (task.status === COLUMN_STATUS.IN_PROGRESS) {
      moveTask(task.id, COLUMN_STATUS.DONE);
    }
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e) => {
    // Ignore if inside buttons
    if (e.target.tagName === 'BUTTON') return;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        if (canMoveRight) handleMoveRight(e);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (canMoveLeft) handleMoveLeft(e);
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        handleDelete(e);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsKeyboardMode(!isKeyboardMode);
        break;
      default:
        break;
    }
  };

  /**
   * Get button visibility based on column
   */
  const canMoveLeft = task.status !== COLUMN_STATUS.TODO;
  const canMoveRight = task.status !== COLUMN_STATUS.DONE;

  /**
   * Get card class names based on state
   */
  const getCardClassName = () => {
    let className = 'task-card';
    if (isDragging) className += ' dragging';
    if (isKeyboardMode) className += ' keyboard-mode';
    return className;
  };

  return (
    <div
      ref={cardRef}
      className={getCardClassName()}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Task: ${task.title}. Press arrow keys to move, Delete to remove, Enter to toggle keyboard mode`}
    >
      <div className="task-content">
        <div className="task-header">
          <span className="task-number">{task.taskNumber}</span>
        </div>
        <p className="task-title">{task.title}</p>
      </div>

      <div className="task-actions">
        {/* Move buttons for accessibility */}
        <div className="task-move-buttons">
          {canMoveLeft && (
            <button
              className="move-btn move-left"
              onClick={handleMoveLeft}
              title="Move left"
              aria-label="Move task to previous column"
            >
              ←
            </button>
          )}
          {canMoveRight && (
            <button
              className="move-btn move-right"
              onClick={handleMoveRight}
              title="Move right"
              aria-label="Move task to next column"
            >
              →
            </button>
          )}
        </div>

        <button
          className="delete-btn"
          onClick={handleDelete}
          title="Delete task"
          aria-label="Delete task"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
