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
import { fetchMatches } from "../../services/schedule_management";
import { submitMatchRating } from "../../services/match_ratings";
import { useAuth } from "../../hooks/useAuth";

export default function MatchRatings() {
    const { user, clubName, ageGroup, division } = useAuth();
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [rating, setRating] = useState<Rating>({
        overallQuality: 5,
        refereeingPerformance: 5,
        homeTeamPerformance: 5,
        awayTeamPerformance: 5,
        sportsmanship: 5,
        crowdAtmosphere: 5,
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !clubName || !ageGroup || !division) return;

            try {
                // Fetch matches for the selected team
                const teamMatches = await fetchMatches('2025-02', clubName, ageGroup, division);
                setMatches(teamMatches);
            } catch (error) {
                console.error("Error fetching match data:", error);
            }
            setLoading(false);
        };

        fetchData();
    }, [user, clubName, ageGroup, division]);

    interface Rating {
        [key: string]: number;
        overallQuality: number;
        refereeingPerformance: number;
        homeTeamPerformance: number;
        awayTeamPerformance: number;
        sportsmanship: number;
        crowdAtmosphere: number;
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

    const handleOpenDialog = (match: Match) => {
        setSelectedMatch(match);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        document.getElementById("rateButton")?.focus(); // Moves focus to a visible button
        setSelectedMatch(null);
        setOpenDialog(false);
    };


    const handleSubmitRating = async () => {
        if (!selectedMatch) {
            alert("Please select a match.");
            return;
        }

        try {
            if (user?.email && clubName && ageGroup && division) {
                await submitMatchRating(
                    selectedMatch.matchId,
                    clubName,
                    ageGroup,
                    division,
                    { ...rating, matchId: selectedMatch.matchId }
                );

                alert(`Rating submitted successfully for ${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam}!`);
                handleCloseDialog();

            } else {
                alert("User information is incomplete.");
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
            alert(`Failed to submit rating for ${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam}. Please try again.`);
        }
    };

    return (
        <Layout>
            <Stack spacing={2} sx={{ alignItems: "center", pb: 5, mt: { xs: 8, md: 0 } }}>
                <Header />

                <Typography component="h2" variant="h5">
                    Match Ratings
                </Typography>

                {loading ? (
                    <CircularProgress />
                ) : (
                    <Grid container spacing={3} sx={{ width: "100%", maxWidth: "1200px" }}>
                        {matches.map((match) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={match.matchId}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6">{match.homeTeam} vs {match.awayTeam}</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Date: {new Date(match.date).toLocaleDateString()}
                                        </Typography>

                                        <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleOpenDialog(match)}>
                                            Rate Match
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Dialog for Ratings */}
                {openDialog && (
                    <Dialog open={openDialog} onClose={handleCloseDialog}>
                        <DialogTitle>Rate {selectedMatch?.homeTeam} vs {selectedMatch?.awayTeam}</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                {Object.keys(rating).map((category) => (
                                    <Grid size={{ xs: 12 }} key={category}>
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
                )}

            </Stack>
        </Layout>
    );
}
