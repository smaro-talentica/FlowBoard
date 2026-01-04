# FlowBoard - Project Structure

## Overview
FlowBoard follows a modular, component-based architecture with clear separation of concerns. The project is organized to promote maintainability, testability, and scalability.

## Folder Structure

```
FlowBoard/
├── public/                      # Static assets
├── src/                         # Source code
│   ├── components/              # React components
│   │   ├── Board/              # Board container component
│   │   │   ├── Board.jsx       # Main board with drag-drop logic
│   │   │   ├── Board.css       # Board styles
│   │   │   └── Board.test.jsx  # Board unit tests
│   │   ├── Column/             # Column component
│   │   │   ├── Column.jsx      # Column container for tasks
│   │   │   ├── Column.css      # Column styles
│   │   │   └── Column.test.jsx # Column unit tests
│   │   ├── Task/               # Task-related components
│   │   │   ├── TaskCard.jsx    # Individual task card
│   │   │   ├── TaskCard.css    # Task card styles
│   │   │   ├── TaskCard.test.jsx # Task card tests
│   │   │   ├── TaskForm.jsx    # Form to add new task
│   │   │   ├── TaskForm.css    # Form styles
│   │   │   └── TaskForm.test.jsx # Form tests
│   │   ├── Header/             # App header
│   │   │   ├── Header.jsx      # Header component
│   │   │   └── Header.css      # Header styles
│   │   └── Filter/             # Filter component (optional)
│   │       ├── Filter.jsx      # Filter UI
│   │       └── Filter.css      # Filter styles
│   ├── context/                # React Context for state management
│   │   ├── BoardContext.jsx   # Board context provider
│   │   └── BoardContext.test.jsx # Context tests
│   ├── hooks/                  # Custom React hooks
│   │   ├── useLocalStorage.js  # localStorage hook
│   │   ├── useDragAndDrop.js   # Drag-drop logic hook
│   │   ├── useTasks.js         # Task operations hook
│   │   └── *.test.js           # Hook tests
│   ├── utils/                  # Utility functions
│   │   ├── localStorage.js     # localStorage operations
│   │   ├── taskHelpers.js      # Task manipulation functions
│   │   ├── validation.js       # Validation functions
│   │   └── *.test.js           # Utility tests
│   ├── constants/              # Application constants
│   │   └── index.js            # Constants, enums, configs
│   ├── App.jsx                 # Root application component
│   ├── App.css                 # Global application styles
│   ├── App.test.jsx            # App integration tests
│   ├── main.jsx                # Application entry point
│   └── index.css               # Global CSS resets and variables
├── __mocks__/                  # Jest mocks
├── coverage/                   # Test coverage reports
├── ARCHITECTURE.md             # Architecture documentation
├── PROJECT_STRUCTURE.md        # This file
├── CHAT_HISTORY.md            # AI conversation logs
├── README.md                   # Setup and run instructions
├── TEST_STRATEGY.md           # Testing documentation
├── package.json                # Dependencies and scripts
├── vite.config.js             # Vite configuration
├── jest.config.js             # Jest configuration
├── babel.config.js            # Babel configuration
└── eslint.config.js           # ESLint configuration
```

## Module Organization

### Components (`src/components/`)
Each component follows a consistent structure:
- **Component file** (`.jsx`): Contains the component logic and JSX
- **Style file** (`.css`): Component-specific styles
- **Test file** (`.test.jsx`): Unit tests for the component

#### Component Hierarchy:
```
App
└── Board (with BoardContext.Provider)
    ├── Header
    ├── Filter (optional)
    └── Column (×3: To Do, In Progress, Done)
        ├── TaskForm (only in "To Do" column)
        └── TaskCard (multiple per column)
```

### Context (`src/context/`)
- **BoardContext.jsx**: Provides global state for tasks and operations
  - State: tasks array, filter settings
  - Operations: addTask, deleteTask, moveTask
  - Auto-sync with localStorage

