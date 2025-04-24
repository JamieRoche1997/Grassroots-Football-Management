import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Grid2 as Grid,
  Avatar,
  Divider,
  useTheme,
  styled,
  alpha,
  Alert,
  Button,
} from "@mui/material";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import { getPlayerStats, PlayerStats } from "../../services/player_stats";
import { useAuth } from "../../hooks/useAuth";
import {
  SportsSoccer,
  EmojiEvents,
  LocalActivity,
  Warning,
  Dangerous,
  ArrowBack,
} from "@mui/icons-material";

// Styled Components
const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: theme.shadows[2],
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1.5),
  "&:not(:last-child)": {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  },
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.primary.main,
}));

export default function PlayerStatsPage() {
  const theme = useTheme();
  const { clubName, ageGroup, division } = useAuth();
  const { playerUid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const playerEmail = location.state?.playerEmail;
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [missingParams, setMissingParams] = useState<string[]>([]);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      // Validate required parameters
      const missingParameters = [];
      if (!clubName) missingParameters.push("Club name");
      if (!ageGroup) missingParameters.push("Age group");
      if (!division) missingParameters.push("Division");
      if (!playerUid) missingParameters.push("Player ID");
      if (!playerEmail) missingParameters.push("Player email");

      if (missingParameters.length > 0) {
        setMissingParams(missingParameters);
        setLoading(false);
        return;
      }

      try {
        const stats = await getPlayerStats(
          clubName as string,
          ageGroup as string,
          division as string,
          playerEmail as string
        );
        if (!stats) {
          setError("No player statistics found.");
        } else {
          setPlayerStats(stats);
        }
      } catch (err) {
        console.error("Error fetching player stats:", err);
        const errorMessage = err instanceof Error 
          ? err.message 
          : "Failed to fetch player statistics. Please try again later.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerStats();
  }, [clubName, ageGroup, division, playerUid, playerEmail]);

  const handleGoBack = () => {
    navigate(-1);
  };

  // Check if there's an error to display
  const errorMessage = error || "";

  return (
    <Layout>
      <Header />
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 3,
          maxWidth: 800,
          mx: "auto",
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
          sx={{ mb: 2 }}
          variant="text"
        >
          Back
        </Button>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: 300,
              gap: 2,
            }}
          >
            <CircularProgress size={60} />
            <Typography color="text.secondary">Loading player statistics...</Typography>
          </Box>
        ) : missingParams.length > 0 ? (
          <Alert 
            severity="warning" 
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle1" fontWeight="bold">Missing required information</Typography>
            <Typography variant="body2">
              The following details are missing: {missingParams.join(', ')}
            </Typography>
          </Alert>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle1" fontWeight="bold">Error</Typography>
            <Typography variant="body2">{errorMessage}</Typography>
          </Alert>
        ) : playerStats ? (
          <>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 4 }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <SportsSoccer
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
                    {playerStats.playerName || "Player"}
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <StatCard>
                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          mr: 3,
                          bgcolor: alpha(theme.palette.primary.main, 0.2),
                          color: theme.palette.primary.main,
                          fontSize: 32,
                        }}
                      >
                        {playerStats.playerName ? playerStats.playerName.charAt(0) : "P"}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          Player Statistics
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Current season performance
                        </Typography>
                      </Box>
                    </Box>

                    <Divider />

                    <StatItem>
                      <Typography variant="body1">
                        <Box
                          component="span"
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <EmojiEvents color="primary" fontSize="small" />
                          Goals
                        </Box>
                      </Typography>
                      <StatValue variant="h6">{playerStats.goals || 0}</StatValue>
                    </StatItem>

                    <StatItem>
                      <Typography variant="body1">
                        <Box
                          component="span"
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LocalActivity color="primary" fontSize="small" />
                          Assists
                        </Box>
                      </Typography>
                      <StatValue variant="h6">{playerStats.assists || 0}</StatValue>
                    </StatItem>

                    <StatItem>
                      <Typography variant="body1">
                        <Box
                          component="span"
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Warning color="warning" fontSize="small" />
                          Yellow Cards
                        </Box>
                      </Typography>
                      <StatValue
                        variant="h6"
                        sx={{ color: theme.palette.warning.main }}
                      >
                        {playerStats.yellowCards || 0}
                      </StatValue>
                    </StatItem>

                    <StatItem>
                      <Typography variant="body1">
                        <Box
                          component="span"
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Dangerous color="error" fontSize="small" />
                          Red Cards
                        </Box>
                      </Typography>
                      <StatValue
                        variant="h6"
                        sx={{ color: theme.palette.error.main }}
                      >
                        {playerStats.redCards || 0}
                      </StatValue>
                    </StatItem>
                  </CardContent>
                </StatCard>
              </Grid>

              {/* Additional Stats Section */}
              <Grid size={{ xs: 12 }}>
                <StatCard>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                      Key Contributions
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 2,
                        "& > *": {
                          flex: "1 1 calc(50% - 16px)",
                          minWidth: 0,
                        },
                      }}
                    >
                      <StatCard variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Goal Contributions
                        </Typography>
                        <StatValue variant="h5">
                          {(playerStats.goals || 0) + (playerStats.assists || 0)}
                        </StatValue>
                      </StatCard>

                      <StatCard variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Cards
                        </Typography>
                        <StatValue
                          variant="h5"
                          sx={{ color: theme.palette.warning.main }}
                        >
                          {(playerStats.yellowCards || 0) + (playerStats.redCards || 0)}
                        </StatValue>
                      </StatCard>
                    </Box>
                  </CardContent>
                </StatCard>
              </Grid>
            </Grid>
          </>
        ) : (
          <Alert severity="info" sx={{ mt: 4 }}>
            <Typography variant="subtitle1">No Statistics Available</Typography>
            <Typography variant="body2">
              No statistics are available for this player. They may not have played any matches yet.
            </Typography>
          </Alert>
        )}
      </Box>
    </Layout>
  );
}
