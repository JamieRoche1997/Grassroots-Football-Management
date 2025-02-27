import { useState, useEffect } from 'react';
import { Box, Typography, Card, Alert, Divider } from '@mui/material';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import ProductList from '../../components/payments/products/ProductList';
import ProductActions from '../../components/payments/products/ProductActions';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { createProduct } from '../../services/payments';
import { useNavigate } from "react-router-dom";

// ✅ Default structure for a product
const defaultProduct = {
  id: '',
  productId: '',
  priceId: '',
  name: '',
  price: 0,
  selectedPlans: [0],
  category: '',
  quantity: 1,
};

export default function Product() {
  const { clubName, ageGroup, division } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([defaultProduct]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Ensure clubName, ageGroup, and division are loaded before rendering
  useEffect(() => {
    if (!clubName || !ageGroup || !division) {
      setError('Club name, age group, and division are required.');
    } else {
      setError(null);
    }
    setLoading(false);
  }, [clubName, ageGroup, division]);

  // 🚀 Prevent rendering if still loading
  if (loading) return <Layout><Header /><LoadingSpinner /></Layout>;

  // ✅ Add a new product entry
  const addProduct = () => {
    setProducts([...products, { ...defaultProduct }]);
  };

  // ✅ Update product details
  const handleProductChange = (index: number, field: string, value: string) => {
    setProducts((prevProducts) =>
      prevProducts.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      )
    );
  };  

  // ✅ Toggle installment plans
  const handlePlanToggle = (index: number, months: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product, i) =>
        i === index
          ? {
              ...product,
              selectedPlans: product.selectedPlans.includes(months)
                ? product.selectedPlans.filter((p) => p !== months)
                : [...product.selectedPlans, months],
            }
          : product
      )
    );
  };

  // ✅ Remove a product entry
  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  // ✅ Handle Submit
  const handleSubmit = async () => {
    const formattedProducts = products.map((product) => ({
      name: product.id,
      price: product.price,
      installmentMonths: product.selectedPlans.includes(0) ? null : product.selectedPlans[0],
      category: product.category,
      isMembership: product.category === "membership",
    }));

    if (formattedProducts.length === 0) {
      setError("Please add at least one product.");
      return;
    }
    setLoading(true);
    try {
      if (clubName && ageGroup && division) {
        await createProduct(clubName, ageGroup, division, formattedProducts);
      } else {
        setError('Club name, age group, and division are required.');
      }
      alert('Products added successfully!');
      navigate('/payments/shop');
    } catch (error) {
      console.error('Error adding products:', error);
      setError('Failed to add products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Header />
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 5 }}>
        <Card sx={{ width: "100%", p: 4, boxShadow: 2, borderRadius: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SavingsRoundedIcon fontSize="large" /> List Products for Sale
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Divider sx={{ mt: 2 }} />

          {/* ✅ Pass state functions down to ProductList */}
          <ProductList products={products} handleProductChange={handleProductChange} handlePlanToggle={handlePlanToggle} removeProduct={removeProduct} />

          {/* ✅ Pass functions down to ProductActions */}
          <ProductActions addProduct={addProduct} handleSubmit={handleSubmit} loading={loading} />

        </Card>
      </Box>
    </Layout>
  );
}
