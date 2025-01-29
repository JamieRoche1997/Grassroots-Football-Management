import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';

export default function PageViewsBarChart() {
  const theme = useTheme();
  const colorPalette = [
    theme.palette.primary.dark,
    theme.palette.primary.main,
    theme.palette.primary.light,
  ];
  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Wins
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
              35
            </Typography>
            <Chip size="small" color="default" label="-8%" />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Results
          </Typography>
        </Stack>
        <BarChart
          borderRadius={8}
          colors={colorPalette}
          xAxis={
            [
              {
                scaleType: 'band',
                categoryGapRatio: 0.5,
                data: ['Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec', 'Jan'],
              },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ] as any
          }
          series={[
            { id: 'wins', label: 'Wins', data: [5, 4, 6, 5, 7, 8, 4] },
            { id: 'losses', label: 'Losses', data: [2, 3, 1, 2, 2, 1, 2] },
            { id: 'draws', label: 'Draws', data: [1, 1, 0, 1, 0, 1, 0] },
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
