/**
 * Filter Component
 * Allows filtering and searching tasks by column status
 */

import { useState } from 'react';
import { useBoard } from '../../context/BoardContext';
import { FILTER_OPTIONS, COLUMNS } from '../../constants';
import './Filter.css';

const Filter = () => {
  const { filter, setFilter, getTaskCounts, searchQuery, setSearchQuery } = useBoard();
  const counts = getTaskCounts();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const filterOptions = [
    { value: FILTER_OPTIONS.ALL, label: 'All Tasks', count: counts.total },
    { value: FILTER_OPTIONS.TODO, label: 'To Do', count: counts.todo },
    { value: FILTER_OPTIONS.IN_PROGRESS, label: 'In Progress', count: counts.inProgress },
    { value: FILTER_OPTIONS.DONE, label: 'Done', count: counts.done }
  ];

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    setIsSearchExpanded(false);
  };

  const handleSearchToggle = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (isSearchExpanded) {
      setSearchQuery('');
    }
  };

  return (
    <div className="filter-container">
      <div className="filter-row">
        <div className="filter-group">
          <div className="filter-label">Filter:</div>
          <div className="filter-buttons">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                className={`filter-btn ${filter === option.value ? 'active' : ''}`}
                onClick={() => handleFilterChange(option.value)}
                aria-label={`Filter by ${option.label}`}
                aria-pressed={filter === option.value}
              >
                {option.label}
                <span className="filter-count">{option.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="search-group">
          <button
            className={`search-toggle ${isSearchExpanded ? 'active' : ''}`}
            onClick={handleSearchToggle}
            aria-label="Toggle search"
            title="Search tasks"
          >
            🔍
          </button>
          {isSearchExpanded && (
            <div className="search-input-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search by task number, title, or description..."
                value={searchQuery}
                onChange={handleSearchChange}
                autoFocus
                aria-label="Search tasks by number, title, or description"
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={handleSearchClear}
                  aria-label="Clear search"
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filter;
