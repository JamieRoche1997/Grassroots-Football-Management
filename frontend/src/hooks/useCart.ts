import { useState, useEffect, useCallback } from "react";
import { Product } from "../pages/Payments/Shop";

interface CartItem {
  product: Product;
  quantity: number;
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Attempt to load from localStorage at init with try-catch
    try {
      const storedCart =
        typeof window !== "undefined" ? localStorage.getItem("SHOP_CART") : null;
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
      return [];
    }
  });

  // Persist cart in localStorage every time it changes
  useEffect(() => {
    try {
      localStorage.setItem("SHOP_CART", JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [cart]);

  const addToCart = useCallback((product: Product) => {
    // Validate product
    if (!product || !product.id || typeof product.price !== 'number') {
      console.error("Invalid product data:", product);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        // Ensure quantity doesn't exceed reasonable limits (e.g., 99)
        const newQuantity = Math.min(existingItem.quantity + 1, 99);
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    if (!productId) {
      console.error("Invalid product ID for removal");
      return;
    }

    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItemCompletely = useCallback((productId: string) => {
    if (!productId) {
      console.error("Invalid product ID for complete removal");
      return;
    }

    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]); // Clear cart state
    try {
      localStorage.removeItem("SHOP_CART"); // Remove from localStorage
    } catch (error) {
      console.error("Failed to clear cart from localStorage:", error);
    }
  }, []); // Memoized to prevent re-creation

  const getTotalPrice = useCallback((): string => {
    const total = cart.reduce((acc, item) => {
      // Ensure we're working with valid numbers
      const price = Number(item.product.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return acc + price * quantity;
    }, 0);
    return total.toFixed(2);
  }, [cart]);

  const getTotalItems = useCallback((): number => {
    return cart.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  }, [cart]);

  return {
    cart,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };
}
