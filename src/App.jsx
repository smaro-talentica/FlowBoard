import { Suspense } from 'react';
import { BoardProvider } from './context/BoardContext';
import Header from './components/Header/Header';
import Board from './components/Board/Board';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import KeyboardShortcuts from './components/KeyboardShortcuts/KeyboardShortcuts';
import './App.css';

/**
 * Main App Component
 * Root component with error boundary and providers
 */
export default function App() {
  return (
    <ErrorBoundary>
      <BoardProvider>
        <div className="app">
          <Header />
          <main className="app-main">
            <Suspense fallback={
              <div className="loading-container">
                <div className="loading-spinner" />
                <p>Loading FlowBoard...</p>
              </div>
            }>
              <Board />
            </Suspense>
          </main>
          <KeyboardShortcuts />
        </div>
      </BoardProvider>
    </ErrorBoundary>
  );
}
