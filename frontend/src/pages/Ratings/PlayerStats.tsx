import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
    Stack,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Grid2 as Grid,
} from "@mui/material";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import { getPlayerStats, PlayerStats } from "../../services/player_stats";
import { useAuth } from "../../hooks/useAuth";

export default function PlayerStatsPage() {
    const { clubName, ageGroup, division } = useAuth(); // Get club details from auth
    const { playerUid } = useParams(); // Get playerUid from URL
    const location = useLocation();
    const playerEmail = location.state?.playerEmail;
    const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlayerStats = async () => {
            if (!clubName || !ageGroup || !division || !playerUid) return;

            try {
                const stats = await getPlayerStats(clubName, ageGroup, division, playerEmail);
                setPlayerStats(stats);
            } catch (error) {
                console.error("Error fetching player stats:", error);
                setError("Failed to fetch player stats.");
            } finally {
                setLoading(false);
            }
        };

        fetchPlayerStats();
    }, [clubName, ageGroup, division, playerUid, playerEmail]);

    return (
        <Layout>
            <Stack spacing={2} sx={{ alignItems: "center", pb: 5, mt: { xs: 8, md: 0 } }}>
                <Header />
                <Typography component="h2" variant="h5">
                    Player Stats Overview
                </Typography>

                {loading ? (
                    <CircularProgress />
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : playerStats ? (
                    <Grid container spacing={3} sx={{ width: "100%", maxWidth: "600px" }}>
                        <Grid size = {{xs: 12}}>
                            <Card variant="outlined" sx={{ textAlign: "center", p: 2, borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold">
                                        {playerStats.playerName}
                                    </Typography>
                                    <Typography>
                                        <strong>Goals:</strong> {playerStats.goals}
                                    </Typography>
                                    <Typography>
                                        <strong>Assists:</strong> {playerStats.assists}
                                    </Typography>
                                    <Typography>
                                        <strong>Yellow Cards:</strong> {playerStats.yellowCards}
                                    </Typography>
                                    <Typography>
                                        <strong>Red Cards:</strong> {playerStats.redCards}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                ) : (
                    <Typography>No stats available for this player.</Typography>
                )}
            </Stack>
        </Layout>
    );
}
