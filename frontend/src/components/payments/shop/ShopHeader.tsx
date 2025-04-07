import { Box, Typography, Paper, Button, Badge, useTheme } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

interface ShopHeaderProps {
  clubName?: string;
  ageGroup?: string;
  division?: string;
  getTotalItems: () => number;
  setCartOpen: (open: boolean) => void;
}

export default function ShopHeader({
  getTotalItems,
  setCartOpen,
}: ShopHeaderProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        background: isDarkMode
          ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
          : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: theme.palette.primary.contrastText,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
          Team Shop
        </Typography>

        <Badge badgeContent={getTotalItems()} color="error">
          <Button
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            onClick={() => setCartOpen(true)}
            sx={{
              bgcolor: theme.palette.background.paper,
              color: theme.palette.primary.main,
              transition: "background-color 0.2s ease-in-out",
              "&:hover": {
                bgcolor: isDarkMode
                  ? theme.palette.primary.light
                  : theme.palette.grey[200],
              },
            }}
          >
            View Cart
          </Button>
        </Badge>
      </Box>
    </Paper>
  );
}
