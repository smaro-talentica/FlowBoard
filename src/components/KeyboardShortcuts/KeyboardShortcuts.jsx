/**
 * KeyboardShortcuts Component
 * Shows keyboard shortcut hints for accessibility
 */

import { useState } from 'react';
import './KeyboardShortcuts.css';

const KeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: 'Tab', description: 'Navigate between tasks' },
    { key: 'Enter', description: 'Toggle keyboard mode on task' },
    { key: '← →', description: 'Move task between columns (in keyboard mode)' },
    { key: 'Delete', description: 'Delete focused task' },
    { key: 'Esc', description: 'Exit keyboard mode / Close dialogs' },
    { key: '?', description: 'Show/hide this help' }
  ];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyPress = (e) => {
    if (e.key === '?' && !e.target.matches('input, textarea')) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  // Listen for ? key globally
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyPress);
  }

  return (
    <>
      <button
        className="keyboard-shortcuts-trigger"
        onClick={handleToggle}
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (?)"
      >
        <span className="keyboard-icon">⌨️</span>
      </button>

      {isOpen && (
        <div className="keyboard-shortcuts-overlay" onClick={() => setIsOpen(false)}>
          <div className="keyboard-shortcuts-modal" onClick={(e) => e.stopPropagation()}>
            <div className="shortcuts-header">
              <h2>Keyboard Shortcuts</h2>
              <button
                className="shortcuts-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close shortcuts"
              >
                ×
              </button>
            </div>

            <div className="shortcuts-content">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="shortcut-item">
                  <kbd className="shortcut-key">{shortcut.key}</kbd>
                  <span className="shortcut-description">{shortcut.description}</span>
                </div>
              ))}
            </div>

            <div className="shortcuts-footer">
              <p>Press <kbd>?</kbd> anytime to toggle this help</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;
