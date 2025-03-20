import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid2 as Grid } from '@mui/material';
import { fetchAllFixtures, fetchAllTrainings } from '../../../services/schedule_management';
import { useAuth } from '../../../hooks/useAuth';

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
  const [events, setEvents] = useState<CalendarCardProps[]>([]);
  const { clubName, ageGroup, division } = useAuth();
  const [loading, setLoading] = useState(true); // NEW: Track loading state

  useEffect(() => {
    const loadEvents = async () => {
      if (!clubName || !ageGroup || !division) {
        console.log('Waiting for club data...');
        return;
      }

      try {
        setLoading(true); // Start loading
        const fixtures = await fetchAllFixtures(clubName, ageGroup, division);
        const trainings = await fetchAllTrainings(clubName, ageGroup, division);
        
        const now = new Date();
        
        // Sort events by date
        const sortedMatches = fixtures.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const sortedTrainings = trainings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Find the closest previous and upcoming match
        const previousMatch = [...sortedMatches].reverse().find(match => new Date(match.date) < now);
        const upcomingMatch = sortedMatches.find(match => new Date(match.date) > now);
        
        // Find the closest previous and upcoming training
        const previousTraining = [...sortedTrainings].reverse().find(training => new Date(training.date) < now);
        const upcomingTraining = sortedTrainings.find(training => new Date(training.date) > now);
        
        // Update events
        setEvents([
          previousMatch ? { title: 'Previous Match', description: `${previousMatch.homeTeam} vs ${previousMatch.awayTeam}`, date: previousMatch.date } : { title: 'Previous Match', description: 'No match found', date: '-' },
          upcomingMatch ? { title: 'Upcoming Match', description: `${upcomingMatch.homeTeam} vs ${upcomingMatch.awayTeam}`, date: upcomingMatch.date } : { title: 'Upcoming Match', description: 'No match found', date: '-' },
          previousTraining ? { title: 'Previous Training', description: previousTraining.notes || 'No notes available', date: previousTraining.date } : { title: 'Previous Training', description: 'No training found', date: '-' },
          upcomingTraining ? { title: 'Upcoming Training', description: upcomingTraining.notes || 'No notes available', date: upcomingTraining.date } : { title: 'Upcoming Training', description: 'No training found', date: '-' },
        ]);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    loadEvents();
  }, [clubName, ageGroup, division]); // DEPENDENCIES UPDATED TO WAIT FOR AUTH DATA

  return (
    <Grid container spacing={2}>
      {loading ? (
        <Typography variant="h6" sx={{ textAlign: 'center', width: '100%', marginTop: 2 }}>
          Loading schedule...
        </Typography>
      ) : (
        events.map((event, index) => (
          <Grid size={{ xs:12, sm: 6}} key={index}>
            <CalendarCard {...event} />
          </Grid>
        ))
      )}
    </Grid>
  );
}
