import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid2 as Grid
} from '@mui/material';
import { fetchFixturesByMonth } from '../../services/schedule_management';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Match {
  matchId: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
}

export default function TeamResults() {
  const { clubName, ageGroup, division, loading: authLoading, role } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const isCoach = role === "coach";

  // Fetch previous matches (matches that have already been played)
  const fetchPreviousMatches = useCallback(async () => {
    if (authLoading) return;
  
    if (!clubName || !ageGroup || !division) {
      setError('Club information is incomplete.');
      setLoading(false);
      return;
    }
  
    try {
      const currentYear = format(new Date(), 'yyyy'); // Get current year
      const currentMonth = new Date().getMonth() + 1; // Get current month (0-based index, so add 1)
      let allMatches: Match[] = [];
  
      // Loop through all months of the current year up to the current month
      for (let month = 1; month <= currentMonth; month++) {
        const formattedMonth = `${currentYear}-${month.toString().padStart(2, '0')}`; // Format month as "YYYY-MM"
        const matches = await fetchFixturesByMonth(formattedMonth, clubName, ageGroup, division);
        console.log(matches);
        if (matches && matches.length > 0) {
          allMatches = [...allMatches, ...matches];
        }
      }
  
      // Filter only past matches
      const pastMatches = allMatches.filter((match) => new Date(match.date) < new Date());
  
      setMatches(pastMatches);
      setError(null);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Failed to load previous matches. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [authLoading, clubName, ageGroup, division]);
  

  useEffect(() => {
    if (!authLoading) {
      fetchPreviousMatches();
    }
  }, [fetchPreviousMatches, authLoading]);

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
        <Box sx={{ p: 3 }}>
          <Typography color="error" variant="h6">{error}</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Match Results
        </Typography>

        {/* Matches Grid */}
        <Grid container spacing={3}>
          {matches.length === 0 ? (
            <Typography variant="h6" color="textSecondary">
              No previous matches found.
            </Typography>
          ) : (
            matches.map((match) => (
              <Grid size={{ xs: 12, sm: 6, md: 4}} key={match.matchId}>
                <Card
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    transition: '0.3s',
                    '&:hover': { transform: 'scale(1.05)', boxShadow: 3 },
                  }}
                  onClick={isCoach ? () => navigate(`/team/results/${encodeURIComponent(match.matchId)}`, { state: { match } }) : undefined}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">
                      {match.homeTeam} vs {match.awayTeam}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {format(new Date(match.date), 'MMMM d, yyyy')}
                    </Typography>
                    {match.homeScore !== undefined && match.awayScore !== undefined ? (
                      <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 1 }}>
                        Final Score: {match.homeScore} - {match.awayScore}
                      </Typography>
                    ) : (
                      <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 1 }}>
                        Score not available
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </Layout>
  );
}
