import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Divider,
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

  // Use the transactions hook
  const { transactions, loading, error } = useTransactions(
    user?.email ?? undefined
  );

  // Get the latest transaction
  const latestTransaction = transactions.length > 0 ? transactions[0] : null;

  useEffect(() => {
    clearCart();
  }, [clearCart]);

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
        }}
      >
        <Typography variant="h4" sx={{ mb: 3 }}>
          🎉 Payment Successful!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, maxWidth: "500px" }}>
          Your payment was processed successfully. Below is a summary of your
          purchase.
        </Typography>

        {loading ? (
          <CircularProgress sx={{ my: 2 }} />
        ) : error ? (
          <Typography variant="body1" color="error" sx={{ my: 2 }}>
            {error}
          </Typography>
        ) : latestTransaction ? (
          <Paper sx={{ p: 3, width: "100%", maxWidth: 500, textAlign: "left" }}>
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
                  {item.productName} ({item.quantity})
                </Typography>
                <Typography>€{item.totalPrice.toFixed(2)}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">
              Total: €{latestTransaction.amount.toFixed(2)}
            </Typography>
          </Paper>
        ) : (
          <Typography variant="body1" sx={{ my: 2 }}>
            No recent transaction found.
          </Typography>
        )}

        <Button
          variant="contained"
          sx={{ mt: 3 }}
          onClick={() => navigate("/payments/shop")}
        >
          Return to Shop
        </Button>
      </Box>
    </Layout>
  );
}
