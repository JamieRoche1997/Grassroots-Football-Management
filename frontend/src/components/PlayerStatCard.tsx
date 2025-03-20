import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export type PlayerStatCardProps = {
  playerName: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
};

export default function PlayerStatCard({
  playerName,
  goals,
  assists,
  yellowCards,
  redCards,
}: PlayerStatCardProps) {

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
            <Typography variant="subtitle2">Yellow Cards: {yellowCards}</Typography>
            <Typography variant="subtitle2">Red Cards: {redCards}</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
