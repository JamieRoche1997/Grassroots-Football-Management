import { useEffect, useState, useRef } from 'react';
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
import TodayIcon from '@mui/icons-material/Today';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import { fetchMatches, fetchTrainings } from '../../services/schedule_management';
import { format, isToday, isBefore } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

interface Event {
  title: string;
  date: string;
  type: 'match' | 'training' | 'today';
  details: string;
}

export default function ScheduleOverview() {
  const { clubName, ageGroup, division, loading: authLoading } = useAuth(); // ✅ Ensure auth context is ready
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const todayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchScheduleData = async () => {
      if (authLoading) return; // ✅ Prevents running before auth is ready

      if (!clubName || !ageGroup || !division) {
        setError('Age group or division is missing.');
        setLoading(false);
        return;
      }

      try {
        const currentMonth = format(new Date(), 'yyyy-MM');
        const nextMonth = format(new Date().setMonth(new Date().getMonth() + 1), 'yyyy-MM');

        // Fetch matches and trainings for the current and next month
        const [matchesCurrent, matchesNext, trainingsCurrent, trainingsNext] = await Promise.all([
          fetchMatches(currentMonth, clubName, ageGroup, division),
          fetchMatches(nextMonth, clubName, ageGroup, division),
          fetchTrainings(currentMonth, clubName, ageGroup, division),
          fetchTrainings(nextMonth, clubName, ageGroup, division),
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

        // Add "Today" event at the correct position
        const todayDate = format(new Date(), 'yyyy-MM-dd');
        const todayEvent: Event = {
          title: "Today",
          date: todayDate,
          type: 'today',
          details: 'You are here!',
        };

        // Find the correct index to insert "Today"
        let todayIndex = combinedEvents.findIndex(event => isBefore(new Date(todayDate), new Date(event.date)));
        if (todayIndex === -1) {
          // If no future events exist, push "Today" at the end
          todayIndex = combinedEvents.length;
        }

        // Insert the "Today" event at the correct position
        combinedEvents.splice(todayIndex, 0, todayEvent);

        setEvents(combinedEvents);
        setError(null);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
        setError('Failed to load schedule data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchScheduleData();
    }
  }, [authLoading, clubName, ageGroup, division]);

  useEffect(() => {
    // Auto-scroll to today's event
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [events]);

  if (authLoading || loading) {
    return (
      <Layout>
        <Header />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Header />
        <Box sx={{ p: 3 }}>
          <Typography color="error" variant="h6">{error}</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Schedule Overview
        </Typography>

        {events.length > 0 ? (
          <Timeline position="alternate">
            {events.map((event, index) => {
              const eventDate = new Date(event.date);
              const isTodayEvent = event.type === 'today' || isToday(eventDate);
              
              return (
                <TimelineItem key={index} ref={isTodayEvent ? todayRef : null}>
                  <TimelineSeparator>
                    <TimelineDot color={event.type === 'match' ? 'primary' : event.type === 'training' ? 'success' : 'warning'}>
                      {event.type === 'today' ? <TodayIcon sx={{ color: 'white' }} /> :
                        event.type === 'match' ? <SportsSoccerIcon /> : <FitnessCenterIcon />}
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
                          {format(eventDate, 'MMMM d, yyyy')}
                        </Typography>
                        <Divider sx={{ mb: 1 }} />
                        <Typography variant="body1">{event.details}</Typography>
                      </CardContent>
                    </Card>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        ) : (
          <Typography>No upcoming events found.</Typography>
        )}
      </Box>
    </Layout>
  );
}
