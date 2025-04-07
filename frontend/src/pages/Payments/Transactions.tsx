import { useState, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTransactions } from "../../hooks/useTransactions";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import TransactionTable from "../../components/payments/transactions/TransactionTable";
import TransactionFilters from "../../components/payments/transactions/TransactionFilters";
import TransactionChart from "../../components/payments/transactions/TransactionChart";

export default function Transactions() {
  const { user } = useAuth();
  const { transactions, loading, error } = useTransactions(
    user?.email ?? undefined
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [spendCategory, setSpendCategory] = useState("all"); // Track spend category filter

  // Filter transactions by search, status, and date
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = search
      ? tx.purchasedItems.some(
          (item) =>
            item.productName.toLowerCase().includes(search.toLowerCase()) ||
            item.category.toLowerCase().includes(search.toLowerCase()) ||
            item.totalPrice.toString().includes(search)
        )
      : true;

    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;

    const matchesDate =
      (!startDate || new Date(tx.timestamp) >= new Date(startDate)) &&
      (!endDate ||
        new Date(tx.timestamp) <=
          new Date(new Date(endDate).setHours(23, 59, 59, 999)));

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Compute Total Spend (filtered by category if needed)
  const totalSpend = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      tx.purchasedItems.forEach((item) => {
        if (spendCategory === "all" || item.category === spendCategory) {
          acc += item.totalPrice;
        }
      });
      return acc;
    }, 0);
  }, [filteredTransactions, spendCategory]);

  return (
    <Layout>
      <Header />
      {/* Total Spend Display & Category Filter */}
      <Box sx={{ p: 4 }}>
        <Typography variant="h4">
          Total Spend: <strong>€{totalSpend.toFixed(2)}</strong>
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={spendCategory}
            onChange={(e) => setSpendCategory(e.target.value)}
          >
            <MenuItem value="all">All Categories</MenuItem>
            <MenuItem value="membership">Membership</MenuItem>
            <MenuItem value="merchandise">Merchandise</MenuItem>
            <MenuItem value="training">Training</MenuItem>
            <MenuItem value="match">Match Fees</MenuItem>
          </Select>
        </FormControl>

        <TransactionChart transactions={transactions} />
      </Box>

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Transaction History
        </Typography>

        {/* Search & Filters */}
        <TransactionFilters
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && filteredTransactions.length === 0 && (
          <Alert severity="info">No transactions found.</Alert>
        )}

        {!loading && filteredTransactions.length > 0 && (
          <TransactionTable transactions={filteredTransactions} />
        )}
      </Box>
    </Layout>
  );
}
