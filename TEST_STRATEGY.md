# Test Strategy - FlowBoard

## Overview

This document outlines the testing strategy, coverage goals, and rationale for the FlowBoard project. Our testing approach focuses on ensuring reliability, maintainability, and confidence in code changes.

## Testing Philosophy

### Core Principles

1. **Test Behavior, Not Implementation** - Focus on what components do, not how they do it
2. **User-Centric Testing** - Test from the user's perspective whenever possible
3. **Confidence Over Coverage** - Aim for meaningful tests that provide real confidence
4. **Fast Feedback** - Keep tests fast to encourage frequent execution
5. **Maintainable Tests** - Write tests that are easy to understand and update

## Test Types

### 1. Unit Tests

**Purpose**: Test individual functions and utilities in isolation

**Coverage Areas**:
- `src/utils/localStorage.js` - Storage operations, validation, error handling
- `src/utils/taskHelpers.js` - Task manipulation functions
- `src/utils/exportHelpers.js` - Export/import functionality
- `src/constants/` - Constant definitions and values

**Rationale**: These pure functions are the foundation of the application and must be reliable. They have clear inputs/outputs and are easy to test thoroughly.

### 2. Component Tests

**Purpose**: Test React components with user interactions

**Coverage Areas**:
- `src/components/Task/TaskCard.jsx` - Task display and interactions
- `src/components/Column/Column.jsx` - Column rendering and drag-drop
- `src/components/Header/Header.jsx` - Header actions and state
- `src/components/Filter/Filter.jsx` - Filtering logic
- `src/components/Toast/Toast.jsx` - Notification system
- `src/components/ErrorBoundary/ErrorBoundary.jsx` - Error handling

**Rationale**: Components are the user-facing parts of the application. Testing them ensures the UI works as expected and handles user interactions correctly.

### 3. Integration Tests

**Purpose**: Test how multiple components work together

**Coverage Areas**:
- `src/App.jsx` - Full application integration
- `src/context/BoardContext.jsx` - State management and actions

**Rationale**: While unit tests verify individual pieces, integration tests ensure the system works as a whole. This catches issues with component communication and state management.

### 4. Hook Tests

**Purpose**: Test custom React hooks

**Coverage Areas**:
- `src/hooks/useHistory.js` - Undo/redo functionality

**Rationale**: Custom hooks contain reusable logic that multiple components depend on. Testing them in isolation ensures they work correctly before integration.

## Testing Tools & Libraries

### Core Testing Framework
- **Jest** - Test runner and assertion library
- **@testing-library/react** - Component testing with user-centric approach
- **@testing-library/jest-dom** - Extended DOM matchers
- **@testing-library/user-event** - Realistic user interaction simulation

### Why Testing Library?

We use React Testing Library because it:
- Encourages testing from the user's perspective
- Makes tests more resilient to implementation changes
- Provides excellent tools for querying and interacting with components
- Has great documentation and community support

## Coverage Goals

### Current Coverage (as of latest run)

| Category | Coverage | Target |
|----------|----------|--------|
| **Overall** | 57.06% | 70%+ |
| **Statements** | 57.06% | 70%+ |
| **Branches** | 41.47% | 60%+ |
| **Functions** | 53.48% | 70%+ |
| **Lines** | 59.29% | 70%+ |

### Priority Areas for Improvement

1. **Board Component** (26.8% coverage)
   - Core drag-and-drop functionality needs comprehensive testing
   - Complex state management requires integration tests

2. **Task Components** (46.34% coverage)
   - TaskCard edit mode and interactions
   - Form validation and submission

3. **Export Modal** (38.46% coverage)
   - File operations and validation
   - Error handling scenarios

4. **Keyboard Shortcuts** (50% coverage)
   - Shortcut combinations
   - Edge cases and conflicts

## Test Organization

### File Structure
```
src/
  ComponentName/
    ComponentName.jsx
    ComponentName.test.jsx
  utils/
    utilName.js
    utilName.test.js
  hooks/
    useName.js
    useName.test.js
```

### Test File Naming
- Component tests: `ComponentName.test.jsx`
- Utility tests: `utilName.test.js`
- Hook tests: `useName.test.js`

## Testing Best Practices

### 1. Arrange-Act-Assert Pattern

```javascript
test('adds a new task', () => {
  // Arrange - Set up test data and render
  render(<App />);
  
  // Act - Perform user actions
  const input = screen.getByPlaceholderText('Add a new task...');
  fireEvent.change(input, { target: { value: 'New Task' } });
  fireEvent.click(screen.getByRole('button', { name: /add/i }));
  
  // Assert - Verify expected outcome
  expect(screen.getByText('New Task')).toBeInTheDocument();
});
```

