import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';

export default function PlayerPerformanceBarChart() {
  const theme = useTheme();

  // Custom color palette
  const colorPalette = [
    theme.palette.primary.dark,
    theme.palette.primary.main,
    theme.palette.primary.light,
  ];

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Player Performance
        </Typography>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              Last 7 Matches
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Goals, assists, and yellow cards over the last 7 matches
          </Typography>
        </Stack>
        <BarChart
          borderRadius={8}
          colors={colorPalette}
          xAxis={[
            {
              scaleType: 'band',
              data: ['1', '2', '3', '4', '5', '6', '7'],
            },
          ]}
          series={[
            {
              id: 'goals',
              label: 'Goals',
              data: [2, 1, 0, 3, 1, 2, 1],
            },
            {
              id: 'assists',
              label: 'Assists',
              data: [1, 2, 0, 1, 0, 1, 1],
            },
            {
              id: 'yellow-cards',
              label: 'Yellow Cards',
              data: [0, 1, 0, 1, 0, 0, 1],
            },
          ]}
          height={250}
          margin={{ left: 50, right: 0, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          slotProps={{
            legend: {
              hidden: true, 
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
