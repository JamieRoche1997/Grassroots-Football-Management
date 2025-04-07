import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import Layout from "../../components/Layout";
import Header from "../../components/Header";

export default function Cancel() {
  const navigate = useNavigate();

  return (
    <Layout>
      <Header />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 5,
        }}
      >
        <Typography variant="h5" color="error" sx={{ mb: 3 }}>
          Your payment was canceled.
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          If this was a mistake, please try again.
        </Typography>

        <Button variant="contained" onClick={() => navigate("/payments/shop")}>
          Return to Home
        </Button>
      </Box>
    </Layout>
  );
}
