import { useState, useEffect } from "react";
import { Box, CircularProgress, Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import CartDrawer from "../../components/payments/shop/CartDrawer";
import Notification from "../../components/payments/shop/Notification";
import ProductList from "../../components/payments/shop/ProductList";
import ShopHeader from "../../components/payments/shop/ShopHeader";
import FloatingCartButton from "../../components/payments/shop/FloatingCartButton";
import CategoryTabs from "../../components/payments/shop/CategoryTabs";
import { createCheckoutSession } from "../../services/payments";
import { useAuth } from "../../hooks/useAuth";
import { useProducts } from "../../hooks/useProducts";
import { useCart } from "../../hooks/useCart";

export interface Product {
  id: string;
  productId: string;
  priceId: string;
  price: number;
  quantity: number;
  installmentMonths?: number;
  category: string;
  selectedPlans: number[];
}

export default function Shop() {
  const { clubName, ageGroup, division } = useAuth();

  // Custom hooks for products and cart
  const { products, loading, error } = useProducts(
    clubName ?? undefined,
    ageGroup ?? undefined,
    division ?? undefined
  );
  const {
    cart,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    getTotalPrice,
    getTotalItems,
  } = useCart();

  const [cartOpen, setCartOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [missingUserInfo, setMissingUserInfo] = useState<string | null>(null);

  // Validate required user info
  useEffect(() => {
    if (!clubName) {
      setMissingUserInfo("Club name");
    } else if (!ageGroup) {
      setMissingUserInfo("Age group");
    } else if (!division) {
      setMissingUserInfo("Division");
    } else {
      setMissingUserInfo(null);
    }
  }, [clubName, ageGroup, division]);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setNotification("Cart is empty! Add products before checking out.");
      return;
    }

    if (missingUserInfo) {
      setNotification(`${missingUserInfo} is required before checkout.`);
      return;
    }

    setShowCheckoutConfirm(true);
  };

  const processCheckout = async () => {
    setShowCheckoutConfirm(false);
    setIsCheckingOut(true);

    try {
      // Format cart for server
      const formattedCart = cart.map((item) => ({
        id: item.product.id,
        productId: item.product.productId,
        priceId: item.product.priceId,
        quantity: item.quantity,
      }));

      if (!clubName || !ageGroup || !division) {
        throw new Error("Missing required user information");
      }

      const checkoutUrl = await createCheckoutSession(
        clubName,
        ageGroup,
        division,
        formattedCart
      );
      
      if (!checkoutUrl) {
        throw new Error("Failed to get checkout URL");
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Checkout error:", err);
      const errorMessage = err instanceof Error ? err.message : "Something went wrong with checkout.";
      setNotification(`Checkout failed: ${errorMessage}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Layout>
      <Header />

      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        {/* Shop Header */}
        <ShopHeader getTotalItems={getTotalItems} setCartOpen={setCartOpen} />

        {/* Missing user info warning */}
        {missingUserInfo && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {missingUserInfo} is missing. Some features may be limited.
          </Alert>
        )}

        {/* Category Tabs */}
        <CategoryTabs
          selectedCategory={selectedCategory || ""}
          setSelectedCategory={setSelectedCategory}
        />

        {/* Loading / Error states */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        )}

        {!loading && error && <Alert severity="error">{error}</Alert>}

        {/* Product List */}
        {!loading && !error && products.length > 0 && (
          <ProductList
            products={products}
            addToCart={addToCart}
            selectedCategory={selectedCategory}
          />
        )}

        {/* If no products were found (and no error), display a fallback */}
        {!loading && !error && products.length === 0 && (
          <Alert severity="info">No products found for the selected category.</Alert>
        )}

        {/* Cart Drawer */}
        <CartDrawer
          cart={cart}
          cartOpen={cartOpen}
          setCartOpen={setCartOpen}
          removeFromCart={removeFromCart}
          addToCart={addToCart}
          removeItemCompletely={removeItemCompletely}
          getTotalPrice={getTotalPrice}
          handleCheckout={handleCheckout}
        />

        {/* Floating Cart Button */}
        <FloatingCartButton
          getTotalItems={getTotalItems}
          setCartOpen={setCartOpen}
        />

        {/* Notifications */}
        <Notification
          notification={notification}
          setNotification={setNotification}
        />

        {/* Checkout loader overlay */}
        {isCheckingOut && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <Box sx={{ textAlign: "center", backgroundColor: "white", p: 3, borderRadius: 2 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Box sx={{ color: "text.primary" }}>Processing your order...</Box>
            </Box>
          </Box>
        )}

        {/* Checkout confirmation dialog */}
        <Dialog
          open={showCheckoutConfirm}
          onClose={() => setShowCheckoutConfirm(false)}
        >
          <DialogTitle>Confirm Checkout</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You are about to complete your purchase of {getTotalItems()} item(s) for a total of £{getTotalPrice()}.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCheckoutConfirm(false)}>Cancel</Button>
            <Button onClick={processCheckout} variant="contained" color="primary">
              Continue to Payment
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
