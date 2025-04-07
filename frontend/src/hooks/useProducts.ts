import { useState, useEffect } from "react";
import { fetchProducts } from "../services/payments";
import { Product } from "../pages/Payments/Shop";

export function useProducts(
  clubName: string | undefined,
  ageGroup: string | undefined,
  division: string | undefined
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      if (!clubName || !ageGroup || !division) {
        // If any auth detail is missing, skip fetching
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchProducts(clubName, ageGroup, division);
        // Adjust based on how your fetchProducts returns data
        setProducts(data.products);
      } catch (err) {
        setError("Error loading products. Please try again.");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [clubName, ageGroup, division]);

  return { products, loading, error };
}
