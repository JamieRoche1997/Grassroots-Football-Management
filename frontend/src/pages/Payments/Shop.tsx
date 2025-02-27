// src/pages/Shop.tsx
import { useState } from 'react';
import {
    Box,
    CircularProgress,
    Alert,
} from '@mui/material';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import CartDrawer from '../../components/payments/shop/CartDrawer';
import Notification from '../../components/payments/shop/Notification';
import ProductList from '../../components/payments/shop/ProductList';
import ShopHeader from '../../components/payments/shop/ShopHeader';
import FloatingCartButton from '../../components/payments/shop/FloatingCartButton';
import CategoryTabs from '../../components/payments/shop/CategoryTabs';
import { createCheckoutSession } from '../../services/payments';
import { useAuth } from '../../hooks/useAuth';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';

export interface Product {
    id: string;
    productId: string;
    priceId: string;
    price: number;
    quantity: number;
    installmentMonths?: number;
    category: string;
    selectedPlans: number[];
}

export default function Shop() {
    const { clubName, ageGroup, division } = useAuth();

    // Custom hooks for products and cart
    const { products, loading, error } = useProducts(clubName ?? undefined, ageGroup ?? undefined, division ?? undefined);
    const {
        cart,
        addToCart,
        removeFromCart,
        removeItemCompletely,
        getTotalPrice,
        getTotalItems
    } = useCart();

    const [cartOpen, setCartOpen] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const handleCheckout = async () => {
        if (cart.length === 0) {
            setNotification('Cart is empty! Add products before checking out.');
            return;
        }

        // Format cart for server
        const formattedCart = cart.map((item) => ({
            id: item.product.id,
            productId: item.product.productId,
            priceId: item.product.priceId,
            quantity: item.quantity
        }));

        try {
            if (clubName && ageGroup && division) {
                const checkoutUrl = await createCheckoutSession(
                    clubName,
                    ageGroup,
                    division,
                    formattedCart
                );
                window.location.href = checkoutUrl;
            } else {
                setNotification('Club name is missing. Please try again.');
            }
        } catch (err) {
            console.log('Failed to initiate checkout:', err);
            setNotification('Something went wrong with checkout.');
        }
    };

    return (
        <Layout>
            <Header />

            <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
                {/* Shop Header */}
                <ShopHeader getTotalItems={getTotalItems} setCartOpen={setCartOpen} />

                {/* Category Tabs */}
                <CategoryTabs selectedCategory={selectedCategory || ''} setSelectedCategory={setSelectedCategory} />


                {/* Loading / Error states */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
                        <CircularProgress color="primary" />
                    </Box>
                )}

                {!loading && error && <Alert severity="error">{error}</Alert>}

                {/* Product List */}
                {!loading && !error && products.length > 0 && (
                    <ProductList products={products} addToCart={addToCart} selectedCategory={selectedCategory} />
                )}

                {/* If no products were found (and no error), display a fallback */}
                {!loading && !error && products.length === 0 && (
                    <Alert severity="info">No products found.</Alert>
                )}

                {/* Cart Drawer */}
                <CartDrawer
                    cart={cart}
                    cartOpen={cartOpen}
                    setCartOpen={setCartOpen}
                    removeFromCart={removeFromCart}
                    addToCart={addToCart}
                    removeItemCompletely={removeItemCompletely}
                    getTotalPrice={getTotalPrice}
                    handleCheckout={handleCheckout}
                />

                {/* Floating Cart Button */}
                <FloatingCartButton getTotalItems={getTotalItems} setCartOpen={setCartOpen} />


                {/* Notifications */}
                <Notification notification={notification} setNotification={setNotification} />
            </Box>
        </Layout>
    );
}