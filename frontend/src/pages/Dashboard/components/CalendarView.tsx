import { Card, CardContent, Typography, Grid2 as Grid } from '@mui/material';

type CalendarCardProps = {
  title: string;
  description: string;
  date: string;
};

function CalendarCard({ title, description, date }: CalendarCardProps) {
  return (
    <Card variant="outlined" sx={{ width: '100%', height: '100%' }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2">{description}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {date}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function CalendarView() {
  const events = [
    {
      title: 'Previous Match',
      description: 'Cobh Ramblers vs Bohemians',
      date: 'Feb 1st, 2025 - 15:00',
    },
    {
      title: 'Upcoming Match',
      description: 'Shamrock Rovers vs Cobh Ramblers',
      date: 'Feb 8th, 2025 - 18:00',
    },
    {
      title: 'Previous Training',
      description: 'Tactical session on defense',
      date: 'Jan 30th, 2025 - 10:00 AM',
    },
    {
      title: 'Upcoming Training',
      description: 'Set piece practice',
      date: 'Feb 5th, 2025 - 10:00 AM',
    },
  ];

  return (
    <Grid container spacing={2}>
      {/* First Row: Previous Match and Upcoming Match */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <CalendarCard {...events[0]} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CalendarCard {...events[1]} />
      </Grid>

      {/* Second Row: Previous Training and Upcoming Training */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <CalendarCard {...events[2]} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CalendarCard {...events[3]} />
      </Grid>
    </Grid>
  );
}
