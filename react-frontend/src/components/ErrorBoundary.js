import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error('🚨 RATING SYSTEM ERROR:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{
          padding: '20px',
          border: '2px solid #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#ffebee',
          color: '#721c24',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h2>🚨 Rating System Error</h2>
          <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
          <details>
            <summary>Technical Details</summary>
            <pre style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <hr style={{ margin: '10px 0' }} />
          <h3>🔧 Quick Fixes to Try:</h3>
          <ol>
            <li><strong>Refresh the page</strong> - This may reload the rating system</li>
            <li><strong>Check browser console</strong> - Press F12 for detailed error messages</li>
            <li><strong>Verify backend is running</strong> - Spring Boot should be on port 8081</li>
            <li><strong>Clear browser cache</strong> - Ctrl+Shift+Delete</li>
            <li><strong>Try a different browser</strong> - Sometimes browser-specific issues</li>
          </ol>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🔄 Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
