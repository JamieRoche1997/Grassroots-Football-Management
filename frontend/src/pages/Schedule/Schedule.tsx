import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import { fetchMatches, fetchTrainings } from '../../services/schedule_management';
import { format } from 'date-fns';
import { auth } from '../../services/firebaseConfig';
import { getClubInfo } from '../../services/user_management';

interface Event {
  title: string;
  date: string;
  type: 'match' | 'training';
  details: string;
}

export default function ScheduleOverview() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        const user = auth.currentUser;
        if (!user || !user.email) {
          console.error('No authenticated user found');
          return;
        }

        const { ageGroup, division } = await getClubInfo(user.email);
        if ( !ageGroup || !division) {
          console.error('Club information is incomplete');
          return;
        }

        const currentMonth = format(new Date(), 'yyyy-MM');
        const nextMonth = format(new Date().setMonth(new Date().getMonth() + 1), 'yyyy-MM');

        // Fetch matches and trainings for the current and next month
        const [matchesCurrent, matchesNext, trainingsCurrent, trainingsNext] = await Promise.all([
          fetchMatches(currentMonth, ageGroup, division),
          fetchMatches(nextMonth, ageGroup, division),
          fetchTrainings(currentMonth, ageGroup, division),
          fetchTrainings(nextMonth, ageGroup, division),
        ]);

        // Format and merge events
        const matchEvents: Event[] = [...matchesCurrent, ...matchesNext].map((match) => ({
          title: `${match.homeTeam} vs ${match.awayTeam}`,
          date: match.date,
          type: 'match',
          details: `Match between ${match.homeTeam} and ${match.awayTeam}`,
        }));

        const trainingEvents: Event[] = [...trainingsCurrent, ...trainingsNext].map((training) => ({
          title: `Training at ${training.location}`,
          date: training.date,
          type: 'training',
          details: training.notes ? `Notes: ${training.notes}` : 'No additional notes provided',
        }));

        // Merge and sort events by date
        const combinedEvents = [...matchEvents, ...trainingEvents].sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setEvents(combinedEvents);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, []);

  return (
    <Layout>
      <Header />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Schedule Overview
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress />
          </Box>
        ) : events.length > 0 ? (
          <Timeline position="alternate">
            {events.map((event, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot color={event.type === 'match' ? 'primary' : 'success'}>
                    {event.type === 'match' ? <SportsSoccerIcon /> : <FitnessCenterIcon />}
                  </TimelineDot>
                  {index !== events.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        {format(new Date(event.date), 'MMMM d, yyyy hh:mm a')}
                      </Typography>
                      <Divider sx={{ mb: 1 }} />
                      <Typography variant="body1">{event.details}</Typography>
                    </CardContent>
                  </Card>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          <Typography>No upcoming events found.</Typography>
        )}
      </Box>
    </Layout>
  );
}
