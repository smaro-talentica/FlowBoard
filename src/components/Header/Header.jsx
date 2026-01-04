/**
 * Header Component
 * Application header with branding and actions
 */

import { useState } from 'react';
import { useBoard } from '../../context/BoardContext';
import ExportModal from '../ExportModal/ExportModal';
import './Header.css';

const Header = () => {
  const { getTaskCounts, clearAllTasks } = useBoard();
  const counts = getTaskCounts();
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">FlowBoard</h1>
            <p className="app-subtitle">Kanban Task Management</p>
          </div>

          <div className="header-right">
            <div className="task-stats">
              <div className="stat-item">
                <span className="stat-label">Total</span>
                <span className="stat-value">{counts.total}</span>
              </div>
              <div className="stat-divider">|</div>
              <div className="stat-item">
                <span className="stat-label">To Do</span>
                <span className="stat-value stat-todo">{counts.todo}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">In Progress</span>
                <span className="stat-value stat-progress">{counts.inProgress}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Done</span>
                <span className="stat-value stat-done">{counts.done}</span>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="export-btn"
                onClick={() => setShowExportModal(true)}
                title="Export/Import tasks"
                aria-label="Export/Import tasks"
              >
                💾 Export/Import
              </button>

              {counts.total > 0 && (
                <button
                  className="clear-btn"
                  onClick={clearAllTasks}
                  title="Clear all tasks"
                  aria-label="Clear all tasks"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <ExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
      />
    </>
  );
};

export default Header;
