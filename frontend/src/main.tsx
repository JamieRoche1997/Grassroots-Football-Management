import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import App from "./App";
import { AuthProvider } from "./contexts/AuthProvider"; // Import the AuthProvider

// Error boundary component to catch JavaScript errors
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          marginTop: '50px' 
        }}>
          <h2>Something went wrong.</h2>
          <p>The application encountered an error. Please refresh the page or try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '8px 16px', 
              marginTop: '20px', 
              cursor: 'pointer' 
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const cache = createCache({ key: "mui", prepend: true });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <CacheProvider value={cache}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </CacheProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
