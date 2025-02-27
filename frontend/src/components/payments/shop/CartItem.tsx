import { Box, Paper, Typography, IconButton, Tooltip } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Product } from '../../../pages/Payments/Shop';

interface CartItemProps {
  product: Product;
  quantity: number;
  removeFromCart: (id: string) => void;
  addToCart: (product: Product) => void;
  removeItemCompletely: (id: string) => void;
}

export default function CartItem({ product, quantity, removeFromCart, addToCart, removeItemCompletely }: CartItemProps) {
  return (
    <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body1">{product.id}</Typography>
        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'medium' }}>
          €{product.price.toFixed(2)}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton size="small" onClick={() => removeFromCart(product.id)}>
            <RemoveIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" sx={{ mx: 1 }}>
            {quantity}
          </Typography>
          <IconButton size="small" onClick={() => addToCart(product)}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>

        <Tooltip title="Remove from cart">
          <IconButton size="small" color="error" onClick={() => removeItemCompletely(product.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
}
