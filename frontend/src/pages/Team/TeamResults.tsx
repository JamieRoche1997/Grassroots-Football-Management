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
  Button,
} from "@mui/material";
import { fetchFixturesByMonth } from "../../services/schedule_management";
import { getResult } from "../../services/match_management";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { format, parseISO, isValid } from "date-fns";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RefreshIcon from "@mui/icons-material/Refresh";

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
      setError("Club information is incomplete. Please verify your team details.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

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
        ).catch(error => {
          console.error(`Error fetching fixtures for ${formattedMonth}:`, error);
          return []; // Return empty array for failed months to continue processing others
        });
      });

      const monthlyMatches = await Promise.all(monthPromises);
      allMatches = monthlyMatches.flat();

      // Validate dates and filter past matches
      const pastMatches = allMatches
        .filter(match => match.date && typeof match.date === 'string')
        .filter(match => {
          const parsedDate = parseISO(match.date);
          return isValid(parsedDate) && parsedDate < new Date();
        });

      if (pastMatches.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }

      const enrichedMatches = await Promise.all(
        pastMatches.map(async (match) => {
          try {
            if (!match.matchId) {
              console.error("Invalid match missing matchId:", match);
              return match;
            }
            const result = await getResult(
              match.matchId,
              clubName,
              ageGroup,
              division
            );
            return { ...match, ...result };
          } catch (error) {
            console.error(`Error fetching result for match ${match.matchId}:`, error);
            return match;
          }
        })
      );

      setMatches(
        enrichedMatches
          .filter(match => match && match.homeTeam && match.awayTeam) // Ensure valid match data
          .sort((a, b) => {
            try {
              return parseISO(b.date).getTime() - parseISO(a.date).getTime();
            } catch (error) {
              console.error("Date sorting error:", error);
              return 0;
            }
          })
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

  // Memoize getMatchResult to avoid recalculating on each render
  const getMatchResult = useCallback((match: Match) => {
    if (!match || match.homeScore === undefined || match.awayScore === undefined) {
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
  }, [clubName]);

  if (authLoading || loading) {
    return (
      <Layout>
        <Header />
        <LoadingSpinner />
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

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }} 
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => fetchPreviousMatches()}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {!error && matches.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No completed matches found for this season.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {matches.map((match) => {
              if (!match || !match.matchId) return null;
              
              try {
                const result = getMatchResult(match);
                const isHomeGame = match.homeTeam === clubName;
                const opponent = isHomeGame ? match.awayTeam : match.homeTeam;
                const matchDate = parseISO(match.date);
                const formattedDate = isValid(matchDate) 
                  ? format(matchDate, "MMMM d, yyyy • h:mm a")
                  : "Date unavailable";

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
                      sx={{ cursor: isCoach ? "pointer" : "default" }}
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
                              {formattedDate}
                            </Typography>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </MatchCard>
                  </Grid>
                );
              } catch (error) {
                console.error(`Error rendering match ${match.matchId}:`, error);
                return null; // Skip rendering this match if there's an error
              }
            })}
          </Grid>
        )}
      </Box>
    </Layout>
  );
}
