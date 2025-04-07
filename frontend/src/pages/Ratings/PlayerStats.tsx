import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
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
  const playerEmail = location.state?.playerEmail;
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      if (!clubName || !ageGroup || !division || !playerUid) return;

      try {
        const stats = await getPlayerStats(
          clubName,
          ageGroup,
          division,
          playerEmail
        );
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
      <Header />
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 3,
          maxWidth: 800,
          mx: "auto",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 300,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Typography
            color="error"
            variant="h6"
            sx={{ textAlign: "center", mt: 4 }}
          >
            {error}
          </Typography>
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
                    {playerStats.playerName}
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
                        {playerStats.playerName.charAt(0)}
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
                      <StatValue variant="h6">{playerStats.goals}</StatValue>
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
                      <StatValue variant="h6">{playerStats.assists}</StatValue>
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
                        {playerStats.yellowCards}
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
                        {playerStats.redCards}
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
                          {playerStats.goals + playerStats.assists}
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
                          {playerStats.yellowCards + playerStats.redCards}
                        </StatValue>
                      </StatCard>
                    </Box>
                  </CardContent>
                </StatCard>
              </Grid>
            </Grid>
          </>
        ) : (
          <Typography variant="h6" sx={{ textAlign: "center", mt: 4 }}>
            No stats available for this player.
          </Typography>
        )}
      </Box>
    </Layout>
  );
}
