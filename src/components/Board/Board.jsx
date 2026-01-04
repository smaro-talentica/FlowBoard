/**
 * Board Component
 * Main container for the Kanban board with all columns
 */

import { useState, useEffect, useRef } from 'react';
import { useBoard } from '../../context/BoardContext';
import Column from '../Column/Column';
import Filter from '../Filter/Filter';
import { COLUMNS } from '../../constants';
import './Board.css';

const Board = () => {
  const { getTasksByStatus, moveTask, tasks, setTasks, filter } = useBoard();
  
  // Drag and drop state
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dropTargetInfo, setDropTargetInfo] = useState(null); // { columnStatus, insertIndex }
  
  const boardRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  /**
   * Handle drag start
   * @param {Object} task - Task being dragged
   * @param {Object} position - Initial mouse position
   */
  const handleDragStart = (task, position) => {
    setDraggedTask(task);
    setIsDragging(true);
    dragStartPos.current = position;
    setDragPosition(position);
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
  };

  /**
   * Handle drag over column with insert position
   * @param {string} columnStatus - Column status being dragged over
   * @param {number} insertIndex - Index where task would be inserted
   */
  const handleDragOver = (columnStatus, insertIndex = null) => {
    if (isDragging) {
      setDragOverColumn(columnStatus);
      setDropTargetInfo({ columnStatus, insertIndex });
    }
  };

  /**
   * Handle drag end/drop
   */
  const handleDrop = () => {
    if (draggedTask && dropTargetInfo) {
      const { columnStatus, insertIndex } = dropTargetInfo;
      
      // If dropping in the same column, reorder
      if (draggedTask.status === columnStatus && insertIndex !== null) {
        reorderTasksInColumn(draggedTask.id, columnStatus, insertIndex);
      } else {
        // Move to different column
        moveTask(draggedTask.id, columnStatus);
      }
    }
    
    // Reset drag state
    resetDragState();
  };

  /**
   * Reorder tasks within the same column
   * @param {string} taskId - Task being moved
   * @param {string} columnStatus - Column status
   * @param {number} newIndex - New position index
   */
  const reorderTasksInColumn = (taskId, columnStatus, newIndex) => {
    const columnTasks = tasks.filter(t => t.status === columnStatus);
    const taskIndex = columnTasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) return;
    
    // Remove task from old position
    const [movedTask] = columnTasks.splice(taskIndex, 1);
    
    // Insert at new position
    const adjustedIndex = taskIndex < newIndex ? newIndex - 1 : newIndex;
    columnTasks.splice(adjustedIndex, 0, movedTask);
    
    // Update order for all tasks in column
    const updatedColumnTasks = columnTasks.map((task, index) => ({
      ...task,
      order: index
    }));
    
    // Merge with other column tasks
    const otherTasks = tasks.filter(t => t.status !== columnStatus);
    setTasks([...otherTasks, ...updatedColumnTasks]);
  };

  /**
   * Handle drag cancel
   */
  const handleDragCancel = () => {
    resetDragState();
  };

  /**
   * Reset all drag state
   */
  const resetDragState = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
    setIsDragging(false);
    setDragPosition({ x: 0, y: 0 });
    setDropTargetInfo(null);
    document.body.style.userSelect = '';
  };

  /**
   * Handle global mouse move during drag
   */
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging && draggedTask) {
        setDragPosition({ x: e.clientX, y: e.clientY });
        
        // Find which column the mouse is over
        const boardRect = boardRef.current?.getBoundingClientRect();
        if (boardRect) {
          const relativeX = e.clientX - boardRect.left;
          const columnWidth = boardRect.width / COLUMNS.length;
          const columnIndex = Math.floor(relativeX / columnWidth);
          
          if (columnIndex >= 0 && columnIndex < COLUMNS.length) {
            setDragOverColumn(COLUMNS[columnIndex].status);
          }
        }
      }
    };

    const handleTouchMove = (e) => {
      if (isDragging && draggedTask && e.touches.length > 0) {
        const touch = e.touches[0];
        setDragPosition({ x: touch.clientX, y: touch.clientY });
        
        // Find which column the touch is over
        const boardRect = boardRef.current?.getBoundingClientRect();
        if (boardRect) {
          const relativeX = touch.clientX - boardRect.left;
          const columnWidth = boardRect.width / COLUMNS.length;
          const columnIndex = Math.floor(relativeX / columnWidth);
          
          if (columnIndex >= 0 && columnIndex < COLUMNS.length) {
            setDragOverColumn(COLUMNS[columnIndex].status);
          }
        }
      }
    };

    const handleMouseUp = (e) => {
      if (isDragging && draggedTask) {
        // Determine drop target
        if (dropTargetInfo) {
          handleDrop();
        } else {
          handleDragCancel();
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (isDragging && draggedTask) {
        if (dropTargetInfo) {
          handleDrop();
        } else {
          handleDragCancel();
        }
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, draggedTask, dropTargetInfo]);

  return (
    <div className="board" ref={boardRef}>
      {/* Filter component */}
      <Filter />
      
      <div className="board-columns">
        {COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.status);
          const isColumnDragOver = dragOverColumn === column.status;
          
          // Hide column if filtering and not the filtered column
          const isHidden = filter !== 'all' && filter !== column.status;

          return (
            <Column
              key={column.id}
              column={column}
              tasks={columnTasks}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragCancel={handleDragCancel}
              isDragOver={isColumnDragOver}
              isDragging={isDragging}
              draggedTaskId={draggedTask?.id}
              isHidden={isHidden}
              dropTargetInfo={dropTargetInfo}
            />
          );
        })}
      </div>
      
      {/* Ghost element during drag */}
      {isDragging && draggedTask && (
        <div
          className="drag-ghost"
          style={{
            position: 'fixed',
            left: dragPosition.x,
            top: dragPosition.y,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
          <div className="ghost-content">
            {draggedTask.title}
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;
