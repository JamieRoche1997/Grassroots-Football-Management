import { useEffect, useState } from 'react';
import Divider from '@mui/material/Divider';
import { Grid2 as Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import StatCard, { StatCardProps } from '../../../components/StatCard';
import PlayerStatCard, { PlayerStatCardProps } from '../../../components/PlayerStatCard';
import CalendarView from './CalendarView';
import { getJoinRequests } from '../../../services/team_management';
import { listAllPlayerStats } from '../../../services/player_stats'; // New API call
import { useAuth } from '../../../hooks/useAuth';

export default function MainGrid() {
  const { clubName, ageGroup, division } = useAuth();
  const [overviewData, setOverviewData] = useState<StatCardProps[]>([]);
  const [players, setPlayers] = useState<PlayerStatCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!clubName || !ageGroup || !division) {
        console.log('Waiting for club data...');
        return;
      }

      try {
        setLoading(true);

        // Fetch Pending Join Requests and Player Stats
        const [pendingRequests, playerStats] = await Promise.all([
          getJoinRequests(clubName, ageGroup, division),
          listAllPlayerStats(clubName, ageGroup, division),
        ]);

        console.log('Pending Join Requests:', pendingRequests);
        console.log('Player Stats:', playerStats);

        setOverviewData([
          { title: 'Pending Join Requests', value: `${pendingRequests.length}`, interval: 'New' },
        ]);

        // Process Players for Player Performance section
        const playerData: PlayerStatCardProps[] = playerStats.allPlayers.map((player) => ({
          playerName: player.playerName || 'Unknown Player',
          goals: player.goals ?? 0,
          assists: player.assists ?? 0,
          yellowCards: player.yellowCards ?? 0,
          redCards: player.redCards ?? 0,
        }));

        setPlayers(playerData);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [clubName, ageGroup, division]);

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* Calendar Section */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Calendar
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <CalendarView />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Player Stats Section */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Player Performance
      </Typography>
      <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          players.map((player, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
              <PlayerStatCard {...player} />
            </Grid>
          ))
        )}
      </Grid>


      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Join Requests
      </Typography>
      <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          overviewData.map((card, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
              <StatCard {...card} />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
