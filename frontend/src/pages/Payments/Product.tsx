import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../services/payments';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Euro } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useProducts } from '../../hooks/useProducts';

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
    const { products: existingProducts, loading: productsLoading, error: productsError } = useProducts(clubName ?? undefined, ageGroup ?? undefined, division ?? undefined);
    const [products, setProducts] = useState([{ name: '', price: '', selectedPlans: [0], category: '' }]);
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
        setProducts((prevProducts) =>
            prevProducts.map((product, i) =>
                i === index ? { ...product, [field]: value } : product
            )
        );
    };


    // Add a new product entry
    const addProduct = () => {
        setProducts([...products, { name: '', price: '', selectedPlans: [0], category: '' }]);
    };

    // Remove a product entry
    const removeProduct = (index: number) => {
        setProducts(products.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        const formattedProducts = products.map((product) => {
            const basePrice = parseFloat(product.price);

            return product.selectedPlans.map((months) => {
                const price =
                    months === 0
                        ? basePrice
                        : (basePrice * installmentOptions.find((p) => p.months === months)!.multiplier).toFixed(2);

                return {
                    name: months === 0 ? product.name : `${product.name} (${months}-Month Plan)`,
                    price: parseFloat(price.toString()),
                    installmentMonths: months === 0 ? null : months,
                    category: product.category,
                    isMembership: product.category === "membership",
                };
            });
        }).flat();


        if (formattedProducts.length === 0) {
            setError("Please add at least one product.");
            return;
        }
        setLoading(true);
        try {
            console.log('formattedProducts:', formattedProducts);
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
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 5 }}>
                <Card
                    sx={{
                        width: '100%',
                        p: 4,
                        boxShadow: theme.shadows[2],
                        borderRadius: 3,
                    }}
                >
                    <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SavingsRoundedIcon fontSize="large" /> List Products for Sale
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
                                    onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                                    sx={{ mt: 2 }}
                                />

                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <Select
                                        displayEmpty // ✅ Makes the first item look like a placeholder
                                        value={product.category}
                                        onChange={(e) => handleProductChange(index, 'category', e.target.value)}
                                        sx={{ color: product.category ? "inherit" : "gray" }} // ✅ Placeholder text color
                                    >
                                        <MenuItem value="" disabled>Select a Category</MenuItem> {/* ✅ Disabled so it can't be selected */}
                                        {productCategories.map((cat) => (
                                            <MenuItem key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>



                                <TextField
                                    placeholder="Base Price (€)"
                                    type="number"
                                    variant="outlined"
                                    fullWidth
                                    value={product.price}
                                    onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                                    sx={{ mt: 2 }}
                                />

                                <Typography variant="h6" sx={{ mt: 2 }}>Payment Options</Typography>

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
                                        label={`${months}-Month Plan (+${((multiplier - 1) * 100).toFixed(0)}% more expensive)`}
                                    />
                                ))}

                                <br />

                                <Button
                                    startIcon={<RemoveCircleOutlineIcon />}
                                    onClick={() => removeProduct(index)}
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
                        disabled={loading}
                        sx={{
                            py: 1.5,
                            fontSize: '1.1rem',
                        }}
                    >
                        {loading ? 'Saving...' : <><Euro /> Save Products</>}
                    </Button>
                </Card>
            </Box>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Divider sx={{ my: 3 }} />

                <Typography variant="h5" gutterBottom>
                    Existing Products
                </Typography>

                {productsLoading && <LoadingSpinner />}

                {productsError && <Alert severity="error">{productsError}</Alert>}

                {!productsLoading && !productsError && existingProducts.length === 0 && (
                    <Alert severity="info">No products found for this team.</Alert>
                )}

                {!productsLoading && existingProducts.length > 0 && (
                    <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 2 }}>
                        <Table>
                            <TableHead sx={{ backgroundColor: 'primary.main' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Product Name</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Price (€)</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Price Per Month</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Installments</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Category</TableCell>
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
                                            <TableCell>{product.price.toFixed(2)}</TableCell>
                                            <TableCell>{pricePerMonth ? `${pricePerMonth} € / month` : '-'}</TableCell>
                                            <TableCell>{product.installmentMonths ? `${product.installmentMonths} months` : 'Pay in Full'}</TableCell>
                                            <TableCell>{product.category}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>

                        </Table>
                    </TableContainer>
                )}
            </Box>

        </Layout>
    );
}
