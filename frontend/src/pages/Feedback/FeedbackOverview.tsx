import { useEffect, useState } from "react";
import * as d3 from "d3";
import {
    Stack,
    Typography,
    Grid,
    CircularProgress,
    Card,
    CardContent,
    Box,
} from "@mui/material";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import { fetchMatchRatings } from "../../services/match_ratings";
import { fetchPlayerRatings } from "../../services/player_ratings";
import { useAuth } from "../../hooks/useAuth";

export default function FeedbackOverview() {
    const { clubName, ageGroup, division } = useAuth();
    const [loading, setLoading] = useState(true);
    const [totalRatedMatches, setTotalRatedMatches] = useState(0);
    const [totalRatedPlayers, setTotalRatedPlayers] = useState(0);
    const [averageMatchQuality, setAverageMatchQuality] = useState(0);
    const [averagePlayerPerformance, setAveragePlayerPerformance] = useState(0);
    const [matchRatingTrends, setMatchRatingTrends] = useState([]);
    const [playerRatingTrends, setPlayerRatingTrends] = useState([]);
    const [topMatches, setTopMatches] = useState([]);
    const [topPlayers, setTopPlayers] = useState([]);
    const [recentRatings, setRecentRatings] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!clubName || !ageGroup || !division) return;

            try {
                // Fetch match ratings
                const matchData = await fetchMatchRatings(clubName, ageGroup, division);
                if (matchData.ratings.length > 0) {
                    setTotalRatedMatches(matchData.ratings.length);
                    setAverageMatchQuality(
                        matchData.ratings.reduce((sum, match) => sum + match.overallQuality, 0) /
                            matchData.ratings.length
                    );
                    setTopMatches(
                        [...matchData.ratings].sort((a, b) => b.overallQuality - a.overallQuality).slice(0, 5)
                    );
                    setMatchRatingTrends(matchData.ratings.map((match) => ({ date: match.matchId, rating: match.overallQuality })));
                }

                // Fetch player ratings
                const playerData = await fetchPlayerRatings(clubName, ageGroup, division);
                if (playerData.ratings.length > 0) {
                    setTotalRatedPlayers(playerData.ratings.length);
                    setAveragePlayerPerformance(
                        playerData.ratings.reduce((sum, player) => sum + player.skill, 0) / playerData.ratings.length
                    );
                    setTopPlayers(
                        [...playerData.ratings].sort((a, b) => b.skill - a.skill).slice(0, 5)
                    );
                    setPlayerRatingTrends(playerData.ratings.map((player) => ({ date: player.playerEmail, rating: player.skill })));
                }

                // Combine recent ratings
                const recent = [...matchData.ratings, ...playerData.ratings]
                    .sort((a, b) => b.matchId - a.matchId)
                    .slice(0, 5);
                setRecentRatings(recent);

            } catch (error) {
                console.error("Error fetching feedback overview:", error);
            }
            setLoading(false);
        };

        fetchData();
    }, [clubName, ageGroup, division]);

    useEffect(() => {
        if (matchRatingTrends.length > 0) {
            drawChart("#matchRatingChart", matchRatingTrends);
        }
        if (playerRatingTrends.length > 0) {
            drawChart("#playerPerformanceChart", playerRatingTrends);
        }
    }, [matchRatingTrends, playerRatingTrends]);

    const drawChart = (chartId: string, data: { date: string; rating: number }[]) => {
        d3.select(chartId).selectAll("*").remove();

        const width = 400;
        const height = 250;
        const margin = { top: 20, right: 30, bottom: 30, left: 50 };

        const svg = d3
            .select(chartId)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const x = d3
            .scaleBand()
            .domain(data.map((d) => d.date))
            .range([margin.left, width - margin.right])
            .padding(0.4);

        const y = d3
            .scaleLinear()
            .domain([0, 10])
            .nice()
            .range([height - margin.bottom, margin.top]);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", (d) => x(d.date) || 0)
            .attr("y", (d) => y(d.rating))
            .attr("height", (d) => y(0) - y(d.rating))
            .attr("width", x.bandwidth())
            .attr("fill", "#3f51b5");
    };

    if (loading) return <Typography>Loading...</Typography>;

    return (
        <Layout>
            <Stack spacing={2} sx={{ alignItems: "center", pb: 5, mt: { xs: 8, md: 0 } }}>
                <Header />
                <Typography component="h2" variant="h5">
                    Feedback Overview
                </Typography>

                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ width: "100%", maxWidth: "1200px" }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card><CardContent>Total Rated Matches: {totalRatedMatches}</CardContent></Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card><CardContent>Total Rated Players: {totalRatedPlayers}</CardContent></Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card><CardContent>Avg Match Quality: {averageMatchQuality.toFixed(1)}</CardContent></Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card><CardContent>Avg Player Performance: {averagePlayerPerformance.toFixed(1)}</CardContent></Card>
                    </Grid>
                </Grid>

                {/* Performance Trends */}
                <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                    Performance Trends
                </Typography>
                <Grid container spacing={2} columns={12}>
                    <Grid item xs={12} md={6}>
                        <Box id="matchRatingChart"></Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box id="playerPerformanceChart"></Box>
                    </Grid>
                </Grid>

                {/* Top Rated Matches & Players */}
                <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                    Top Performers
                </Typography>
                <Grid container spacing={2} columns={12}>
                    <Grid item xs={12} md={6}>
                        <Card><CardContent>Top Matches: {JSON.stringify(topMatches)}</CardContent></Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card><CardContent>Top Players: {JSON.stringify(topPlayers)}</CardContent></Card>
                    </Grid>
                </Grid>
            </Stack>
        </Layout>
    );
}
