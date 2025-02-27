import { Fab, Badge } from "@mui/material";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

interface FloatingCartButtonProps {
  getTotalItems: () => number;
  setCartOpen: (open: boolean) => void;
}

export default function FloatingCartButton({ getTotalItems, setCartOpen }: FloatingCartButtonProps) {
  return (
    <Fab
      color="primary"
      aria-label="cart"
      onClick={() => setCartOpen(true)}
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 1000, // Ensure it stays on top
        boxShadow: 3, // Add a slight shadow for better visibility
        
      }}
    >
      <Badge badgeContent={getTotalItems()} color="error">
        <ShoppingCartIcon />
      </Badge>
    </Fab>
  );
}
