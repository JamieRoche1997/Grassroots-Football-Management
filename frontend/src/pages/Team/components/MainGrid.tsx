import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Copyright from "../internals/components/Copyright";
import TeamDataGrid from "./TeamDataGrid";
import PlayerDataGrid from "./PlayerDataGrid";
import PageViewsBarChart from "./PageViewsBarChart";
import StatCard, { StatCardProps } from "../../../components/StatCard";
import { fetchAllFixtures } from "../../../services/schedule_management";
import { getResult, getEvents, MatchEvent, MatchResult } from "../../../services/match_management";
import { useAuth } from "../../../hooks/useAuth";

export default function MainGrid() {
  const { clubName, ageGroup, division } = useAuth();
  const [stats, setStats] = useState<StatCardProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTeamStats = async () => {
      if (!clubName || !ageGroup || !division) return;
  
      try {
          const fixtures = await fetchAllFixtures(clubName, ageGroup, division);
  
          const completedMatches = await Promise.all(fixtures.map(async (fixture) => {
              try {
                  const result: MatchResult = await getResult(fixture.matchId, clubName, ageGroup, division);
                  const events: MatchEvent[] = await getEvents(fixture.matchId, clubName, ageGroup, division);
  
                  if (result.homeScore !== undefined && result.awayScore !== undefined) {
                      return {
                          ...fixture,
                          homeScore: result.homeScore,
                          awayScore: result.awayScore,
                          events
                      };
                  }
              } catch (err) {
                  console.warn(`No result or events found for match ${fixture.matchId}`, err);
              }
              return null; // Filter out fixtures with no results
          }));
  
          const validMatches = completedMatches.filter((m): m is NonNullable<typeof m> => m !== null);
  
          const totalMatches = validMatches.length;
          const totalWins = validMatches.filter(
              (match) =>
                  (match.homeTeam === clubName && (match.homeScore ?? 0) > (match.awayScore ?? 0)) ||
                  (match.awayTeam === clubName && (match.awayScore ?? 0) > (match.homeScore ?? 0))
          ).length;
  
          const totalGoals = validMatches.reduce((sum, match) => {
              return (
                  sum +
                  (match.homeTeam === clubName ? match.homeScore ?? 0 : match.awayScore ?? 0)
              );
          }, 0);
  
          const goalsPerMatch = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : "0.0";
          const winRate = totalMatches > 0 ? ((totalWins / totalMatches) * 100).toFixed(1) + "%" : "0%";
  
          const activePlayers = new Set();
          validMatches.forEach((match) => {
              match.events?.forEach((event) => {
                  activePlayers.add(event.playerEmail);
              });
          });
  
          setStats([
              {
                  title: "Win Rate",
                  value: winRate,
                  interval: "All Fixtures",
                  trend: totalWins > 0 ? "up" : "down",
                  data: [],
              },
              {
                  title: "Total Matches",
                  value: totalMatches.toString(),
                  interval: "All Fixtures",
                  trend: "neutral",
                  data: [],
              },
              {
                  title: "Goals Per Match",
                  value: goalsPerMatch,
                  interval: "All Fixtures",
                  trend: "up",
                  data: [],
              },
              {
                  title: "Active Players",
                  value: activePlayers.size.toString(),
                  interval: "All Fixtures",
                  trend: "neutral",
                  data: [],
              },
          ]);
      } catch (error) {
          console.error("Error fetching team stats:", error);
      } finally {
          setLoading(false);
      }
  };
  

    fetchTeamStats();
  }, [clubName, ageGroup, division]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
        {stats.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, md: 6 }}>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <PageViewsBarChart />
        </Grid>
      </Grid>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        League Table
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 12 }}>
          <TeamDataGrid />
        </Grid>
      </Grid>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Player Statistics
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 12 }}>
          <PlayerDataGrid />
        </Grid>
      </Grid>
      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}
