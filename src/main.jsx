import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n/index.js';

// Error boundary — catches any runtime crash and shows it instead of blank page
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(e, info) { console.error('ORVA App Error:', e, info); }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#090909', color: '#f0ece6', fontFamily: 'sans-serif',
        padding: 24, textAlign: 'center', gap: 16,
      }}>
        <img src="/assets/logo-white.webp" alt="ORVA" style={{ height: 28, opacity: 0.4, marginBottom: 8 }} />
        <p style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555' }}>
          Setup Error
        </p>
        <p style={{ fontSize: 15, maxWidth: 480, color: '#999', lineHeight: 1.7 }}>
          {this.state.error?.message || 'Something went wrong.'}
        </p>
        <p style={{ fontSize: 12, color: '#444', maxWidth: 480, lineHeight: 1.8 }}>
          If this is a Firebase error, open the browser console (F12) for details.
          Make sure your <code style={{ background: '#1a1a1a', padding: '2px 6px', borderRadius: 3 }}>.env</code> file
          has all required values, especially <code style={{ background: '#1a1a1a', padding: '2px 6px', borderRadius: 3 }}>VITE_FIREBASE_DATABASE_URL</code>.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: 8, padding: '8px 20px', border: '1px solid #333',
            background: 'transparent', color: '#888', borderRadius: 4,
            cursor: 'pointer', fontSize: 12, letterSpacing: '0.1em' }}
        >
          Reload
        </button>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
