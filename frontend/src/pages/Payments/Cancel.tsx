import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Alert, Paper } from "@mui/material";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import { useCart } from "../../hooks/useCart";
import { useEffect } from "react";

export default function Cancel() {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    // Ensure the cart is cleared even if the payment was canceled
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
          px: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 500,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography 
            variant="h5" 
            color="error" 
            sx={{ mb: 3 }}
            aria-live="polite"
          >
            Payment Canceled
          </Typography>
          
          <Alert severity="info" sx={{ width: "100%", mb: 3 }}>
            Your payment process was canceled. If this was a mistake, you can try again.
            Your cart items have been saved.
          </Alert>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate("/payments/checkout")}
              aria-label="Return to checkout"
            >
              Return to Checkout
            </Button>
            
            <Button 
              variant="contained" 
              onClick={() => navigate("/payments/shop")}
              aria-label="Return to shop"
            >
              Return to Shop
            </Button>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
}
