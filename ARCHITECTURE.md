# FlowBoard - Architecture Documentation

## 1. Architectural Pattern

FlowBoard follows a **Component-Based Architecture** with **Context API for State Management**.

### Why This Approach?
- **Simplicity**: The application has moderate complexity (3 columns, task operations)
- **Avoid Prop Drilling**: Context API prevents passing props through multiple levels
- **React Native**: Uses core React features without external state libraries
- **Scalability**: Easy to extend with more features while maintaining clean code
- **Performance**: Efficient re-renders with proper context splitting if needed

### Alternatives Considered:
1. **Lifting State Up** 
   - ❌ Would require prop drilling through Board → Column → TaskCard
   - ✅ Simpler for very small apps
   - **Decision**: Rejected due to maintenance concerns as app grows

2. **Redux**
   - ✅ Excellent for complex state management
   - ❌ Overkill for this scope (adds boilerplate, extra dependencies)
   - **Decision**: Rejected as unnecessary for current requirements

## 2. Component Hierarchy

```
App
├── Header
└── Board (Context Provider)
    ├── Filter (optional)
    └── Board Container
        ├── Column (To Do)
        │   ├── TaskForm
        │   └── TaskCard (multiple)
        ├── Column (In Progress)
        │   └── TaskCard (multiple)
        └── Column (Done)
            └── TaskCard (multiple)
```

### Component Responsibilities:

**App.jsx**
- Root component
- Routing setup (if needed in future)
- Global styles

**Header.jsx**
- App branding/title
- Global actions (optional: clear all, settings)

**Board.jsx**
- State management via Context
- Orchestrates columns
- Handles drag-and-drop coordination
- localStorage sync

**Column.jsx**
- Displays column title
- Renders task list
- Drop zone for drag-and-drop
- Empty state handling

**TaskCard.jsx**
- Displays individual task
- Drag source
- Delete action
- Move buttons (accessibility fallback)

**TaskForm.jsx**
- Input for new task title
- Add task functionality
- Form validation

**Filter.jsx** (Optional)
- Filter tasks by status
- Search functionality

## 3. State Management Strategy

### State Structure:
```javascript
{
  tasks: [
    {
      id: 'unique-id-string',
      title: 'Task title',
      status: 'todo' | 'inProgress' | 'done',
      createdAt: timestamp,
      order: number
    }
  ],
  filter: 'all' | 'todo' | 'inProgress' | 'done'
}
```

### Context API Implementation:
- **BoardContext**: Provides task state and operations
- **Provider**: Wraps Board component
- **Operations**: addTask, deleteTask, moveTask, updateTask
- **Auto-sync**: Every state change triggers localStorage update

### Why This State Shape?
- **Flat Array**: Easy to filter, map, and manipulate
- **Status Field**: Determines which column task belongs to
- **Order Field**: Enables sorting within columns and future reordering
- **Immutable Updates**: Using spread operators for React best practices

## 4. Drag-and-Drop Implementation

### Native Browser Events Approach
We implement drag-and-drop using **native mouse events** without libraries.

#### Events Used:
1. **onMouseDown** - Capture task, set dragging state
2. **onMouseMove** - Track cursor position, show visual feedback
3. **onMouseUp** - Drop task, update column/status

#### Implementation Details:
```javascript
// Drag Start (TaskCard)
- Store dragged task ID in state
- Add 'dragging' class for visual feedback
- Create ghost/placeholder element (optional)

// Drag Over (Column)  
- Detect valid drop zones
- Highlight target column
- Show drop indicator

// Drag End (Board)
- Determine target column from cursor position
- Update task status
- Remove dragging classes
- Sync to localStorage
```

### Why Not Use a Library?
- **Requirement**: Assignment explicitly prohibits react-dnd, interact.js
- **Learning**: Demonstrates understanding of browser APIs
- **Control**: Full customization of drag behavior
- **Bundle Size**: No extra dependencies

### Accessibility Fallback:
- **Move Buttons**: "Move to In Progress", "Move to Done" buttons
- **Keyboard Support**: Arrow keys + Enter to move tasks
- **Screen Readers**: ARIA labels for drag actions

### Edge Cases Handled:
- Drop outside valid zones (cancel drag)
- Drag to same column (no-op or reorder)
- Prevent text selection during drag
- Touch events for mobile (bonus feature)

## 5. Persistence Strategy

### localStorage Implementation:
- **Key**: `flowboard_tasks`
- **Format**: JSON stringified array of tasks
- **Operations**:
  - Load on mount
  - Save after every state change
  - Error handling for storage quota exceeded
  - Validation of loaded data

### Data Flow:
```
User Action → State Update → useEffect → localStorage.setItem → Persist
Page Load → localStorage.getItem → State Initialization → Render
```

## 6. Performance Considerations

### Optimization Techniques:
1. **Memoization**: Use React.memo for TaskCard to prevent unnecessary re-renders
2. **useCallback**: Wrap event handlers to maintain referential equality
3. **useMemo**: Calculate filtered/sorted tasks only when dependencies change
4. **Debouncing**: Debounce localStorage writes if too frequent (optional)

### Re-render Strategy:
- Context split if performance issues arise (TaskContext + FilterContext)
- Only affected columns re-render on task move

## 7. Testing Strategy

### Unit Tests:
- Task CRUD operations
- localStorage utilities
- Filter logic
- Validation functions

### Component Tests:
- TaskCard rendering and interactions
- Column rendering with multiple tasks
- TaskForm validation and submission
- Board state changes

### Integration Tests:
- Complete user flows (add → move → delete)
- localStorage persistence across sessions
- Drag-and-drop operations

## 8. Future Enhancements (Out of Scope)

Potential features if time permits:
- Task editing (update title)
- Task descriptions and due dates
- Reordering within same column
- Multiple boards
- Task categories/tags
- Undo/Redo functionality
- Export to JSON/CSV

## 9. Technology Stack

- **React 19.1.0**: UI library
- **React Router 7.6.3**: Routing (if needed for future pages)
- **Vite**: Build tool and dev server
- **Jest + React Testing Library**: Testing
- **CSS Modules or Plain CSS**: Styling (no CSS-in-JS libraries)

## 10. Design Decisions Log

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| Context API | Avoids prop drilling, sufficient for app size | Slightly more setup than lifting state |
| Native drag-drop | Assignment requirement, full control | More code than using library |
| Flat task array | Simple to manipulate, easy to filter | Need to calculate column tasks on each render |
| localStorage | Requirement, no backend needed | Limited storage, no sync across devices |
| Order field in task | Enables future reordering feature | Slightly more complex state management |
| Move buttons | Accessibility fallback | Extra UI elements |

---

**Last Updated**: January 4, 2026  
**Version**: 1.0  
**Author**: AI-Assisted Development
