import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Copyright from '../internals/components/Copyright';
import CustomizedDataGrid from './CustomizedDataGrid';
import PageViewsBarChart from './PageViewsBarChart';
import StatCard, { StatCardProps } from '../../../components/StatCard';
import MinutesPlayedChart from './SessionsChart';

const data: StatCardProps[] = [
  {
    title: 'Games Played',
    value: '4',
    interval: 'Last 30 days',
    trend: 'up',
    data: [
      0, 0, 0, 1, 0, 0, 
      0, 0, 0, 1, 0, 0, 
      0, 0, 0, 1, 0, 0, 
      0, 0, 0, 0, 0, 0, 
      0, 0, 0, 1, 0, 0,
    ], 
  },
  {
    title: 'Goals',
    value: '7',
    interval: 'Last 30 days',
    trend: 'up',
    data: [
      0, 0, 0, 2, 0, 0, 
      0, 0, 0, 3, 0, 0, 
      0, 0, 0, 2, 0, 0, 
      0, 0, 0, 0, 0, 0, 
      0, 0, 0, 0, 0, 0,
    ], 
  },
  {
    title: 'Assists',
    value: '4',
    interval: 'Last 30 days',
    trend: 'up',
    data: [
      0, 0, 0, 1, 0, 0, 
      0, 0, 0, 2, 0, 0, 
      0, 0, 0, 0, 0, 0, 
      0, 0, 0, 0, 0, 0, 
      0, 0, 0, 1, 0, 0,
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
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
            <StatCard {...card} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, md: 6 }}>
          <MinutesPlayedChart />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PageViewsBarChart />
        </Grid>
      </Grid>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Player Statistics
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 12 }}>
          <CustomizedDataGrid />
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
