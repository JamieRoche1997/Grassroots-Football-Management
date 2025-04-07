import { Grid2 as Grid } from "@mui/material";
import ProductCard from "./ProductCard";
import { Product } from "../../../pages/Payments/Shop";

interface ProductListProps {
  products: Product[];
  addToCart: (product: Product) => void;
  selectedCategory: string;
}

export default function ProductList({
  products,
  addToCart,
  selectedCategory,
}: ProductListProps) {
  // Filter products by category
  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <Grid container spacing={3}>
      {filteredProducts.map((product) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
          <ProductCard product={product} addToCart={addToCart} />
        </Grid>
      ))}
    </Grid>
  );
}
