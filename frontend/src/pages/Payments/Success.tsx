import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import Layout from "../../components/Layout";
import Header from "../../components/Header";

export default function Success() {
    const navigate = useNavigate();

    return (
        <Layout>
            <Header />
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 5 }}>
                <Typography variant="h4" sx={{ mb: 3 }}>Payment Success</Typography>
                <Button variant="contained" onClick={() => navigate("/payments/shop")}>
                    Return to Home
                </Button>
            </Box>
        </Layout>
    );
}
