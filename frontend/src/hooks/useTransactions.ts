import { useEffect, useState } from 'react';
import { fetchTransactions } from '../services/payments';
import { useAuth } from './useAuth';

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
    const { clubName, ageGroup, division } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userEmail) return;

        const getTransactions = async () => {
            setLoading(true);
            try {
                if (clubName && ageGroup && division) {
                    const data = await fetchTransactions(userEmail, clubName, ageGroup, division);
                    console.log(data);
                    
                    if (!data.transactions) {
                        throw new Error("Invalid response format");
                    }

                    setTransactions(data.transactions);
                } else {
                    throw new Error("Missing required user information");
                }
            } catch (err) {
                setError("Failed to load transactions.");
                console.error("Error fetching transactions:", err);
            } finally {
                setLoading(false);
            }
        };

        getTransactions();
    }, [userEmail, clubName, ageGroup, division]);

    return { transactions, loading, error };
}
