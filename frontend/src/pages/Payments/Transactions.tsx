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
  Tooltip,
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
  const [spendCategory, setSpendCategory] = useState("all");
  
  // Date validation error
  const [dateError, setDateError] = useState("");

  // Validate dates whenever they change
  useMemo(() => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setDateError("End date must be after start date");
    } else {
      setDateError("");
    }
  }, [startDate, endDate]);

  // Filter transactions by search, status, and date (moved to useMemo for performance)
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
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
  }, [transactions, search, statusFilter, startDate, endDate]);

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

  // Safely format currency
  const formatCurrency = (amount: number): string => {
    try {
      return new Intl.NumberFormat('en-IE', { 
        style: 'currency', 
        currency: 'EUR',
        minimumFractionDigits: 2 
      }).format(amount);
    } catch {
      return `€${amount.toFixed(2)}`;
    }
  };

  return (
    <Layout>
      <Header />
      {/* Total Spend Display & Category Filter */}
      <Box sx={{ p: 4 }}>
        <Typography variant="h4">
          Total Spend: <strong>{formatCurrency(totalSpend)}</strong>
        </Typography>
        <FormControl sx={{ minWidth: 200, mt: 2, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Filter by Category:</Typography>
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

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error loading transaction data: {error}
          </Alert>
        ) : (
          <TransactionChart transactions={transactions} />
        )}
      </Box>

      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Transaction History
        </Typography>

        {/* Display date validation error if needed */}
        {dateError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {dateError}
          </Alert>
        )}

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
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {!loading && !error && filteredTransactions.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No transactions found matching your criteria.
          </Alert>
        )}

        {!loading && !error && filteredTransactions.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Tooltip title="Showing filtered results" placement="top-start">
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Found {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
              </Typography>
            </Tooltip>
            <TransactionTable transactions={filteredTransactions} />
          </Box>
        )}
      </Box>
    </Layout>
  );
}
