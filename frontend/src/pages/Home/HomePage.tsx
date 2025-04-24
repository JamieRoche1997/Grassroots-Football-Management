import React, { Suspense, lazy, Component, ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import AppTheme from "../../components/shared-theme/AppTheme";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

// Import main components directly
import AppAppBar from "./components/AppAppBar";
import Footer from "./components/Footer";

// Lazy load other components
const Features = lazy(() => import("./components/Features"));
const Testimonials = lazy(() => import("./components/Testimonials"));
const FAQ = lazy(() => import("./components/FAQ"));
const Contact = lazy(() => import("./components/Contact"));

// Fallback for lazy loaded components
const LoadingFallback = () => (
  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
    <CircularProgress />
  </Box>
);

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        textAlign: "center",
      }}
    >
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        style={{
          padding: "8px 16px",
          backgroundColor: "#1976d2",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "16px",
        }}
      >
        Try again
      </button>
    </Box>
  );
};

// Custom ErrorBoundary component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error || new Error("Unknown error")} 
          resetErrorBoundary={this.resetErrorBoundary} 
        />
      );
    }

    return this.props.children;
  }
}

export default function HomePage(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ErrorBoundary>
        <AppAppBar />
        <Container
          maxWidth="lg"
          component="main"
          sx={{ display: "flex", flexDirection: "column", my: 8 }}
        >
          <Suspense fallback={<LoadingFallback />}>
            <section id="features">
              <Features />
            </section>
            <section id="reviews">
              <Testimonials />
            </section>
            <section id="faq">
              <FAQ />
            </section>
            <section id="contact">
              <Contact />
            </section>
          </Suspense>
        </Container>
        <Footer />
      </ErrorBoundary>
    </AppTheme>
  );
}
