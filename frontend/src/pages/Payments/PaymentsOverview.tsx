import { useState, useEffect } from "react";
import { Box, Button, Modal, CircularProgress, Typography, Alert } from "@mui/material";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import { checkStripeStatus, createStripeAccount } from "../../services/payments";
import { useAuth } from "../../hooks/useAuth";

export default function PaymentsOverview() {
    const { user, clubName } = useAuth();
    const [stripeAccount, setStripeAccount] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [onboardingLoading, setOnboardingLoading] = useState(false);

    useEffect(() => {
        const fetchStripeStatus = async () => {
            if (!clubName) return;

            try {
                const response = await checkStripeStatus(clubName);
                setStripeAccount(response.stripe_account_id);
                setLoading(false);
                
                // 🚨 If no Stripe account, show onboarding modal
                if (!response.stripe_account_id) {
                    setShowOnboarding(true);
                }
            } catch {
                setError("Failed to check Stripe status.");
                setLoading(false);
            }
        };

        fetchStripeStatus();
    }, [clubName]);

    const handleCreateStripeAccount = async () => {
        if (!clubName || !user?.email) {
            setError("Club name and email are required.");
            return;
        }

        setOnboardingLoading(true);
        try {
            const response = await createStripeAccount(clubName, user.email);
            if (response.onboarding_url) {
                window.location.href = response.onboarding_url; // 🔀 Redirect to Stripe
            } else {
                setError("Failed to generate Stripe onboarding link.");
            }
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setOnboardingLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <Header />
                <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                    <CircularProgress />
                </Box>
            </Layout>
        );
    }

    return (
        <Layout>
            <Header />
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 5 }}>
                <Typography variant="h4">Payments & Products</Typography>
                <Typography variant="body1">Manage your club’s products and payments here.</Typography>

                {/* 🚨 Stripe Onboarding Modal (Only Shows If No Stripe Account) */}
                <Modal open={showOnboarding}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            bgcolor: "white",
                            p: 4,
                            borderRadius: 2,
                            textAlign: "center",
                        }}
                    >
                        <Typography variant="h6">Set Up Your Stripe Account</Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Your club must set up a Stripe account to receive payments.
                        </Typography>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreateStripeAccount}
                            disabled={onboardingLoading}
                        >
                            {onboardingLoading ? <CircularProgress size={24} /> : "Set Up Stripe"}
                        </Button>
                    </Box>
                </Modal>

                {/* ✅ Payments Page Content (Only Shows If Stripe Account Exists) */}
                {stripeAccount && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6">Your Stripe Account is Connected ✅</Typography>
                        <Typography variant="body2">You can now sell products and accept payments.</Typography>
                        {/* Add links to product management */}
                    </Box>
                )}
            </Box>
        </Layout>
    );
}
