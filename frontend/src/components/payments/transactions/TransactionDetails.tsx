import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  Stack,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { PurchasedItem } from "../../../hooks/useTransactions";

interface TransactionDetailsProps {
  purchasedItems: PurchasedItem[];
}

export default function TransactionDetails({
  purchasedItems,
}: TransactionDetailsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect Mobile

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>View Items</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {isMobile ? (
          // Mobile View: List Layout
          <Stack spacing={2}>
            {purchasedItems.map((item, idx) => (
              <Box key={idx}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {item.productName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Category:{" "}
                  {item.category.charAt(0).toUpperCase() +
                    item.category.slice(1)}
                </Typography>
                <Typography variant="body2">
                  Quantity: {item.quantity}
                </Typography>
                <Typography variant="body2">
                  Installments:{" "}
                  {item.installmentMonths
                    ? `${item.installmentMonths} Months`
                    : "One-Time"}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  Total: €{item.totalPrice.toFixed(2)}
                </Typography>
                {idx !== purchasedItems.length - 1 && (
                  <Divider sx={{ mt: 2 }} />
                )}{" "}
                {/* Adds spacing between items */}
              </Box>
            ))}
          </Stack>
        ) : (
          // Desktop View: Table Layout
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Product</strong>
                </TableCell>
                <TableCell>
                  <strong>Category</strong>
                </TableCell>
                <TableCell>
                  <strong>Quantity</strong>
                </TableCell>
                <TableCell>
                  <strong>Installments</strong>
                </TableCell>
                <TableCell>
                  <strong>Total</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purchasedItems.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>
                    {item.category.charAt(0).toUpperCase() +
                      item.category.slice(1)}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {item.installmentMonths
                      ? `${item.installmentMonths} Months`
                      : "One-Time"}
                  </TableCell>
                  <TableCell>€{item.totalPrice.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
