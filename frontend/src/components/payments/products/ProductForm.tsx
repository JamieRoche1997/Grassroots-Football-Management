import { TextField, FormControl, Select, MenuItem, FormControlLabel, Checkbox, Typography, Paper, Button, Box } from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { Product } from "../../../pages/Payments/Shop";

const installmentOptions = [
    { months: 3, multiplier: 1.05 },
    { months: 6, multiplier: 1.1 },
    { months: 9, multiplier: 1.15 },
    { months: 12, multiplier: 1.2 },
];

const productCategories = [
    { label: "Membership", value: "membership" },
    { label: "Jerseys & Merchandise", value: "merchandise" },
    { label: "Training Fees", value: "training" },
    { label: "Match Fees", value: "match" },
    { label: "Other", value: "other" },
];

interface ProductFormProps {
    product: Product;
    index: number;
    handleProductChange: (index: number, field: string, value: string) => void;
    handlePlanToggle: (index: number, months: number) => void;
    removeProduct: (index: number) => void;
}

export default function ProductForm({ product, index, handleProductChange, handlePlanToggle, removeProduct }: ProductFormProps) {
    return (
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6">Product #{index + 1}</Typography>

            <TextField
                placeholder="Product Name"
                type="text"
                variant="outlined"
                fullWidth
                value={product.id}
                onChange={(e) => handleProductChange(index, "id", e.target.value)}
                sx={{ mt: 2 }}
            />

            <TextField
                placeholder="Base Price (€)"
                type="text"
                variant="outlined"
                fullWidth
                value={product.price === 0 ? "" : product.price} 
                onChange={(e) => handleProductChange(index, "price", e.target.value)}
                sx={{ mt: 2 }}
            />

            <FormControl fullWidth sx={{ mt: 2 }}>
                <Select
                    displayEmpty
                    value={product.category}
                    onChange={(e) => handleProductChange(index, "category", e.target.value)}
                    sx={{ color: product.category ? "inherit" : "gray" }}
                >
                    <MenuItem value="" disabled>Select a Category</MenuItem>
                    {productCategories.map((cat) => (
                        <MenuItem key={cat.value} value={cat.value}>
                            {cat.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Typography variant="h6" sx={{ mt: 2 }}>Payment Options</Typography>

            <FormControlLabel
                control={
                    <Checkbox
                        checked={product.selectedPlans.includes(0)}
                        onChange={() => handlePlanToggle(index, 0)}
                    />
                }
                label="Pay in Full (Cheapest Option)"
            />

            {installmentOptions.map(({ months, multiplier }) => (
                <FormControlLabel
                    key={months}
                    control={
                        <Checkbox
                            checked={product.selectedPlans.includes(months)}
                            onChange={() => handlePlanToggle(index, months)}
                        />
                    }
                    label={`${months}-Month Plan (+${((multiplier - 1) * 100).toFixed(0)}% more expensive)`}
                />
            ))}

            {/* ✅ Move "Remove Product" Button to New Line */}
            <Box sx={{ mt: 3, textAlign: "center" }}>
                <Button
                    startIcon={<RemoveCircleOutlineIcon />}
                    onClick={() => removeProduct(index)}
                    sx={{ color: "error.main" }}
                >
                    Remove Product
                </Button>
            </Box>
        </Paper>
    );
}