### Hooks (`src/hooks/`)
Custom hooks for reusable logic:
- **useLocalStorage**: Generic hook for localStorage operations
- **useDragAndDrop**: Encapsulates drag-and-drop logic
- **useTasks**: Task-specific operations and state management

### Utils (`src/utils/`)
Pure utility functions:
- **localStorage.js**: Low-level localStorage operations with error handling
- **taskHelpers.js**: Task creation, validation, filtering, sorting
- **validation.js**: Form and data validation functions

### Constants (`src/constants/`)
Centralized constants:
- Column statuses and configurations
- localStorage keys
- Validation rules
- UI constants
- Error/success messages
- Drag-drop classes

## File Naming Conventions

### Components
- **PascalCase** for component files: `TaskCard.jsx`, `Board.jsx`
- **PascalCase** for component names
- Co-located CSS files with same name: `TaskCard.css`

### Utilities and Hooks
- **camelCase** for files: `localStorage.js`, `useLocalStorage.js`
- **camelCase** for function names
- Hooks always start with `use`

### Tests
- Same name as the file being tested with `.test.js` or `.test.jsx` suffix
- Example: `Board.jsx` → `Board.test.jsx`

### CSS
- Component styles: `ComponentName.css`
- Global styles: `index.css`, `App.css`
- Use **kebab-case** for CSS class names: `.task-card`, `.column-header`

## Import Structure

### Recommended Import Order:
1. React and third-party libraries
2. Context and hooks
3. Components
4. Utils and constants
5. Styles

Example:
```javascript
import { useState, useEffect } from 'react';
import { useTasks } from '../../hooks/useTasks';
import TaskCard from '../Task/TaskCard';
import { COLUMN_STATUS } from '../../constants';
import './Column.css';
```

## State Management Flow

```
User Action (UI Event)
    ↓
Component Event Handler
    ↓
Context Operation (addTask, moveTask, deleteTask)
    ↓
Update React State
    ↓
Trigger useEffect
    ↓
Save to localStorage
    ↓
Re-render Components (via Context)
```

## Data Flow

### Loading (Initial Mount):
```
App Mount
    ↓
BoardContext Initialize
    ↓
Load from localStorage (loadTasks)
    ↓
Validate Data
    ↓
Set Initial State
    ↓
Render Board with Tasks
```

### Saving (After State Change):
```
State Update (via Context)
    ↓
useEffect Triggered
    ↓
Save to localStorage (saveTasks)
    ↓
Error Handling (if needed)
```

## Testing Structure

### Test Files Location:
- Co-located with components: `ComponentName.test.jsx`
- Organized in same folder as source file

### Test Categories:
1. **Component Tests**: Rendering, user interactions, props
2. **Hook Tests**: State changes, side effects
3. **Utility Tests**: Pure function logic, edge cases
4. **Integration Tests**: Full user flows

## Build and Development

### Development:
```bash
npm run dev          # Start Vite dev server
npm run test:watch   # Run tests in watch mode
```

### Production:
```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

### Testing:
```bash
npm test             # Run all tests once
npm run test:coverage # Generate coverage report
```

## Code Organization Principles

### Single Responsibility
- Each component has one clear purpose
- Utility functions do one thing well

### DRY (Don't Repeat Yourself)
- Shared logic extracted to hooks
- Constants centralized
- Utilities reused across components

### Separation of Concerns
- UI components separate from business logic
- State management isolated in Context
- Storage operations abstracted in utils

### Testability
- Pure functions for utilities
- Props and hooks for injecting dependencies
- Isolated components for unit testing

## Scalability Considerations

The structure supports future enhancements:
- **New columns**: Update `COLUMNS` constant
- **Task properties**: Extend task schema in constants
- **New features**: Add components in respective folders
- **Multiple boards**: Create BoardList component and routing
- **Backend integration**: Replace localStorage utils with API calls

---

**Last Updated**: January 4, 2026  
**Version**: 1.0
