import React, { Suspense } from "react";

// Add type declaration for global functions
declare global {
  interface Window {
    reportLayoutError?: (message: string) => void;
  }
}

import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { alpha } from "@mui/material/styles";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import AppNavbar from "./AppNavbar";
import SideMenu from "./SideMenu";
import AppTheme from "./shared-theme/AppTheme";
import LoadingSpinner from "./LoadingSpinner";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../components/shared-theme/customizations";
import Chatbot from "./Chatbot";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

interface LayoutProps {
  children: React.ReactNode;
}

// Error boundary to catch rendering errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Layout error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            p: 3,
          }}
        >
          <Alert severity="error" sx={{ mb: 2, width: "100%", maxWidth: 500 }}>
            Something went wrong in the application.
          </Alert>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: "8px 16px",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </Box>
      );
    }

    return this.props.children;
  }
}

function LayoutContent({ children }: LayoutProps) {
  const [error, setError] = React.useState<string | null>(null);

  // Handle global errors
  const handleError = (message: string) => {
    setError(message);
  };

  // Close error notification
  const handleCloseError = () => {
    setError(null);
  };

  // Make error handler available globally
  React.useEffect(() => {
    // Add error handler to window for global access
    window.reportLayoutError = handleError;
    
    return () => {
      // Clean up when component unmounts
      delete window.reportLayoutError;
    };
  }, []);

  return (
    <AppTheme themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex", height: "100vh" }}>
        {/* Side Menu */}
        <SideMenu />

        {/* Main Content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: alpha(theme.palette.background.default, 1),
            overflow: "auto",
          })}
        >
          <AppNavbar />
          <Box
            sx={{
              px: 3,
              py: 2,
              minHeight: "calc(100vh - 64px)", // Ensure minimum height for content area
            }}
          >
            <Suspense fallback={<LoadingSpinner text="Loading content..." />}>
              {children}
            </Suspense>
          </Box>
        </Box>
        <Chatbot />
      </Box>

      {/* Global error notification */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseError} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </AppTheme>
  );
}

export default function Layout({ children }: LayoutProps) {
  return (
    <ErrorBoundary>
      <LayoutContent children={children} />
    </ErrorBoundary>
  );
}
