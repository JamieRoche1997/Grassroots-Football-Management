import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Card,
  Paper,
  Alert,
  useTheme,
  Divider,
  FormControl,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../services/payments";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { Euro } from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useProducts } from "../../hooks/useProducts";

// Available installment plans with price multipliers
const installmentOptions = [
  { months: 3, multiplier: 1.05 },
  { months: 6, multiplier: 1.1 },
  { months: 9, multiplier: 1.15 },
  { months: 12, multiplier: 1.2 },
];

const productCategories = [
  { label: "Membership", value: "membership" },
  { label: "Jerseys & Merchandise", value: "merchandise" },
  { label: "Training Fees", value: "training" },
  { label: "Match Fees", value: "match" },
  { label: "Other", value: "other" },
];

export default function Product() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { clubName, ageGroup, division } = useAuth();
  const {
    products: existingProducts,
    loading: productsLoading,
    error: productsError,
  } = useProducts(
    clubName ?? undefined,
    ageGroup ?? undefined,
    division ?? undefined
  );
  const [products, setProducts] = useState([
    { name: "", price: "", selectedPlans: [0], category: "" },
  ]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: {[key: string]: string}}>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [productToRemove, setProductToRemove] = useState<number | null>(null);

  // Ensure clubName, ageGroup, and division are loaded before rendering
  useEffect(() => {
    if (!clubName || !ageGroup || !division) {
      setError("Club name, age group, and division are required.");
    } else {
      setError(null);
    }
    setLoading(false);
  }, [clubName, ageGroup, division]);

  // Prevent rendering if still loading
  if (loading)
    return (
      <Layout>
        <Header />
        <LoadingSpinner />
      </Layout>
    );

  // Toggle payment plans for a specific product
  const handlePlanToggle = (productIndex: number, months: number) => {
    setProducts((prevProducts) =>
      prevProducts.map((product, index) =>
        index === productIndex
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

  // Update product details
  const handleProductChange = (index: number, field: string, value: string) => {
    // Clear field error when user makes a change
    setFieldErrors(prev => {
      const newErrors = {...prev};
      if (newErrors[index] && newErrors[index][field]) {
        delete newErrors[index][field];
      }
      return newErrors;
    });

    setProducts((prevProducts) =>
      prevProducts.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      )
    );
  };

  // Add a new product entry
  const addProduct = () => {
    setProducts([
      ...products,
      { name: "", price: "", selectedPlans: [0], category: "" },
    ]);
  };

  // Confirm removal of a product
  const confirmRemoveProduct = (index: number) => {
    setProductToRemove(index);
  };

  // Remove a product entry
  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
    setProductToRemove(null);
  };

  // Validate product data
  const validateProducts = () => {
    let valid = true;
    const newFieldErrors: {[key: string]: {[key: string]: string}} = {};

    products.forEach((product, index) => {
      const productErrors: {[key: string]: string} = {};
      
      if (!product.name.trim()) {
        productErrors.name = "Product name is required";
        valid = false;
      }

      if (!product.category) {
        productErrors.category = "Category is required";
        valid = false;
      }

      if (!product.price) {
        productErrors.price = "Price is required";
        valid = false;
      } else {
        const priceValue = parseFloat(product.price);
        if (isNaN(priceValue) || priceValue <= 0) {
          productErrors.price = "Price must be a positive number";
          valid = false;
        }
      }

      if (product.selectedPlans.length === 0) {
        productErrors.selectedPlans = "Select at least one payment option";
        valid = false;
      }

      if (Object.keys(productErrors).length > 0) {
        newFieldErrors[index] = productErrors;
      }
    });

    setFieldErrors(newFieldErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateProducts()) {
      setError("Please fix the errors in the form.");
      return;
    }

    if (products.length === 0) {
      setError("Please add at least one product.");
      return;
    }

    setSubmitting(true);
    setError(null);
    
    try {
      if (!clubName || !ageGroup || !division) {
        throw new Error("Club name, age group, and division are required.");
      }

      const formattedProducts = products
        .map((product) => {
          const basePrice = parseFloat(product.price);

          return product.selectedPlans.map((months) => {
            const price =
              months === 0
                ? basePrice
                : (
                    basePrice *
                    installmentOptions.find((p) => p.months === months)!
                      .multiplier
                  ).toFixed(2);

            return {
              name:
                months === 0
                  ? product.name
                  : `${product.name} (${months}-Month Plan)`,
              price: parseFloat(price.toString()),
              installmentMonths: months === 0 ? null : months,
              category: product.category,
              isMembership: product.category === "membership",
            };
          });
        })
        .flat();

      await createProduct(clubName, ageGroup, division, formattedProducts);
      setSuccessMessage("Products added successfully!");
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate("/payments/shop");
      }, 2000);
      
    } catch (error) {
      console.error("Error adding products:", error);
      setError("Failed to add products. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Header />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 5,
        }}
      >
        <Card
          sx={{
            width: "100%",
            p: 4,
            boxShadow: theme.shadows[2],
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <SavingsRoundedIcon fontSize="large" /> List Products for Sale
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Divider sx={{ mt: 2 }} />

          {products.map((product, index) => (
            <Box key={index}>
              <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Typography variant="h6">Product #{index + 1}</Typography>

                <TextField
                  placeholder="Product Name"
                  type="text"
                  variant="outlined"
                  fullWidth
                  value={product.name}
                  onChange={(e) =>
                    handleProductChange(index, "name", e.target.value)
                  }
                  error={!!fieldErrors[index]?.name}
                  helperText={fieldErrors[index]?.name}
                  sx={{ mt: 2 }}
                  required
                />

                <FormControl 
                  fullWidth 
                  sx={{ mt: 2 }}
                  error={!!fieldErrors[index]?.category}
                >
                  <Select
                    displayEmpty
                    value={product.category}
                    onChange={(e) =>
                      handleProductChange(index, "category", e.target.value)
                    }
                    sx={{ color: product.category ? "inherit" : "gray" }}
                  >
                    <MenuItem value="" disabled>
                      Select a Category *
                    </MenuItem>
                    {productCategories.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors[index]?.category && (
                    <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1.5 }}>
                      {fieldErrors[index]?.category}
                    </Typography>
                  )}
                </FormControl>

                <TextField
                  placeholder="Base Price (€)"
                  type="number"
                  variant="outlined"
                  fullWidth
                  value={product.price}
                  onChange={(e) =>
                    handleProductChange(index, "price", e.target.value)
                  }
                  InputProps={{
                    startAdornment: <InputAdornment position="start">€</InputAdornment>,
                    inputProps: { min: 0.01, step: 0.01 }
                  }}
                  error={!!fieldErrors[index]?.price}
                  helperText={fieldErrors[index]?.price}
                  sx={{ mt: 2 }}
                  required
                />

                <Typography variant="h6" sx={{ mt: 2 }}>
                  Payment Options *
                </Typography>

                {fieldErrors[index]?.selectedPlans && (
                  <Typography color="error" variant="caption" sx={{ display: "block", mb: 1 }}>
                    {fieldErrors[index]?.selectedPlans}
                  </Typography>
                )}

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={product.selectedPlans.includes(0)}
                      onChange={() => handlePlanToggle(index, 0)}
                    />
                  }
                  label="Pay in Full (Cheapest Option)"
                />

                {installmentOptions.map(({ months, multiplier }) => (
                  <FormControlLabel
                    key={months}
                    control={
                      <Checkbox
                        checked={product.selectedPlans.includes(months)}
                        onChange={() => handlePlanToggle(index, months)}
                      />
                    }
                    label={`${months}-Month Plan (+${(
                      (multiplier - 1) *
                      100
                    ).toFixed(0)}% more expensive)`}
                  />
                ))}

                <br />

                <Button
                  startIcon={<RemoveCircleOutlineIcon />}
                  onClick={() => confirmRemoveProduct(index)}
                  sx={{ mt: 2, color: theme.palette.error.main }}
                >
                  Remove Product
                </Button>
              </Paper>
            </Box>
          ))}

          <Button
            startIcon={<AddCircleOutlineIcon />}
            onClick={addProduct}
            sx={{ mb: 3 }}
          >
            Add Another Product
          </Button>

          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              py: 1.5,
              fontSize: "1.1rem",
            }}
          >
            {submitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                Saving Products...
              </Box>
            ) : (
              <>
                <Euro sx={{ mr: 1 }} /> Save Products
              </>
            )}
          </Button>
        </Card>
      </Box>
      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom>
          Existing Products
        </Typography>

        {productsLoading && <LoadingSpinner />}

        {productsError && <Alert severity="error">{productsError}</Alert>}

        {!productsLoading &&
          !productsError &&
          existingProducts.length === 0 && (
            <Alert severity="info">No products found for this team.</Alert>
          )}

        {!productsLoading && existingProducts.length > 0 && (
          <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "primary.main" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    Product ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    Price (€)
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    Price Per Month
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    Installments
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    Category
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {existingProducts.map((product) => {
                  const pricePerMonth = product.installmentMonths
                    ? (product.price / product.installmentMonths).toFixed(2)
                    : null;

                  return (
                    <TableRow key={product.id}>
                      <TableCell>{product.id}</TableCell>
                      <TableCell>{product.price.toFixed(2)} €</TableCell>
                      <TableCell>
                        {pricePerMonth ? `${pricePerMonth} € / month` : "-"}
                      </TableCell>
                      <TableCell>
                        {product.installmentMonths
                          ? `${product.installmentMonths} months`
                          : "Pay in Full"}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Confirmation Dialog for Product Removal */}
      <Dialog
        open={productToRemove !== null}
        onClose={() => setProductToRemove(null)}
      >
        <DialogTitle>Remove Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this product?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductToRemove(null)}>Cancel</Button>
          <Button 
            onClick={() => productToRemove !== null && removeProduct(productToRemove)} 
            color="error" 
            autoFocus
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Layout>
  );
}
