import { useState, useEffect, useCallback } from "react";
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

  const loadProducts = useCallback(async () => {
    // Early return if auth details are missing
    if (!clubName) {
      setError("Club name is required");
      setLoading(false);
      return;
    }
    if (!ageGroup) {
      setError("Age group is required");
      setLoading(false);
      return;
    }
    if (!division) {
      setError("Division is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts(clubName, ageGroup, division);
      
      // Validate response data
      if (!data || !Array.isArray(data.products)) {
        throw new Error("Invalid response format from server");
      }
      
      setProducts(data.products);
    } catch (err) {
      // More specific error handling
      if (err instanceof Error) {
        setError(`Error loading products: ${err.message}`);
      } else {
        setError("Error loading products. Please try again.");
      }
      console.error("Error fetching products:", err);
      setProducts([]); // Reset products on error
    } finally {
      setLoading(false);
    }
  }, [clubName, ageGroup, division]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return { products, loading, error };
}
