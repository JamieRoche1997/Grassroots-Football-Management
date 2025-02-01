import Grid from '@mui/material/Grid2'; // Correct Grid2 import
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Copyright from '../internals/components/Copyright';
import StatCard, { StatCardProps } from '../../../components/StatCard';
import PlayerStatCard, { PlayerStatCardProps } from '../../../components/PlayerStatCard';
import CalendarView from './CalendarView';

const overviewData: StatCardProps[] = [
  { 
    title: 'Win Rate', 
    value: '75%', 
    interval: 'Last 30 days', 
    trend: 'up', 
    data: [] },
  { 
    title: 'Training Attendance', 
    value: '85%', 
    interval: 'Last 30 days', 
    trend: 'neutral', 
    data: [] },
  { 
    title: 'Pending Join Requests', 
    value: '4', 
    interval: 'New', 
    trend: 'down', 
    data: [] },
];

const performanceData: PlayerStatCardProps[] = [
    {
      playerName: 'Jamie Roche',
      goals: 12,
      assists: 2,
      minutesPlayed: [91, 89, 75, 88, 64, 94, 55, 78, 99, 45],
      fitnessLevel: '75%',
    },
    {
      playerName: 'Kieran Stack',
      goals: 1,
      assists: 7,
      minutesPlayed: [91, 89, 75, 88, 64, 94, 55, 78, 99, 45],
      fitnessLevel: '75%',
    },
    {
      playerName: 'Cathal Roche',
      goals: 10,
      assists: 8,
      minutesPlayed: [91, 89, 75, 88, 64, 94, 55, 78, 99, 45],
      fitnessLevel: '75%',
    },
];

export default function MainGrid() {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* Overview Section */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {overviewData.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Player Stats Section */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Player Performance
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {performanceData.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
            <PlayerStatCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Calendar Section */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Calendar
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <CalendarView />
        </Grid>
      </Grid>

      {/* Footer */}
      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}
