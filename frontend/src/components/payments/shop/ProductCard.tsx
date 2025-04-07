import { Card, Box, Typography, Button, useTheme } from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import { Product } from "../../../pages/Payments/Shop";

interface Props {
  product: Product;
  addToCart: (product: Product) => void;
}

export default function ProductCard({ product, addToCart }: Props) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        },
      }}
    >
      <Box
        sx={{
          height: 160,
          bgcolor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Enter image here */}
        <SportsSoccerIcon sx={{ fontSize: 64, opacity: 0.6 }} />
      </Box>

      <Box sx={{ p: 2, flexGrow: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          {product.id}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <LocalOfferIcon
            sx={{ fontSize: 16, color: theme.palette.primary.main, mr: 1 }}
          />
          <Typography variant="body1" sx={{ fontWeight: "medium" }}>
            €{product.price.toFixed(2)}
          </Typography>
        </Box>
        {product.installmentMonths && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CalendarMonthIcon
              sx={{ fontSize: 16, color: theme.palette.text.secondary, mr: 1 }}
            />
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              {product.installmentMonths}-Month Plan (€
              {(product.price / product.installmentMonths).toFixed(2)}/month)
            </Typography>
          </Box>
        )}
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={() => addToCart(product)}
        sx={{ m: 2, mt: 0 }}
      >
        Add to Cart
      </Button>
    </Card>
  );
}
