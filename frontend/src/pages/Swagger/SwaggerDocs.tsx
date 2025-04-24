import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { useEffect, useState, Component, ReactNode, ErrorInfo } from "react";
import { getAuthHeaders } from "../../services/getAuthHeaders";

// Error boundary to catch potential errors from SwaggerUI
class SwaggerErrorBoundary extends Component<{children: ReactNode}> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("SwaggerUI Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: "2rem", 
          textAlign: "center",
          border: "1px solid #ffcccc", 
          borderRadius: "4px",
          margin: "1rem",
          backgroundColor: "#fff8f8",
          color: "red" 
        }}>
          <h3>Error loading API documentation</h3>
          <p>There was a problem loading the Swagger documentation.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Custom component to suppress React lifecycle warnings from SwaggerUI
const WarningSuppressionWrapper: React.FC<{children: ReactNode}> = ({ children }) => {
  useEffect(() => {
    // Save original console.error
    const originalConsoleError = console.error;
    
    // Replace with filtered version
    console.error = (...args: unknown[]) => {
      // Don't log React lifecycle warnings from SwaggerUI
      if (
        typeof args[0] === 'string' && 
        (args[0].includes('UNSAFE_componentWillMount') || 
         args[0].includes('UNSAFE_componentWillReceiveProps'))
      ) {
        return;
      }
      originalConsoleError(...args);
    };

    // Cleanup
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return <>{children}</>;
};

export default function SwaggerDocs() {
  const [headers, setHeaders] = useState<HeadersInit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeaders = async () => {
      setLoading(true);
      setError(null);
      
      // Add timeout for fetch operation
      const timeoutId = setTimeout(() => {
        setError("Request timed out. Please refresh the page to try again.");
        setLoading(false);
      }, 10000); // 10 second timeout
      
      try {
        const authHeaders = await getAuthHeaders();
        clearTimeout(timeoutId);
        
        // Validate headers
        if (!authHeaders || Object.keys(authHeaders).length === 0) {
          setError("Invalid authentication headers received");
        } else {
          console.log("Fetched Headers:", authHeaders);
          setHeaders(authHeaders);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error("Error fetching auth headers:", error);
        setError(
          error instanceof Error 
            ? `Error: ${error.message}` 
            : "Failed to fetch authentication headers"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHeaders();
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {loading ? (
        <div role="alert" aria-live="polite" style={{ textAlign: "center", padding: "2rem" }}>
          <p>Loading API documentation...</p>
        </div>
      ) : error ? (
        <div role="alert" aria-live="assertive" style={{ 
          textAlign: "center", 
          padding: "2rem", 
          color: "red",
          backgroundColor: "#fff8f8",
          border: "1px solid #ffcccc",
          borderRadius: "4px",
          margin: "1rem"
        }}>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: "0.5rem 1rem",
              marginTop: "1rem",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <SwaggerErrorBoundary>
          <WarningSuppressionWrapper>
            <SwaggerUI
              url="/openapi.yaml"
              requestInterceptor={(req) => {
                if (headers) {
                  req.headers = {
                    ...req.headers,
                    ...headers,
                  };
                }
                return req;
              }}
              docExpansion="list"
              defaultModelsExpandDepth={-1}
            />
          </WarningSuppressionWrapper>
        </SwaggerErrorBoundary>
      )}
    </div>
  );
}
