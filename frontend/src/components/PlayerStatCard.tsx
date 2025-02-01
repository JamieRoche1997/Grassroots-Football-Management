import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { areaElementClasses } from '@mui/x-charts/LineChart';

export type PlayerStatCardProps = {
  playerName: string;
  goals: number;
  assists: number;
  minutesPlayed: number[];  
  fitnessLevel: string;
};

function getLastXGames(numGames: number) {
  return Array.from({ length: numGames }, (_, i) => `Game ${i + 1}`);
}

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

export default function PlayerStatCard({
  playerName,
  goals,
  assists,
  minutesPlayed,
  fitnessLevel,
}: PlayerStatCardProps) {
  const theme = useTheme();
  const games = getLastXGames(minutesPlayed.length);

  const chartColor =
    theme.palette.mode === 'light'
      ? theme.palette.info.main
      : theme.palette.info.dark;

  return (
    <Card variant="outlined" sx={{ height: '100%', flexGrow: 1 }}>
      <CardContent>
        <Typography component="h2" variant="h6" gutterBottom>
          {playerName}
        </Typography>
        <Stack direction="column" spacing={2}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle2">Goals: {goals}</Typography>
            <Typography variant="subtitle2">Assists: {assists}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle2">Fitness: {fitnessLevel}</Typography>
          </Stack>
          <Box sx={{ width: '100%', height: 80 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Minutes played (Last {minutesPlayed.length} games)
            </Typography>
            <SparkLineChart
              colors={[chartColor]}
              data={minutesPlayed}
              area
              showHighlight
              showTooltip
              xAxis={{
                scaleType: 'band',
                data: games,
              }}
              sx={{
                [`& .${areaElementClasses.root}`]: {
                  fill: `url(#area-gradient-${playerName})`,
                },
              }}
            >
              <AreaGradient color={chartColor} id={`area-gradient-${playerName}`} />
            </SparkLineChart>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
