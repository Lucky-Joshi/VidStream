import React from 'react';
import { CallPage } from './pages/CallPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#0F172A',
          color: '#F8FAFC',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div>
            <h1>Something went wrong</h1>
            <p>{this.state.error?.message}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#2563EB',
                color: '#F8FAFC',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return <CallPage />;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <CallPage />
    </ErrorBoundary>
  );
}
