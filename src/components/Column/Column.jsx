/**
 * Column Component
 * Represents a single column in the Kanban board
 */

import { useRef } from 'react';
import { COLUMN_STATUS } from '../../constants';
import TaskCard from '../Task/TaskCard';
import TaskForm from '../Task/TaskForm';
import './Column.css';

const Column = ({
  column,
  tasks,
  onDragStart,
  onDragOver,
  onDrop,
  onDragCancel,
  isDragOver,
  isDragging,
  draggedTaskId,
  isHidden = false,
  dropTargetInfo = null
}) => {
  const columnRef = useRef(null);

  /**
   * Handle mouse enter for drag over effect
   */
  const handleMouseEnter = () => {
    if (isDragging) {
      onDragOver(column.status, null);
    }
  };

  /**
   * Handle mouse move over column to determine insert position
   */
  const handleMouseMove = (e) => {
    if (!isDragging || !columnRef.current) return;

    const columnRect = columnRef.current.getBoundingClientRect();
    const mouseY = e.clientY - columnRect.top;

    // Find the task that should be after the drop position
    const taskElements = columnRef.current.querySelectorAll('.task-card:not(.dragging)');
    let insertIndex = tasks.length;

    for (let i = 0; i < taskElements.length; i++) {
      const taskRect = taskElements[i].getBoundingClientRect();
      const taskMiddle = taskRect.top + taskRect.height / 2 - columnRect.top;

      if (mouseY < taskMiddle) {
        insertIndex = i;
        break;
      }
    }

    onDragOver(column.status, insertIndex);
  };

  /**
   * Handle mouse up for drop
   */
  const handleMouseUp = () => {
    if (isDragging) {
      onDrop(column.status);
    }
  };

  /**
   * Get column class names based on state
   */
  const getColumnClassName = () => {
    let className = 'column';
    if (isDragOver) className += ' drag-over';
    if (isDragging) className += ' dragging-active';
    if (isHidden) className += ' hidden';
    return className;
  };

  // Don't render if hidden
  if (isHidden) return null;

  return (
    <div 
      ref={columnRef}
      className={getColumnClassName()}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="column-header">
        <h2 className="column-title">{column.title}</h2>
        <span className="column-count">{tasks.length}</span>
      </div>

      {/* Show TaskForm only in To Do column */}
      {column.status === COLUMN_STATUS.TODO && (
        <TaskForm />
      )}

      <div className="column-content">
        {tasks.length === 0 ? (
          <div className="empty-state">
            {column.status === COLUMN_STATUS.TODO 
              ? 'Add a task to get started'
              : 'No tasks yet'}
          </div>
        ) : (
          <div className="task-list">
            {tasks.map((task, index) => {
              const showDropIndicator = 
                isDragging &&
                dropTargetInfo &&
                dropTargetInfo.columnStatus === column.status &&
                dropTargetInfo.insertIndex === index &&
                task.id !== draggedTaskId;

              return (
                <div key={task.id}>
                  {showDropIndicator && (
                    <div className="drop-indicator" />
                  )}
                  <TaskCard
                    task={task}
                    onDragStart={onDragStart}
                    onDragCancel={onDragCancel}
                    isDragging={task.id === draggedTaskId}
                  />
                </div>
              );
            })}
            {/* Drop indicator at the end */}
            {isDragging &&
              dropTargetInfo &&
              dropTargetInfo.columnStatus === column.status &&
              dropTargetInfo.insertIndex === tasks.length && (
                <div className="drop-indicator" />
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;
