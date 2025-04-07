import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Chip,
  Box,
  useMediaQuery,
  Stack,
  Typography,
} from "@mui/material";
import TransactionDetails from "./TransactionDetails";
import { PurchasedItem } from "../../../hooks/useTransactions";
import { useTheme } from "@mui/material/styles";

interface TransactionTableProps {
  transactions: {
    timestamp: string;
    club: string;
    amount: number;
    currency: string;
    status: string;
    purchasedItems: PurchasedItem[];
  }[];
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "error";
    default:
      return "default";
  }
};

export default function TransactionTable({
  transactions,
}: TransactionTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect mobile screens

  return (
    <Box>
      {isMobile ? (
        // Mobile View: Card Layout
        <Stack spacing={2}>
          {transactions.map((tx, index) => (
            <Paper key={index} sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Chip
                  label={tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  color={getStatusColor(tx.status)}
                />
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  €{tx.amount.toFixed(2)}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                {new Date(tx.timestamp).toLocaleDateString()}
              </Typography>
              <Box sx={{ mt: 1 }}>
                {tx.purchasedItems.map((item, idx) => (
                  <Typography key={idx} variant="body2">
                    {item.productName}
                  </Typography>
                ))}
              </Box>
              <Box sx={{ mt: 2 }}>
                <TransactionDetails purchasedItems={tx.purchasedItems} />
              </Box>
            </Paper>
          ))}
        </Stack>
      ) : (
        // Desktop View: Table Layout
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          {" "}
          {/* Enable horizontal scrolling */}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Item</strong>
                </TableCell>
                <TableCell>
                  <strong>Amount</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell>
                  <strong>Details</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {tx.purchasedItems.map((item, idx) => (
                      <div key={idx}>{item.productName}</div>
                    ))}
                  </TableCell>
                  <TableCell>€{tx.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        tx.status.charAt(0).toUpperCase() + tx.status.slice(1)
                      }
                      color={getStatusColor(tx.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <TransactionDetails purchasedItems={tx.purchasedItems} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
