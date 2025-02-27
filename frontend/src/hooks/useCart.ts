import { useState, useEffect, useCallback } from 'react';
import { Product } from '../pages/Payments/Shop';

interface CartItem {
  product: Product;
  quantity: number;
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Attempt to load from localStorage at init
    const storedCart = typeof window !== 'undefined'
      ? localStorage.getItem('SHOP_CART')
      : null;
    return storedCart ? JSON.parse(storedCart) : [];
  });

  // Persist cart in localStorage every time it changes
  useEffect(() => {
    localStorage.setItem('SHOP_CART', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItemCompletely = (productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId)
    );
  };

  const clearCart = useCallback(() => {
    setCart([]); // ✅ Clear cart state
    localStorage.removeItem("SHOP_CART"); // ✅ Remove from localStorage
  }, []); // ✅ Memoized to prevent re-creation

  const getTotalPrice = (): string => {
    const total = cart.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);
    return total.toFixed(2);
  };

  const getTotalItems = (): number => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    clearCart,
    getTotalPrice,
    getTotalItems
  };
}
