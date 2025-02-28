import { useState, useEffect } from "react";
import { Box, Button, Modal, CircularProgress, Typography, Alert, Backdrop } from "@mui/material";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import { checkStripeStatus, createStripeAccount, createStripeLoginLink } from "../../services/payments";
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

    const handleOpenStripeDashboard = async () => {
        if (!clubName) {
            setError("Club name is required to generate Stripe login link.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const loginUrl = await createStripeLoginLink(clubName);
            window.open(loginUrl, "_blank");
        } catch {
            setError("An error occurred while generating the login link.");
        } finally {
            setLoading(false);
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
                <Modal
                    open={showOnboarding}
                    onClose={() => setShowOnboarding(false)}
                    closeAfterTransition
                    slots={{ backdrop: Backdrop }}
                    slotProps={{
                        backdrop: {
                            sx: {
                                backgroundColor: 'rgba(0, 0, 0, 0.3)' // Semi-transparent backdrop
                            }
                        }
                    }}
                >
                    <Box
                        sx={{
                            alignSelf: "center",
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            borderRadius: 4,
                            p: 4,
                            maxWidth: 500,
                            width: "90%",
                            textAlign: "center",
                        }}
                    >
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            🚀 Set Up Your Stripe Account
                        </Typography>
                        <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
                            To receive payments, your club must connect to Stripe. This only takes a minute!
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreateStripeAccount}
                            disabled={onboardingLoading}
                            fullWidth
                            sx={{ py: 1.5, fontSize: "1rem", textTransform: "none" }}
                        >
                            {onboardingLoading ? (
                                <CircularProgress size={24} sx={{ color: "white" }} />
                            ) : (
                                "Start Stripe Onboarding"
                            )}
                        </Button>

                        <Typography variant="caption" sx={{ display: "block", mt: 2, color: "text.disabled" }}>
                            This will redirect you to Stripe’s secure onboarding page.
                        </Typography>
                    </Box>
                </Modal>


                {/* ✅ Payments Page Content (Only Shows If Stripe Account Exists) */}
                {stripeAccount && (
                    <Box sx={{ mt: 3, textAlign: "center" }}>
                        <Typography variant="h6">Your Stripe Account is Connected ✅</Typography>
                        <Typography variant="body2">You can now sell products and accept payments.</Typography>

                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 3 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleOpenStripeDashboard}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : "Open Stripe Dashboard"}
                            </Button>
                        </Box>
                    </Box>

                )}
            </Box>
        </Layout>
    );
}
