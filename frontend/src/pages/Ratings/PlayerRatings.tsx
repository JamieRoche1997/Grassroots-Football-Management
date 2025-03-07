import { useEffect, useState } from "react";
import {
    Stack,
    Typography,
    Card,
    CardContent,
    Grid2 as Grid,
    CircularProgress,
    Rating,
} from "@mui/material";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import { fetchPlayerRatings, PlayerRating } from "../../services/match_management";
import { getMembershipsForTeam } from "../../services/membership";
import { fetchAllFixtures } from "../../services/schedule_management";
import { useAuth } from "../../hooks/useAuth";

export default function PlayerRatingsDisplay() {
    const { clubName, ageGroup, division } = useAuth();
    const [players, setPlayers] = useState<PlayerWithRating[]>([]);
    const [loading, setLoading] = useState(true);

    interface PlayerWithRating {
        playerEmail: string;
        playerName: string;
        position: string;
        averageRating: number;
    }

    useEffect(() => {
        const fetchData = async () => {
            if (!clubName || !ageGroup || !division) return;

            try {
                const allPlayers = await getMembershipsForTeam(clubName, ageGroup, division);
                const fixtures = await fetchAllFixtures(clubName, ageGroup, division);

                const ratingsByPlayer: { [email: string]: number[] } = {};

                // Collect all ratings across matches
                for (const fixture of fixtures) {
                    const ratings: PlayerRating[] = await fetchPlayerRatings(fixture.matchId, clubName, ageGroup, division);
                    for (const rating of ratings) {
                        if (!ratingsByPlayer[rating.playerEmail]) {
                            ratingsByPlayer[rating.playerEmail] = [];
                        }
                        ratingsByPlayer[rating.playerEmail].push(rating.overallPerformance ?? 0);
                    }
                }

                const playersWithRatings: PlayerWithRating[] = allPlayers.map((player: { email: string; name: string; position: string }) => {
                    const allRatings = ratingsByPlayer[player.email] || [];
                    const averageRating = allRatings.length > 0
                        ? (allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length)
                        : 0;

                    return {
                        playerEmail: player.email,
                        playerName: player.name,
                        position: player.position,
                        averageRating: averageRating,
                    };
                });


                setPlayers(playersWithRatings);
            } catch (error) {
                console.error("Error fetching player ratings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [clubName, ageGroup, division]);

    return (
        <Layout>
            <Stack spacing={2} sx={{ alignItems: "center", pb: 5, mt: { xs: 8, md: 0 } }}>
                <Header />
                <Typography component="h2" variant="h5">
                    Player Ratings Overview
                </Typography>

                {loading ? (
                    <CircularProgress />
                ) : (
                    <Grid container spacing={3} sx={{ width: "100%", maxWidth: "1200px" }}>
                        {players.map((player) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={player.playerEmail}>
                                <Card variant="outlined" sx={{ textAlign: "center", p: 2, borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight="bold">
                                            {player.playerName}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Position: {player.position}
                                        </Typography>
                                        <Rating
                                            value={player.averageRating / 2} // Convert 10 scale to 5 stars
                                            precision={0.5} // Allow half stars
                                            readOnly
                                            sx={{ mt: 1 }}
                                        />

                                        <Typography variant="body2" color="textSecondary">
                                            Average Rating: {player.averageRating.toFixed(1)} / 10
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Stack>
        </Layout>
    );
}
