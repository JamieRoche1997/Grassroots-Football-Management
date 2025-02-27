import { Drawer, Box, Typography, Divider, Button } from '@mui/material';
import CartItem from './CartItem';
import { Product } from '../../../pages/Payments/Shop';

interface CartDrawerProps {
  cart: { product: Product; quantity: number }[];
  removeFromCart: (id: string) => void;
  addToCart: (product: Product) => void;
  removeItemCompletely: (id: string) => void;
  getTotalPrice: () => string;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  handleCheckout: () => void;
}

export default function CartDrawer({ cart, removeFromCart, addToCart, removeItemCompletely, getTotalPrice, cartOpen, setCartOpen, handleCheckout }: CartDrawerProps) {
  return (
    <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Your Cart</Typography>
        <Divider sx={{ mb: 2 }} />

        {cart.length === 0 ? (
          <Typography variant="body1">Your cart is empty</Typography>
        ) : (
          <>
            {cart.map(({ product, quantity }) => (
              <CartItem key={product.id} product={product} quantity={quantity} removeFromCart={removeFromCart} addToCart={addToCart} removeItemCompletely={removeItemCompletely} />
            ))}

            <Divider sx={{ my: 2 }} />
            <Typography variant="body1">Total: €{getTotalPrice()}</Typography>
            <Button variant="contained" fullWidth onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
          </>
        )}
      </Box>
    </Drawer>
  );
}
