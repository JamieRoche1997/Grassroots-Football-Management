import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Grid2 as Grid,
    Snackbar,
    IconButton,
    CircularProgress,
    Alert
} from '@mui/material';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchProducts, createCheckoutSession } from '../../services/payments';
import { useAuth } from '../../hooks/useAuth';

interface Product {
    id: string;
    productId: string;
    priceId: string;
    price: number;
    quantity: number;
    installmentMonths?: number;
}

export default function Shop() {
    const { clubName, ageGroup, division } = useAuth();

    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthLoaded, setIsAuthLoaded] = useState(false);

    // Wait until auth values (clubName, ageGroup, division) are loaded before fetching products
    useEffect(() => {
        if (clubName && ageGroup && division) {
            setIsAuthLoaded(true);
        }
    }, [clubName, ageGroup, division]);

    useEffect(() => {
        const loadProducts = async () => {
            if (!isAuthLoaded) return;

            try {
                setLoading(true);
                setError(null);
                if (clubName && ageGroup && division) {
                    const data = await fetchProducts(clubName, ageGroup, division);
                    console.log("Fetched Products:", data);
                    setProducts(data.products);
                } else {
                    throw new Error("Missing authentication details");
                }
            } catch {
                setError("Error loading products. Please try again.");
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [isAuthLoaded, clubName, ageGroup, division, error]);

    const addToCart = (product: Product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.product.id === product.id);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevCart, { product, quantity: 1 }];
            }
        });
        setNotification(`${product.id} added to cart`);
    };

    const removeFromCart = (productId: string) => {
        setCart((prevCart) =>
            prevCart
                .map((item) =>
                    item.product.id === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
        setNotification(`${productId} updated in cart`);
    };

    const removeItemCompletely = (productId: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
        setNotification(`${productId} removed from cart`);
    };

    const getTotalPrice = () =>
        cart.reduce((total, item) => total + item.product.price * item.quantity, 0).toFixed(2);

    // ✅ Redirect to Stripe Checkout
    const handleCheckout = async () => {
        if (cart.length === 0) {
            setNotification("Cart is empty! Add products before checking out.");
            return;
        }
    
        // ✅ Ensure cart contains `priceId` instead of `productId`
        const formattedCart = cart.map((item) => ({
            id: item.product.id,
            productId: item.product.productId, // 🔹 Only for reference
            priceId: item.product.priceId,  // ✅ Use Stripe's `priceId`
            quantity: item.quantity,
        }));
    
        try {
            if (clubName && ageGroup && division) {
                console.log("Formatted Cart for Checkout:", formattedCart);
                const checkoutUrl = await createCheckoutSession(clubName, ageGroup, division, formattedCart);
                window.location.href = checkoutUrl; // ✅ Redirect to Stripe Checkout
            } else {
                setError("Club name is missing. Please try again.");
            }
        } catch {
            setError("Failed to initiate checkout. Please try again.");
        }
    };

    return (
        <Layout>
            <Header />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 5, px: 3 }}>
                <Typography variant="h4" sx={{ mb: 3 }}>
                    🛍️ Available Products for {ageGroup} {division}
                </Typography>

                {loading && <CircularProgress />}
                {!loading && error && <Alert severity="error">{error}</Alert>}

                {!loading && !error && (
                    <Grid container spacing={3} justifyContent="center">
                        {products.map((product) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        boxShadow: 3,
                                        borderRadius: 2,
                                        p: 2
                                    }}
                                >
                                    <CardContent>
                                        <Typography variant="h6">{product.id}</Typography>
                                        <Typography variant="body1">
                                            Price: €{product.price.toFixed(2)}
                                        </Typography>
                                        {product.installmentMonths && (
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                {product.installmentMonths}-Month Plan (€{(product.price / product.installmentMonths).toFixed(2)}/month)
                                            </Typography>
                                        )}
                                    </CardContent>
                                    <Button
                                        variant="contained"
                                        sx={{ mt: 2 }}
                                        startIcon={<AddShoppingCartIcon />}
                                        onClick={() => addToCart(product)}
                                    >
                                        Add to Cart
                                    </Button>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Floating Cart */}
                <Button
                    variant="contained"
                    sx={{ position: 'fixed', bottom: 20, right: 20 }}
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => setShowCart(!showCart)}
                >
                    {showCart ? 'Hide Cart' : `View Cart (${cart.reduce((sum, item) => sum + item.quantity, 0)})`}
                </Button>

                {showCart && (
                    <Box
                        sx={{
                            position: 'fixed',
                            bottom: 80,
                            right: 20,
                            width: 320,
                            backgroundColor: 'white',
                            boxShadow: 3,
                            p: 3,
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6">🛒 Your Cart</Typography>
                        {cart.length === 0 ? (
                            <Typography variant="body2">Your cart is empty.</Typography>
                        ) : (
                            <>
                                {cart.map(({ product, quantity }) => (
                                    <Box key={product.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                        <Box>
                                            <Typography variant="body2">{product.id}</Typography>
                                            <Typography variant="caption">€{product.price.toFixed(2)} each</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <IconButton size="small" onClick={() => removeFromCart(product.id)}>
                                                <RemoveIcon />
                                            </IconButton>

                                            <Typography variant="body2" sx={{ mx: 1 }}>{quantity}</Typography>
                                            <IconButton size="small" onClick={() => addToCart(product)}>
                                                <AddIcon />
                                            </IconButton>

                                            <Box sx={{ width: '16px' }} />

                                            <IconButton size="small" color="error" onClick={() => removeItemCompletely(product.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                ))}
                                <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold' }}>
                                    Total: €{getTotalPrice()}
                                </Typography>
                                {/* ✅ Checkout Button */}
                                <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleCheckout}>
                                    Checkout
                                </Button>
                            </>
                        )}
                    </Box>
                )}
                <Snackbar open={!!notification} autoHideDuration={2000} onClose={() => setNotification(null)} message={notification} />
            </Box>
        </Layout>
    );
}
