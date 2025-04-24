import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Grid2 as Grid,
  Rating,
  Box,
  Avatar,
  Chip,
  useTheme,
  styled,
  alpha,
  Alert,
  Skeleton,
  Button,
} from "@mui/material";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import {
  fetchPlayerRatings,
  PlayerRating,
} from "../../services/match_management";
import { getMembershipsForTeam } from "../../services/membership";
import { fetchAllFixtures } from "../../services/schedule_management";
import { useAuth } from "../../hooks/useAuth";
import { Star, EmojiEvents, Refresh, SportsBasketball } from "@mui/icons-material";

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  transition: "all 0.3s ease",
  boxShadow: theme.shadows[2],
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[6],
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
}));

const PositionChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
}));

const RatingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

export default function PlayerRatingsDisplay() {
  const theme = useTheme();
  const { clubName, ageGroup, division } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<PlayerWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  interface PlayerWithRating {
    playerEmail: string;
    playerName: string;
    playerUid: string;
    position: string;
    averageRating: number;
    ratingCount: number;
  }

  const fetchData = async () => {
    if (!clubName || !ageGroup || !division) {
      setError("Missing team information. Please ensure your profile is complete.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const allPlayers = await getMembershipsForTeam(
        clubName,
        ageGroup,
        division
      );
      
      if (!Array.isArray(allPlayers) || allPlayers.length === 0) {
        setPlayers([]);
        setLoading(false);
        return;
      }

      const fixtures = await fetchAllFixtures(clubName, ageGroup, division);

      if (!Array.isArray(fixtures)) {
        throw new Error("Failed to fetch fixtures data");
      }

      const ratingsByPlayer: { [email: string]: number[] } = {};

      for (const fixture of fixtures) {
        if (!fixture.matchId) continue;
        
        try {
          const ratings: PlayerRating[] = await fetchPlayerRatings(
            fixture.matchId,
            clubName,
            ageGroup,
            division
          );
          
          if (Array.isArray(ratings)) {
            for (const rating of ratings) {
              if (rating && rating.playerEmail) {
                if (!ratingsByPlayer[rating.playerEmail]) {
                  ratingsByPlayer[rating.playerEmail] = [];
                }
                // Only add valid numeric ratings
                if (typeof rating.overallPerformance === 'number') {
                  ratingsByPlayer[rating.playerEmail].push(rating.overallPerformance);
                }
              }
            }
          }
        } catch (err) {
          console.error(`Error fetching ratings for match ${fixture.matchId}:`, err);
          // Continue with other fixtures even if one fails
        }
      }

      const playersWithRatings: PlayerWithRating[] = allPlayers.map(
        (player: {
          email: string;
          uid: string;
          name: string;
          position: string;
        }) => {
          const allRatings = ratingsByPlayer[player.email] || [];
          const averageRating =
            allRatings.length > 0
              ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
              : 0;

          return {
            playerEmail: player.email || "",
            playerName: player.name || "Unknown Player",
            playerUid: player.uid || "",
            position: player.position || "Unspecified",
            averageRating: isNaN(averageRating) ? 0 : averageRating,
            ratingCount: allRatings.length,
          };
        }
      );

      // Sort players by rating (highest first)
      setPlayers(
        playersWithRatings.sort((a, b) => b.averageRating - a.averageRating)
      );
    } catch (error) {
      console.error("Error fetching player ratings:", error);
      setError("Failed to load player ratings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clubName, ageGroup, division]);

  const handlePlayerClick = (playerUid: string, playerEmail: string) => {
    if (!playerUid || !playerEmail) {
      console.error("Invalid player data for navigation");
      return;
    }
    navigate(`/ratings/players/${playerUid}`, { state: { playerEmail } });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return theme.palette.success.main;
    if (rating >= 6) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array.from(new Array(8)).map((_, index) => (
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`skeleton-${index}`}>
        <Card sx={{ height: '100%', p: 3 }}>
          <Skeleton variant="circular" width={80} height={80} sx={{ mx: "auto", mb: 2 }} />
          <Skeleton variant="text" width="80%" sx={{ mx: "auto", mb: 1 }} />
          <Skeleton variant="rectangular" width="40%" height={24} sx={{ mx: "auto", mb: 2 }} />
          <Skeleton variant="rectangular" width="60%" height={24} sx={{ mx: "auto", mb: 1 }} />
          <Skeleton variant="text" width="30%" sx={{ mx: "auto" }} />
        </Card>
      </Grid>
    ));
  };

  // Render empty state
  const renderEmptyState = () => (
    <Box 
      sx={{
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        py: 6,
        width: "100%"
      }}
    >
      <SportsBasketball sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No player ratings available
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
        Players will appear here once they have been rated in matches.
      </Typography>
      <Button 
        variant="outlined" 
        startIcon={<Refresh />}
        onClick={fetchData}
      >
        Refresh Ratings
      </Button>
    </Box>
  );

  return (
    <Layout>
      <Header />
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 3,
          maxWidth: 1400,
          mx: "auto",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <EmojiEvents
              sx={{
                fontSize: 40,
                color: "primary.main",
                p: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: "50%",
              }}
            />
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Player Ratings
              </Typography>
            </Box>
          </Stack>
          {!loading && players.length > 0 && (
            <Button 
              startIcon={<Refresh />} 
              onClick={fetchData} 
              variant="outlined"
              size="small"
            >
              Refresh
            </Button>
          )}
        </Stack>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={fetchData}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Grid container spacing={3}>
            {renderSkeletons()}
          </Grid>
        ) : players.length === 0 ? (
          renderEmptyState()
        ) : (
          <Grid container spacing={3}>
            {players.map((player) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                key={player.playerUid || `player-${player.playerEmail}`}
              >
                <StyledCard
                  onClick={() =>
                    handlePlayerClick(player.playerUid, player.playerEmail)
                  }
                  sx={{ cursor: "pointer", height: "100%" }}
                >
                  <CardContent sx={{ textAlign: "center", p: 3 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: "auto",
                        mb: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                        color: theme.palette.primary.main,
                        fontSize: 32,
                      }}
                    >
                      {player.playerName ? player.playerName.charAt(0) : "?"}
                    </Avatar>

                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {player.playerName}
                    </Typography>

                    <PositionChip
                      label={player.position}
                      size="small"
                      sx={{ mb: 2 }}
                    />

                    <RatingContainer>
                      <Rating
                        value={player.averageRating / 2}
                        precision={0.5}
                        readOnly
                        emptyIcon={<Star style={{ opacity: 0.5 }} />}
                      />
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        color={getRatingColor(player.averageRating)}
                      >
                        {player.averageRating.toFixed(1)}
                      </Typography>
                    </RatingContainer>

                    <Typography variant="caption" color="text.secondary">
                      {player.ratingCount}{" "}
                      {player.ratingCount === 1 ? "rating" : "ratings"}
                    </Typography>

                    {player.averageRating >= 8 && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          icon={<EmojiEvents fontSize="small" />}
                          label="Top Performer"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </Box>
                    )}
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Layout>
  );
}
