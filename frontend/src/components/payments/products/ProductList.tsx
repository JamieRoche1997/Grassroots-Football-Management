import { Box } from "@mui/material";
import ProductForm from "./ProductForm";
import { Product } from "../../../pages/Payments/Shop";

interface ProductListProps {
  products: Product[];
  handleProductChange: (index: number, field: string, value: string) => void;
  handlePlanToggle: (index: number, months: number) => void;
  removeProduct: (index: number) => void;
}

export default function ProductList({ products, handleProductChange, handlePlanToggle, removeProduct }: ProductListProps) {
  return (
    <Box>
      {products.map((product, index) => (
        <ProductForm
          key={index}
          product={product}
          index={index}
          handleProductChange={handleProductChange}
          handlePlanToggle={handlePlanToggle}
          removeProduct={removeProduct}
        />
      ))}
    </Box>
  );
}
