# FlowBoard - Kanban Task Management

A lightweight Kanban board application built with React, featuring native drag-and-drop functionality and localStorage persistence.

## Features

✅ **Three-Column Kanban Board**
- To Do
- In Progress  
- Done

✅ **Task Management**
- Add new tasks to "To Do" column
- Auto-incrementing task numbers (TASK-001, TASK-002, etc.)
- Move tasks between columns via drag-and-drop or buttons
- Delete tasks with confirmation
- Task validation (1-200 characters)

✅ **Native Drag-and-Drop**
- Implemented using browser mouse events (no external libraries)
- Visual ghost element during drag
- Smooth animations and transitions
- 5px drag threshold to prevent accidental drags
- Reorder tasks within same column
- Drop position indicators
- Touch screen support
- Keyboard navigation (Arrow keys + Delete)

✅ **Search & Filtering**
- Real-time search across task numbers, titles, and descriptions
- Search by task number (e.g., "TASK-001") for quick lookup
- Filter by All Tasks, To Do, In Progress, or Done
- Live task counts per filter
- Search results shown within each column

✅ **Export & Import**
- Export to JSON format (full backup)
- Export to CSV format (for spreadsheets)
- Import JSON files with validation
- Merge imported tasks with existing data
- Duplicate detection (by task ID)
- Error reporting for invalid data

✅ **Data Persistence**
- Automatic save to localStorage
- Data persists across browser sessions
- Error handling for storage quota
- Import/export for backup and migration

✅ **Responsive Design**
- Mobile-friendly layout
- Touch-friendly interactions
- Adapts to different screen sizes

✅ **Accessibility**
- Full keyboard navigation support
- Keyboard shortcuts help (press `?`)
- ARIA labels and roles
- Focus management
- Screen reader friendly
- Move buttons for non-drag interactions

✅ **User Experience**
- Error boundary for graceful error handling
- Loading states with spinner
- Smooth animations (60fps)
- Professional micro-interactions
- Toast notifications (ready for future use)
- Keyboard shortcuts modal

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd FlowBoard
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode
Start the development server with hot reload:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Production Build
Build the application for production:
```bash
npm run build
```

### Preview Production Build
Preview the production build locally:
```bash
npm run preview
```

## Running Tests

### Run all tests once:
```bash
npm test
```

### Run tests in watch mode:
```bash
npm run test:watch
```

### Generate coverage report:
```bash
npm run test:coverage
```

Coverage reports will be generated in the `coverage/` directory.

## Project Structure

```
FlowBoard/
├── src/
│   ├── components/         # React components
│   │   ├── Board/         # Main board container
│   │   ├── Column/        # Column component
│   │   ├── Task/          # Task card and form
│   │   ├── Header/        # App header
│   │   └── Filter/        # Filter component
│   ├── context/           # React Context (state management)
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── constants/         # App constants
│   ├── App.jsx            # Root component
│   └── main.jsx           # Entry point
├── public/                # Static assets
├── ARCHITECTURE.md        # Architecture documentation
├── PROJECT_STRUCTURE.md   # Project structure details
├── CHAT_HISTORY.md       # AI development journey
└── README.md             # This file
```

## How to Use

### Adding a Task
1. Click "+ Add a task" button in the "To Do" column
2. Enter task title (1-200 characters)
3. Click "Add Task" or press Enter

### Moving Tasks

**Drag and Drop:**
1. Click and hold on a task card
2. Drag to the desired column
3. Release to drop

**Using Buttons:**
- Click the ← button to move task left
- Click the → button to move task right

### Deleting Tasks
1. Click the × button on any task card
2. Confirm deletion in the popup

### Filtering Tasks
1. Click on filter buttons at the top
2. Choose: All Tasks, To Do, In Progress, or Done
3. Board shows only selected tasks

### Searching Tasks
1. Click the 🔍 search icon in the top right
2. Type to search across all task titles and descriptions
3. Results appear instantly within each column
4. Click the × button to clear search

### Exporting and Importing Data

**Exporting Tasks:**
1. Click "💾 Export/Import" button in the header
2. Choose export format:
   - **JSON** (recommended) - Full backup, can be imported back
   - **CSV** - For spreadsheet software (Excel, Google Sheets)
3. Click "Export" button
4. File downloads automatically with timestamp

**Importing Tasks:**
1. Click "💾 Export/Import" button in the header
2. Click "Choose File to Import"
3. Select a previously exported JSON file
4. New tasks are merged with existing tasks
5. Duplicate tasks (same ID) are automatically skipped
6. Invalid tasks are reported but don't block import

**Use Cases:**
- Backup your board data regularly
- Transfer tasks between devices/browsers
- Share task lists with team members
- Analyze tasks in spreadsheet software (CSV export)
- Migrate data to other systems

### Clearing All Tasks
Click "Clear All" button in the header (only visible when tasks exist)

## Technology Stack

- **React 19.1.0** - UI library
- **React Router 7.6.3** - Routing (for future expansion)
- **Vite** - Build tool and dev server
- **Jest + React Testing Library** - Testing framework
- **localStorage** - Data persistence (no backend required)

## Key Features

### State Management
- Context API for global state
- Automatic localStorage synchronization
- Efficient re-renders

### Drag-and-Drop Implementation
- Native browser events (mousedown, mousemove, mouseup)
- No external libraries (react-dnd prohibited per requirements)
- Visual feedback with ghost element
- Drag threshold to prevent accidental drags

### Data Validation
- Title length validation (1-200 chars)
- localStorage quota handling
- Data corruption recovery

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations

- Memoized components to prevent unnecessary re-renders
- Efficient localStorage writes
- Optimized drag-and-drop performance
- Debounced operations where appropriate

## Future Enhancements

Potential features for future iterations:
- Task editing (update title, add description)
- Due dates and priorities
- Task reordering within same column
- Multiple boards
- Task categories/tags
- Dark mode
- Undo/Redo functionality
- Export/Import data (JSON/CSV)
- Backend integration with API

## Troubleshooting

### localStorage Issues
If tasks aren't persisting:
1. Check browser localStorage is enabled
2. Clear browser data and try again
3. Check browser console for errors

### Drag-and-Drop Not Working
1. Ensure you're not clicking on buttons
2. Try using the arrow buttons instead
3. Check browser console for JavaScript errors

## License

MIT License - Feel free to use this project for learning and development.

## Contributing

This is an assignment project, but suggestions and improvements are welcome!

## Author

Built with AI assistance as part of a frontend development assessment.

---

**Last Updated**: January 5, 2026  
**Version**: 1.0.0
