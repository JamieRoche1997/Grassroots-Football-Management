const url = "https://grassroots-gateway-2au66zeb.nw.gateway.dev";

interface ProductPayload {
    name: string;
    price: number;
    installmentMonths: number | null;
}

// ✅ Check if a club has a Stripe Express account
export const checkStripeStatus = async (clubName: string) => {
    try {
        const response = await fetch(`${url}/stripe/status?clubName=${clubName}`);
        if (!response.ok) {
            throw new Error("Failed to fetch Stripe status");
        }
        return await response.json();
    } catch (error) {
        console.error("Error checking Stripe status:", error);
        throw error;
    }
};

// ✅ Create a Stripe Express account for a club
export const createStripeAccount = async (clubName: string, email: string) => {
    try {
        const response = await fetch(`${url}/stripe/connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clubName, email }),
        });

        if (!response.ok) {
            throw new Error('Failed to create Stripe account');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating Stripe account:', error);
        throw error;
    }
};

// ✅ Create a new product inside a club's Stripe Express account
export const createProduct = async (clubName: string, ageGroup: string, division: string, products: ProductPayload[]) => {
    try {
        const response = await fetch(`${url}/products/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clubName, ageGroup, division, products }), // ✅ Include clubName to specify the correct Stripe account
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

// ✅ Fetch all products for a club
export const fetchProducts = async (clubName: string, ageGroup: string, division: string) => {
    try {
        console.log('Fetching products for:', clubName, ageGroup, division);
        const response = await fetch(`${url}/products/list?clubName=${encodeURIComponent(clubName)}&ageGroup=${encodeURIComponent(ageGroup)}&division=${encodeURIComponent(division)}`);
        
        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }
        
        const data = await response.json();

        // ✅ Ensure `stripe_price_id` is included
        return {
            ...data,
            products: data.products.map((product: { id: string; stripe_product_id: string, stripe_price_id: string; price: number; installmentMonths: number | null }) => ({
                id: product.id,
                productId: product.stripe_product_id, // 🔹 Include productId
                priceId: product.stripe_price_id, // ✅ Include `stripe_price_id`
                price: product.price,
                installmentMonths: product.installmentMonths,
            })),
        };
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};


// Define CartItem type
interface CartItem {
    productId: string;
    quantity: number;
}

export const createCheckoutSession = async (clubName: string, ageGroup: string, division: string, cart: CartItem[]) => {
    try {
        const response = await fetch(`${url}/stripe/create-checkout-session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clubName, ageGroup, division, cart }), // ✅ Ensure `priceId` is sent
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Checkout session error:", errorData);
            throw new Error("Failed to create checkout session");
        }

        const data = await response.json();
        return data.checkoutUrl; // ✅ Return Stripe-hosted checkout URL
    } catch (error) {
        console.error("Error creating checkout session:", error);
        throw error;
    }
};