### 2. Descriptive Test Names

✅ Good:
```javascript
test('shows error message when title is empty')
test('filters tasks by status when filter is selected')
```

❌ Avoid:
```javascript
test('it works')
test('test 1')
```

### 3. Test User Behavior

✅ Good:
```javascript
// Test what user sees
expect(screen.getByText('Task completed')).toBeInTheDocument();

// Test user interactions
await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
```

❌ Avoid:
```javascript
// Testing implementation details
expect(component.state.isCompleted).toBe(true);
expect(wrapper.find('.task-item').length).toBe(1);
```

### 4. Mock External Dependencies

```javascript
beforeEach(() => {
  // Mock localStorage
  jest.spyOn(Storage.prototype, 'setItem');
  jest.spyOn(Storage.prototype, 'getItem');
  
  // Suppress console errors in tests
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Clean up mocks
  jest.restoreAllMocks();
});
```

### 5. Test Edge Cases

- Empty states
- Maximum limits
- Invalid inputs
- Error conditions
- Boundary values

## Continuous Integration

### Pre-commit Checks
```bash
npm test -- --coverage --watchAll=false
```

### CI Pipeline
- Run all tests on pull requests
- Enforce minimum coverage thresholds
- Generate coverage reports
- Block merges if tests fail

## Testing Gotchas & Solutions

### 1. Async State Updates

**Problem**: State doesn't update immediately in tests

**Solution**: Use `waitFor` or `findBy` queries
```javascript
await waitFor(() => {
  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

### 2. Drag and Drop Testing

**Problem**: DnD libraries are hard to test

**Solution**: Test the drag handlers and state changes separately
```javascript
test('handles drag start', () => {
  const mockDataTransfer = { setData: jest.fn() };
  const event = { dataTransfer: mockDataTransfer };
  
  handleDragStart(event);
  expect(mockDataTransfer.setData).toHaveBeenCalled();
});
```

### 3. Console Error Noise

**Problem**: Tests generate console.error output for expected errors

**Solution**: Mock console methods in test setup
```javascript
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});
```

### 4. LocalStorage Persistence

**Problem**: Tests affect each other through localStorage

**Solution**: Clear localStorage before each test
```javascript
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});
```

## What NOT to Test

1. **Third-party libraries** - Trust that React, Jest, etc. work correctly
2. **Implementation details** - Component internal state, private methods
3. **Styles** - Visual appearance (use visual regression tools instead)
4. **Browser APIs** - Just mock them
5. **Trivial code** - Simple getters/setters, obvious logic

## Future Improvements

### Short Term (Next 3 Months)
- [ ] Increase Board component coverage to 60%+
- [ ] Add comprehensive drag-and-drop tests
- [ ] Test all error boundary scenarios
- [ ] Add accessibility tests

### Medium Term (3-6 Months)
- [ ] Implement E2E tests with Playwright or Cypress
- [ ] Add performance testing for large task lists
- [ ] Set up visual regression testing
- [ ] Add mutation testing to verify test quality

### Long Term (6+ Months)
- [ ] Achieve 80%+ code coverage
- [ ] Implement contract testing for export/import
- [ ] Add load testing for localStorage limits
- [ ] Create test data generators for better fixtures

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npm test -- TaskCard.test.jsx
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="drag and drop"
```

### Update Snapshots
```bash
npm test -- -u
```

## Test Maintenance

### When to Update Tests

1. **Feature changes** - Update tests when functionality changes
2. **Bug fixes** - Add regression tests for fixed bugs
3. **Refactoring** - Verify tests still pass (shouldn't need changes if testing behavior)
4. **API changes** - Update tests when interfaces change

### Red Flags

- Tests that fail randomly (flaky tests)
- Tests that test implementation details
- Tests that are hard to understand
- Tests that take too long to run
- Tests with excessive mocking

## Resources

- [React Testing Library Documentation](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Test Coverage Best Practices](https://kentcdodds.com/blog/how-to-know-what-to-test)

## Contributing

When adding new features:
1. Write tests first (TDD) or alongside code
2. Ensure tests are meaningful and test behavior
3. Run full test suite before committing
4. Update this document if testing strategy changes

---

**Last Updated**: January 5, 2026  
**Maintainer**: Development Team  
**Review Cycle**: Quarterly
