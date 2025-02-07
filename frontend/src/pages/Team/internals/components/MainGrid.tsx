import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Copyright from './Copyright';
import TeamDataGrid from './TeamDataGrid';
import PlayerDataGrid from './PlayerDataGrid';
import PageViewsBarChart from './PageViewsBarChart';
import SessionsChart from './SessionsChart';
import StatCard, { StatCardProps } from '../../../../components/StatCard';

const data: StatCardProps[] = [
  {
    title: 'Win Rate',
    value: '75%',
    interval: 'Last 30 days',
    trend: 'up',
    data: [
      0.75, 0.8, 0.6, 0.85, 0.75, 0.9, 
      0.8, 0.75, 0.78, 0.8, 0.85, 0.9,
      0.75, 0.8, 0.6, 0.85, 0.75, 0.9, 
      0.8, 0.75, 0.78, 0.8, 0.85, 0.9,
      0.75, 0.8, 0.6, 0.85, 0.75, 0.9, 
    ],
  },
  {
    title: 'Total Matches',
    value: '12',
    interval: 'Last 30 days',
    trend: 'up',
    data: [
      0, 2, 1, 2, 3, 1, 
      2, 0, 1, 2, 2, 1,
      0, 2, 1, 2, 3, 1, 
      2, 0, 1, 2, 2, 1,
      0, 2, 1, 2, 3, 1, 
    ],
  },
  {
    title: 'Goals Per Match',
    value: '3.4',
    interval: 'Last 30 days',
    trend: 'up',
    data: [
      3.5, 3.0, 3.4, 3.8, 3.2, 3.6, 
      3.5, 3.3, 3.1, 3.5, 3.4, 3.2,
      3.5, 3.0, 3.4, 3.8, 3.2, 3.6, 
      3.5, 3.3, 3.1, 3.5, 3.4, 3.2,
      3.5, 3.0, 3.4, 3.8, 3.2, 3.6, 
    ],
  },
  {
    title: 'Active Players',
    value: '18',
    interval: 'Last 30 days',
    trend: 'neutral',
    data: [
      18, 18, 18, 18, 18, 18, 
      18, 18, 18, 18, 18, 18,
      18, 18, 18, 18, 18, 18, 
      18, 18, 18, 18, 18, 18,
      18, 18, 18, 18, 18, 18, 
    ],
  },
];

export default function MainGrid() {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {data.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, md: 6 }}>
          <SessionsChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
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
        <Grid size={{ xs: 12, lg: 3 }}>
          <Stack gap={2} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
          </Stack>
        </Grid>
      </Grid>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Player Statistics
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 12 }}>
          <PlayerDataGrid />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <Stack gap={2} direction={{ xs: 'column', sm: 'row', lg: 'column' }}>
          </Stack>
        </Grid>
      </Grid>
      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}
