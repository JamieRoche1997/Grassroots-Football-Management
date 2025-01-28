import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

// Simulated data for minutes played in the last 10 matches
const minutesPlayed = [90, 88, 92, 85, 95, 100, 90, 87, 92, 89];
const matchLabels = Array.from({ length: minutesPlayed.length }, (_, i) => `${i + 1}`);

export default function MinutesPlayedChart() {
  const theme = useTheme();

  return (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Minutes Played
        </Typography>
        <Typography variant="h4" component="p">
              1.3M
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2 }}>
          Minutes played by the player in the last 10 matches
        </Typography>
        <LineChart
          colors={[theme.palette.primary.main]}
          xAxis={[
            {
              scaleType: 'point',
              data: matchLabels,
            },
          ]}
          series={[
            {
              id: 'minutes',
              label: 'Minutes Played',
              data: minutesPlayed,
              showMark: true,
              curve: 'linear',
              area: true,
            },
          ]}
          height={250}
          margin={{ left: 50, right: 0, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          sx={{
            '& .MuiAreaElement-series-minutes': {
              fill: "url('#minutes-gradient')",
            },
          }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
        >
          <AreaGradient color={theme.palette.primary.main} id="minutes-gradient" />
        </LineChart>
      </CardContent>
    </Card>
  );
}
