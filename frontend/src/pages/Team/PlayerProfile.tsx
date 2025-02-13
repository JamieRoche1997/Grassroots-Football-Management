import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Typography, Box, Card, Avatar, Grid2 as Grid, Divider } from '@mui/material';
import { fetchPlayers } from '../../services/team_management';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';

// Player Interface
interface Player {
  name: string;
  dob: string;
  position: string;
  uid: string;
  image?: string;
  preferredFoot?: string;
  appearances?: number;
  goals?: number;
  assists?: number;
  cleanSheets?: number;
  available?: boolean;
  lastMatchRating?: number;
  lastMatchComment?: string;
  trainingSessionsAttended?: number;
  trainingSessionsMissed?: number;
  trainingRating?: number;
  trainingFeedback?: string;
  injuryStatus?: string;
  expectedReturnDate?: string;
  tacticalRole?: string;
  stamina?: number;
  minutesPlayedLast5Games?: number[];
  captainStatus?: string;
  upcomingFixtures?: { date: string; opponent: string; status: string }[];
}

// Function to calculate age from dob
const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function PlayerProfile() {
  const { playerUid } = useParams(); // Access player UID from URL params
  const { state } = useLocation(); // Access passed state
  const [player, setPlayer] = useState<Player | null>(state?.player || null); // Set initial player from state
  console.log(player);
  const [loading, setLoading] = useState<boolean>(!state?.player); // Only load if no player is passed through state

  // Fallback fetch in case player is accessed via direct URL
  useEffect(() => {
    const fetchPlayerByUid = async () => {
      if (!player && playerUid) {
        try {
          const players = await fetchPlayers('Cobh Ramblers', 'Professional', 'Division Premier');
          const foundPlayer = players.find((p) => p.uid === playerUid);
          setPlayer(foundPlayer || null);
        } catch (error) {
          console.error('Error fetching player details:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPlayerByUid();
  }, [player, playerUid]);

  if (loading) {
    return (
      <Layout>
        <Header />
        <LoadingSpinner />
      </Layout>
    );
  }

  if (!player) {
    return (
      <Layout>
        <Header />
        <Typography variant="h5" sx={{ p: 3 }}>
          Player not found.
        </Typography>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <Box sx={{ p: 3 }}>
        <Card sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            {/* Player Image / Avatar */}
            <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              {player.image ? (
                <Avatar src={player.image} sx={{ width: 150, height: 150 }} />
              ) : (
                <Avatar sx={{ width: 150, height: 150, fontSize: 40 }}>
                  {player.name
                    .split(' ')
                    .map(word => word[0])
                    .join('')
                    .toUpperCase()}
                </Avatar>
              )}
            </Grid>

            {/* Player Details */}
            <Grid size={{ xs: 12, sm: 8 }}>
              <Typography variant="h4">{player.name}</Typography>
              <Typography variant="h6" color="text.secondary">{player.position}</Typography>
              <Typography variant="body1">Age: {calculateAge(player.dob)}</Typography>
              <Typography variant="body1">Preferred Foot: {player.preferredFoot || 'Unknown'}</Typography>
              <Typography variant="body1">Availability: {player.available ? "✅ Available" : "❌ Not Available"}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Player Statistics */}
          <Typography variant="h5" sx={{ mb: 2 }}>Performance Stats</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body1"><strong>Appearances:</strong> {player.appearances || 0}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body1"><strong>Goals:</strong> {player.goals || 0}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="body1"><strong>Assists:</strong> {player.assists || 0}</Typography>
            </Grid>
            {player.position === "Goalkeeper" && (
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body1"><strong>Clean Sheets:</strong> {player.cleanSheets || 0}</Typography>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Last Match Rating */}
          <Typography variant="h5" sx={{ mb: 2 }}>Last Match Performance</Typography>
          {player.lastMatchRating ? (
            <>
              <Typography variant="body1"><strong>Match Rating:</strong> ⭐ {player.lastMatchRating}/10</Typography>
              {player.lastMatchComment && (
                <Typography variant="body1"><em>"{player.lastMatchComment}"</em></Typography>
              )}
            </>
          ) : (
            <Typography variant="body1" color="textSecondary">No match data available.</Typography>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Injury & Medical Status */}
          {player.injuryStatus && (
            <>
              <Typography variant="h5" sx={{ mb: 2 }}>Injury Status</Typography>
              <Typography variant="body1"><strong>Current Injury:</strong> {player.injuryStatus}</Typography>
              {player.expectedReturnDate && (
                <Typography variant="body1"><strong>Expected Return:</strong> {player.expectedReturnDate}</Typography>
              )}
              <Divider sx={{ my: 3 }} />
            </>
          )}

          {/* Training Stats */}
          <Typography variant="h5" sx={{ mb: 2 }}>Training Performance</Typography>
          <Typography variant="body1"><strong>Sessions Attended:</strong> {player.trainingSessionsAttended || 0}</Typography>
          <Typography variant="body1"><strong>Sessions Missed:</strong> {player.trainingSessionsMissed || 0}</Typography>
          <Typography variant="body1"><strong>Training Rating:</strong> ⭐ {player.trainingRating || "N/A"}/10</Typography>
          {player.trainingFeedback && (
            <Typography variant="body1"><em>"{player.trainingFeedback}"</em></Typography>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Upcoming Fixtures */}
          <Typography variant="h5" sx={{ mb: 2 }}>Upcoming Fixtures</Typography>
          {player.upcomingFixtures?.length ? (
            player.upcomingFixtures.map((fixture, index) => (
              <Typography key={index} variant="body1">
                📅 {fixture.date} - vs {fixture.opponent} ({fixture.status})
              </Typography>
            ))
          ) : (
            <Typography variant="body1" color="textSecondary">No upcoming fixtures.</Typography>
          )}
        </Card>
      </Box>
    </Layout>
  );
}
