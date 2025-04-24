import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Divider,
  Alert,
  Snackbar,
} from "@mui/material";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import { useCart } from "../../hooks/useCart";
import { useTransactions } from "../../hooks/useTransactions";
import { useAuth } from "../../hooks/useAuth";

export default function Success() {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Use the transactions hook
  const { transactions, loading, error } = useTransactions(
    user?.email ?? undefined
  );

  // Get the latest transaction
  const latestTransaction = transactions.length > 0 ? transactions[0] : null;

  // Create a manual refetch function
  const handleRetry = useCallback(() => {
    // Force a component re-render to trigger the useEffect in useTransactions
    setSnackbarOpen(prev => {
      setTimeout(() => setSnackbarOpen(prev));
      return prev;
    });
  }, []);

  useEffect(() => {
    clearCart();
    // Show warning if user is not authenticated
    if (!user) {
      setSnackbarOpen(true);
    }
  }, [clearCart, user]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const isValidTransaction = latestTransaction && 
    Array.isArray(latestTransaction.purchasedItems) && 
    typeof latestTransaction.amount === 'number';

  return (
    <Layout>
      <Header />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 5,
          textAlign: "center",
          px: 2, // Add padding for mobile
        }}
      >
        <Typography variant="h4" sx={{ mb: 3 }} aria-live="polite">
          🎉 Payment Successful!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, maxWidth: "500px" }}>
          Your payment was processed successfully. Below is a summary of your
          purchase.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
            <CircularProgress sx={{ mb: 2 }} aria-label="Loading transaction data" />
            <Typography variant="body2" color="text.secondary">
              Retrieving your purchase information...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ width: '100%', maxWidth: 500 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || "Failed to load transaction data"}
            </Alert>
            <Button 
              variant="outlined" 
              onClick={handleRetry}
              sx={{ mb: 2 }}
            >
              Retry Loading
            </Button>
          </Box>
        ) : isValidTransaction ? (
          <Paper sx={{ p: 3, width: "100%", maxWidth: 500, textAlign: "left" }} elevation={3}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              🛍️ Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {latestTransaction.purchasedItems.map((item, index) => (
              <Box
                key={index}
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography>
                  {item.productName || "Product"} ({item.quantity || 1})
                </Typography>
                <Typography>€{(item.totalPrice || 0).toFixed(2)}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">
              Total: €{latestTransaction.amount.toFixed(2)}
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ width: '100%', maxWidth: 500 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              No recent transaction found. If you've just made a purchase, please wait a moment and try refreshing.
            </Alert>
            <Button 
              variant="outlined" 
              onClick={handleRetry}
              sx={{ mb: 2 }}
            >
              Refresh
            </Button>
          </Box>
        )}

        <Button
          variant="contained"
          sx={{ mt: 3 }}
          onClick={() => navigate("/payments/shop")}
          aria-label="Return to shop"
        >
          Return to Shop
        </Button>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity="warning">
            You are not logged in. Transaction history may be limited.
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
}
