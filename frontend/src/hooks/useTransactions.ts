import { useEffect, useState, useCallback } from "react";
import { fetchTransactions } from "../services/payments";
import { useAuth } from "./useAuth";

export interface PurchasedItem {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  installmentMonths?: number | null;
  totalPrice: number;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  club: string;
  ageGroup: string;
  division: string;
  timestamp: string;
  purchasedItems: PurchasedItem[]; // Include detailed product breakdown
}

export function useTransactions(userEmail: string | undefined) {
  const { clubName, ageGroup, division } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTransactions = useCallback(async () => {
    // Validate required parameters
    if (!userEmail) {
      setError("User email is required to fetch transactions");
      setLoading(false);
      return;
    }

    if (!clubName) {
      setError("Club name is required to fetch transactions");
      setLoading(false);
      return;
    }

    if (!ageGroup) {
      setError("Age group is required to fetch transactions");
      setLoading(false);
      return;
    }

    if (!division) {
      setError("Division is required to fetch transactions");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchTransactions(
        userEmail,
        clubName,
        ageGroup,
        division
      );

      // Validate response structure
      if (!data || !Array.isArray(data.transactions)) {
        throw new Error("Invalid response format from server");
      }

      setTransactions(data.transactions);
    } catch (err) {
      // More detailed error handling
      if (err instanceof Error) {
        setError(`Failed to load transactions: ${err.message}`);
      } else {
        setError("Failed to load transactions. Please try again later.");
      }
      console.error("Error fetching transactions:", err);
      setTransactions([]); // Reset transactions on error
    } finally {
      setLoading(false);
    }
  }, [userEmail, clubName, ageGroup, division]);

  useEffect(() => {
    getTransactions();
  }, [getTransactions]);

  return { transactions, loading, error };
}
