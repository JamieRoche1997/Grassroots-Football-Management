import { useState, useEffect } from "react";
import {
    Box, Button,
    Modal,
    CircularProgress,
    Typography,
    Alert,
    Backdrop,
    Grid2 as Grid, Card,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper
} from "@mui/material";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import { checkStripeStatus, createStripeAccount, createStripeLoginLink } from "../../services/payments";
import { useAuth } from "../../hooks/useAuth";
import { getPayments } from "../../services/payments";

export default function PaymentsOverview() {
    const { user, clubName, ageGroup, division } = useAuth();
    const [stripeAccount, setStripeAccount] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [onboardingLoading, setOnboardingLoading] = useState(false);
    const [payments, setPayments] = useState<Payment[]>([]);
    const membershipPayments = payments.filter(p => p.purchasedItems.some((item: { productName: string; isMembership: boolean }) => item.isMembership));
    const productPayments = payments.filter(p => p.purchasedItems.every(item => !item.isMembership));

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const membershipRevenue = membershipPayments.reduce((sum, p) => sum + p.amount, 0);
    const productRevenue = productPayments.reduce((sum, p) => sum + p.amount, 0);


    interface Payment {
        id: string;
        amount: number;
        currency: string;
        status: string;
        timestamp: string;
        purchasedItems: { productName: string; isMembership: boolean }[];
    }

    useEffect(() => {
        const fetchStripeStatus = async () => {
            if (!clubName) return;

            try {
                const response = await checkStripeStatus(clubName);
                setStripeAccount(response.stripe_account_id);
                setLoading(false);

                if (response.stripe_account_id) {
                    // If stripeAccount exists, fetch payments
                    const paymentsData = await getPayments(clubName, ageGroup!, division!);
                    console.log(paymentsData);
                    setPayments(paymentsData);
                } else {
                    setShowOnboarding(true);
                }
            } catch {
                setError("Failed to check Stripe status.");
                setLoading(false);
            }
        };

        fetchStripeStatus();
    }, [clubName, ageGroup, division]);


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

    function KpiCard({ title, value }: { title: string, value: string | number }) {
        return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                    sx={{
                        p: 2,
                        textAlign: 'center',
                        boxShadow: 3,
                        height: '100%', // Ensures all cards fill their grid cell equally
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}
                >
                    <Typography variant="h6">{title}</Typography>
                    <Typography variant="h5" fontWeight="bold">{value}</Typography>
                </Card>
            </Grid>
        );
    }


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
                <Typography variant="h4" fontWeight="bold">
                    💳 Payments Dashboard
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Track your club’s income, membership sales, and product purchases in real time.
                </Typography>


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
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleOpenStripeDashboard}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : "Open Stripe Dashboard"}
                            </Button>
                        </Box>

                        <Box sx={{ p: 3 }}>

                            {/* KPI Summary */}
                            <Grid container spacing={2}>
                                <KpiCard title="Total Revenue" value={`€${totalRevenue.toFixed(2)}`} />
                                <KpiCard title="Transactions" value={payments.length} />
                                <KpiCard title="Membership Revenue" value={`€${membershipRevenue.toFixed(2)}`} />
                                <KpiCard title="Product Revenue" value={`€${productRevenue.toFixed(2)}`} />
                            </Grid>

                            {/* Payment Table */}
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" gutterBottom>All Payments</Typography>

                                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Date</TableCell>
                                                <TableCell>User Email</TableCell>
                                                <TableCell>Purchased Items</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Amount</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {payments.length > 0 ? (
                                                payments.map((payment) => (
                                                    <TableRow key={payment.id}>
                                                        <TableCell>{new Date(payment.timestamp).toLocaleDateString()}</TableCell>
                                                        <TableCell>{payment.id}</TableCell>
                                                        <TableCell>
                                                            {payment.purchasedItems.map(item => item.productName).join(", ")}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography
                                                                sx={{
                                                                    color: payment.status === 'completed' ? 'green' : 'orange',
                                                                    fontWeight: 'bold'
                                                                }}
                                                            >
                                                                {payment.status.toUpperCase()}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>€{payment.amount.toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center">
                                                        <Typography>No payments found.</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Paper>
                            </Box>

                        </Box>
                    </Box>
                )}
            </Box>
        </Layout>
    );
}
