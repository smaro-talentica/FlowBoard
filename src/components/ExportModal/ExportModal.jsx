/**
 * ExportModal Component
 * Handles exporting and importing board data
 */

import { useState, useRef } from 'react';
import { useBoard } from '../../context/BoardContext';
import { exportToJSON, exportToCSV, importFromJSON, getExportStats } from '../../utils/exportHelpers';
import './ExportModal.css';

const ExportModal = ({ isOpen, onClose }) => {
  const { tasks, setTasks } = useBoard();
  const [importStatus, setImportStatus] = useState(null);
  const [exportFormat, setExportFormat] = useState('json');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const stats = getExportStats(tasks);

  const handleExport = () => {
    const result = exportFormat === 'json' 
      ? exportToJSON(tasks)
      : exportToCSV(tasks);

    if (result.success) {
      setImportStatus({
        type: 'success',
        message: `Successfully exported ${result.count} tasks as ${exportFormat.toUpperCase()}`
      });
      setTimeout(() => {
        setImportStatus(null);
        onClose();
      }, 2000);
    } else {
      setImportStatus({
        type: 'error',
        message: `Export failed: ${result.error}`
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus({ type: 'loading', message: 'Importing...' });

    try {
      const result = await importFromJSON(file);
      
      if (result.success) {
        // Prepare imported tasks (avoiding duplicates by ID)
        const existingIds = new Set(tasks.map(t => t.id));
        const newTasks = result.tasks.filter(t => !existingIds.has(t.id));
        
        let message = `Successfully imported ${newTasks.length} tasks`;
        if (result.skipped > 0) {
          message += ` (${result.skipped} invalid tasks skipped)`;
        }
        
        setImportStatus({
          type: 'success',
          message,
          details: result.errors
        });

        // Close modal first, then add tasks to board
        setTimeout(() => {
          setImportStatus(null);
          setIsImporting(false);
          onClose();
          
          // Add tasks after modal closes
          setTimeout(() => {
            setTasks([...tasks, ...newTasks]);
          }, 100);
        }, 800);
      }
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: error.message
      });
      setIsImporting(false);
    }

    // Reset file input
    e.target.value = '';
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="export-modal-overlay" onClick={handleOverlayClick}>
      <div className="export-modal">
        <div className="export-modal-header">
          <h2>Export / Import Data</h2>
          <button
            className="export-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="export-modal-body">
          {/* Statistics */}
          <div className="export-stats">
            <h3>Current Board Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Tasks:</span>
                <span className="stat-value">{stats.total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">To Do:</span>
                <span className="stat-value">{stats.byStatus.todo}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">In Progress:</span>
                <span className="stat-value">{stats.byStatus.inProgress}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Done:</span>
                <span className="stat-value">{stats.byStatus.done}</span>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="export-section">
            <h3>Export Tasks</h3>
            <p className="section-description">
              Download all your tasks to a file for backup or sharing.
            </p>
            
            <div className="export-format">
              <label className="format-option">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <span>JSON (Recommended - Can be imported back)</span>
              </label>
              <label className="format-option">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <span>CSV (For spreadsheet software)</span>
              </label>
            </div>

            <button
              className="export-btn primary"
              onClick={handleExport}
              disabled={tasks.length === 0 || isImporting}
            >
              📥 Export {tasks.length} Tasks
            </button>
          </div>

          {/* Import Section */}
          <div className="import-section">
            <h3>Import Tasks</h3>
            <p className="section-description">
              Upload a previously exported JSON file to restore tasks.
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            <button
              className="import-btn secondary"
              onClick={handleImportClick}
            >
              📤 Choose File to Import
            </button>

            <p className="import-note">
              Note: Imported tasks will be merged with existing tasks. Duplicates (same ID) will be skipped.
            </p>
          </div>

          {/* Status Messages */}
          {importStatus && (
            <div className={`export-status ${importStatus.type}`}>
              <p>{importStatus.message}</p>
              {importStatus.details && (
                <details className="status-details">
                  <summary>View errors ({importStatus.details.length})</summary>
                  <ul>
                    {importStatus.details.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
