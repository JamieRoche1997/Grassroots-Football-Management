import { useEffect, useState } from 'react';
import { fetchTransactions } from '../services/payments';

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
    purchasedItems: PurchasedItem[];  // ✅ Include detailed product breakdown
}

export function useTransactions(userEmail: string | undefined) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userEmail) return;

        const getTransactions = async () => {
            setLoading(true);
            try {
                const data = await fetchTransactions(userEmail);

                if (!data.transactions) {
                    throw new Error("Invalid response format");
                }

                setTransactions(data.transactions);
            } catch (err) {
                setError("Failed to load transactions.");
                console.error("Error fetching transactions:", err);
            } finally {
                setLoading(false);
            }
        };

        getTransactions();
    }, [userEmail]);

    return { transactions, loading, error };
}
