import { Button } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

interface ProductActionsProps {
  addProduct: () => void;
  handleSubmit: () => void;
  loading: boolean;
}

export default function ProductActions({ addProduct, handleSubmit, loading }: ProductActionsProps) {
  return (
    <>
      <Button startIcon={<AddCircleOutlineIcon />} onClick={addProduct} sx={{ mb: 3 }}>
        Add Another Product
      </Button>

      <Button
        variant="contained"
        fullWidth
        onClick={handleSubmit}
        disabled={loading}
        sx={{ py: 1.5, fontSize: "1.1rem" }}
      >
        {loading ? "Saving..." : <>Save</>}
      </Button>
    </>
  );
}
