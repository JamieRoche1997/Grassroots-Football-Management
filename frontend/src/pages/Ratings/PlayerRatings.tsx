import { useEffect, useState } from "react";
import {
    Stack,
    Typography,
    Card,
    CardContent,
    Grid2 as Grid,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem
} from "@mui/material";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import { fetchPlayerRatings, submitPlayerRating } from "../../services/player_ratings";
import { fetchPlayers } from "../../services/team_management";
import { fetchMatches } from "../../services/schedule_management";
import { useAuth } from "../../hooks/useAuth";

export default function PlayerRatings() {
    const { user, clubName, ageGroup, division } = useAuth();
    const [players, setPlayers] = useState<Player[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [rating, setRating] = useState<Rating>({
        overallPerformance: 5,
        passingAccuracy: 5,
        shootingAccuracy: 5,
        defensiveWorkRate: 5,
        attackingContributions: 5,
        teamwork: 5,
        skill: 5,
        attitude: 5,
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !clubName || !ageGroup || !division) return;

            try {
                const allPlayers = await fetchPlayers(clubName, ageGroup, division);
                const ratedPlayers = await fetchPlayerRatings(clubName, ageGroup, division);

                // Merge data: If a player exists in `ratedPlayers`, use its rating data
                const mergedPlayers = allPlayers.map((player) => {
                    const ratedPlayer = Array.isArray(ratedPlayers) ? ratedPlayers.find((p) => p.playerEmail === player.email) : undefined;
                    return {
                        playerEmail: player.email,
                        playerName: player.name,
                        position: player.position,
                        averageRating: ratedPlayer ? ratedPlayer.averageRating : 0,
                    };
                });

                setPlayers(mergedPlayers);

                // Fetch matches
                const teamMatches = await fetchMatches('2025-02', clubName, ageGroup, division);
                setMatches(teamMatches);

            } catch (error) {
                console.error("Error fetching player/match data:", error);
            }
            setLoading(false);
        };

        fetchData();
    }, [user, clubName, ageGroup, division]);

    interface Rating {
        [key: string]: number;
        overallPerformance: number;
        passingAccuracy: number;
        shootingAccuracy: number;
        defensiveWorkRate: number;
        attackingContributions: number;
        teamwork: number;
        skill: number;
        attitude: number;
    }

    interface Player {
        playerEmail: string;
        playerName: string;
        position: string;
        averageRating: number;
    }

    interface Match {
        matchId: string;
        homeTeam: string;
        awayTeam: string;
        date: string;
    }

    const formatRatingCategory = (category: string) => {
        return category
            .replace(/([A-Z])/g, " $1") // Add space before uppercase letters
            .trim()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const handleRatingChange = (category: keyof Rating, value: number) => {
        setRating((prev) => ({ ...prev, [category]: value }));
    };

    const handleOpenDialog = (player: Player) => {
        setSelectedPlayer(player);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setSelectedPlayer(null);
        setSelectedMatch(null);
        setOpenDialog(false);
    };

    const handleSubmitRating = async () => {
        if (!selectedPlayer || !selectedMatch) {
            alert("Please select both a player and a match.");
            return;
        }

        try {
            if (user?.email && user.displayName && clubName && ageGroup && division) {
                await submitPlayerRating(
                    selectedPlayer.playerEmail, 
                    user.displayName || "Unknown", 
                    clubName, 
                    ageGroup, 
                    division, 
                    selectedMatch.matchId, 
                    user.email, 
                    rating
                );

                alert(`Rating submitted successfully for ${selectedPlayer.playerName}!`);
                handleCloseDialog();

            } else {
                alert("User information is incomplete.");
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
            alert(`Failed to submit rating for ${selectedPlayer.playerName}. Please try again.`);
        }
    };

    return (
        <Layout>
            <Stack spacing={2} sx={{ alignItems: "center", pb: 5, mt: { xs: 8, md: 0 } }}>
                <Header />

                <Typography component="h2" variant="h5">
                    Player Ratings
                </Typography>

                {loading ? (
                    <CircularProgress />
                ) : (
                    <Grid container spacing={3} sx={{ width: "100%", maxWidth: "1200px" }}>
                        {players.map((player) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4}} key={player.playerEmail}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6">{player.playerName}</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Position: {player.position}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Avg Rating: {player.averageRating}/10
                                        </Typography>

                                        <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleOpenDialog(player)}>
                                            Rate Player
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Dialog for Ratings */}
                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>Rate {selectedPlayer?.playerName}</DialogTitle>
                    <DialogContent>
                        <Select
                            fullWidth
                            value={selectedMatch?.matchId || ""}
                            onChange={(e) =>
                                setSelectedMatch(matches.find((m) => m.matchId === e.target.value) || null)
                            }
                            displayEmpty
                            sx={{ mt: 2 }}
                        >
                            <MenuItem disabled value="">Select a Match</MenuItem>
                            {matches.map((match) => (
                                <MenuItem key={match.matchId} value={match.matchId}>
                                    {match.homeTeam} vs {match.awayTeam} - {new Date(match.date).toLocaleDateString()}
                                </MenuItem>
                            ))}
                        </Select>

                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            {Object.keys(rating).map((category) => (
                                <Grid size={{ xs: 12}} key={category}>
                                    <Typography>{formatRatingCategory(category)}</Typography>
                                    <Select
                                        value={rating[category as keyof Rating]}
                                        onChange={(e) => handleRatingChange(category as keyof Rating, Number(e.target.value))}
                                        fullWidth
                                    >
                                        {[...Array(10)].map((_, i) => (
                                            <MenuItem key={i} value={i + 1}>{i + 1}</MenuItem>
                                        ))}
                                    </Select>
                                </Grid>
                            ))}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button variant="contained" onClick={handleSubmitRating}>Submit</Button>
                    </DialogActions>
                </Dialog>
            </Stack>
        </Layout>
    );
}
