import { useEffect, useState, useCallback } from "react";
import { alpha, styled, useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid2 as Grid,
  Chip,
  Stack,
  Alert,
  Divider,
} from "@mui/material";
import { fetchFixturesByMonth } from "../../services/schedule_management";
import { getResult } from "../../services/match_management";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

// Styled Components
const MatchCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s ease",
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: "blur(12px)",
  border: "1px solid",
  borderColor: alpha(theme.palette.divider, 0.1),
  borderRadius: 12,
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[6],
    cursor: "pointer",
  },
}));

const ResultChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "1rem",
  padding: theme.spacing(0.5),
  minWidth: 100,
}));

interface Match {
  matchId: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
}

export default function TeamResults() {
  const theme = useTheme();
  const {
    clubName,
    ageGroup,
    division,
    loading: authLoading,
    role,
  } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const isCoach = role === "coach";

  const fetchPreviousMatches = useCallback(async () => {
    if (authLoading) return;

    if (!clubName || !ageGroup || !division) {
      setError("Club information is incomplete.");
      setLoading(false);
      return;
    }

    try {
      const currentYear = format(new Date(), "yyyy");
      const currentMonth = new Date().getMonth() + 1;
      let allMatches: Match[] = [];

      // Parallel fetching of all months
      const monthPromises = Array.from(
        { length: currentMonth },
        (_, i) => i + 1
      ).map((month) => {
        const formattedMonth = `${currentYear}-${month
          .toString()
          .padStart(2, "0")}`;
        return fetchFixturesByMonth(
          formattedMonth,
          clubName,
          ageGroup,
          division
        );
      });

      const monthlyMatches = await Promise.all(monthPromises);
      allMatches = monthlyMatches.flat();

      const pastMatches = allMatches.filter(
        (match) => parseISO(match.date) < new Date()
      );

      const enrichedMatches = await Promise.all(
        pastMatches.map(async (match) => {
          try {
            const result = await getResult(
              match.matchId,
              clubName,
              ageGroup,
              division
            );
            return { ...match, ...result };
          } catch {
            return match;
          }
        })
      );

      setMatches(
        enrichedMatches.sort(
          (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
        )
      );
      setError(null);
    } catch (error) {
      console.error("Error fetching matches:", error);
      setError("Failed to load match results. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [authLoading, clubName, ageGroup, division]);

  useEffect(() => {
    if (!authLoading) fetchPreviousMatches();
  }, [fetchPreviousMatches, authLoading]);

  const getMatchResult = (match: Match) => {
    if (match.homeScore === undefined || match.awayScore === undefined) {
      return { text: "Pending", color: "default" as const };
    }

    if (match.homeTeam === clubName) {
      return match.homeScore > match.awayScore
        ? { text: "Win", color: "success" as const }
        : match.homeScore === match.awayScore
        ? { text: "Draw", color: "warning" as const }
        : { text: "Loss", color: "error" as const };
    } else {
      return match.awayScore > match.homeScore
        ? { text: "Win", color: "success" as const }
        : match.awayScore === match.homeScore
        ? { text: "Draw", color: "warning" as const }
        : { text: "Loss", color: "error" as const };
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <Header />
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Header />
        <Alert severity="error" sx={{ m: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      </Layout>
    );
  }

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
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <SportsSoccerIcon
            sx={{
              fontSize: 40,
              color: "primary.main",
              p: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: "50%",
            }}
          />
          <Typography variant="h4" fontWeight={700}>
            Match Results
          </Typography>
        </Stack>

        {matches.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No completed matches found for this season.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {matches.map((match) => {
              const result = getMatchResult(match);
              const isHomeGame = match.homeTeam === clubName;
              const opponent = isHomeGame ? match.awayTeam : match.homeTeam;

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={match.matchId}>
                  <MatchCard
                    onClick={
                      isCoach
                        ? () =>
                            navigate(`/team/results/${match.matchId}`, {
                              state: { match },
                            })
                        : undefined
                    }
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            {isHomeGame ? "Home Game" : "Away Game"}
                          </Typography>
                          <ResultChip
                            label={result.text}
                            color={result.color}
                            variant="outlined"
                          />
                        </Stack>

                        <Divider />

                        <Box sx={{ textAlign: "center", py: 1 }}>
                          <Typography variant="h6" fontWeight={600}>
                            vs {opponent}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={2}
                            justifyContent="center"
                            alignItems="center"
                            sx={{ mt: 2 }}
                          >
                            {match.homeScore !== undefined &&
                            match.awayScore !== undefined ? (
                              <>
                                <Typography variant="h4" fontWeight={700}>
                                  {isHomeGame
                                    ? match.homeScore
                                    : match.awayScore}
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ color: "text.secondary" }}
                                >
                                  -
                                </Typography>
                                <Typography variant="h4" fontWeight={700}>
                                  {isHomeGame
                                    ? match.awayScore
                                    : match.homeScore}
                                </Typography>
                              </>
                            ) : (
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                Score not available
                              </Typography>
                            )}
                          </Stack>
                        </Box>

                        <Divider />

                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <CalendarMonthIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {format(
                              parseISO(match.date),
                              "MMMM d, yyyy • h:mm a"
                            )}
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </MatchCard>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Layout>
  );
}
