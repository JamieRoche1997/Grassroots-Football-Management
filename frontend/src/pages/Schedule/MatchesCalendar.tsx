import { useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Layout from '../../components/Layout';
import { fetchFixturesByMonth, addFixture } from '../../services/schedule_management';
import { Box, Button, Typography, Dialog, DialogContent, DialogActions, TextField } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface MatchEvent {
  title: string;
  start: Date;
  end: Date;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
}

export default function MatchesCalendar() {
  const { clubName, ageGroup, division, loading: authLoading, role } = useAuth();
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());  // Track the displayed month
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newFixture, setNewFixture] = useState({ matchId: '', homeTeam: '', awayTeam: '', date: '', ageGroup: '', division: '', createdBy: '' });

  const isCoach = role === 'coach';

  const fetchMatchData = useCallback(async (month: Date) => {
    if (authLoading) return;

    if (!clubName || !ageGroup || !division) {
      setError('Age group or division is missing.');
      setLoading(false);
      return;
    }
    try {
      const formattedMonth = format(month, 'yyyy-MM'); // e.g., "2025-02"
      const matches = await fetchFixturesByMonth(formattedMonth, clubName, ageGroup, division);
      console.log('matches:', matches);
      const formattedEvents = matches.map((match) => ({
        title: `${match.homeTeam} vs ${match.awayTeam}`,
        start: new Date(match.date),
        end: new Date(match.date),
        matchId: match.matchId,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
      }));
      setEvents(formattedEvents);
      setError(null);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Failed to load matches. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [authLoading, clubName, ageGroup, division]);

  // Fetch matches when the component mounts and when the month changes
  useEffect(() => {
    if (!authLoading) {
      fetchMatchData(currentDate);
    }
  }, [currentDate, fetchMatchData, authLoading]);

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleAddFixture = async () => {
    try {
      if (!ageGroup || !division) {
        console.error('Age group or division is null');
        return;
      }

      const updatedFixture = {
        ...newFixture,
        ageGroup,
        division,
      };

      if (clubName && ageGroup && division) {
        await addFixture({ ...updatedFixture, matchId: new Date().toISOString() }, clubName, ageGroup, division);
      } else {
        console.error('Club name, age group, or division is null');
      }
      alert('Fixture added successfully!');
      fetchMatchData(currentDate);
      setOpenAddDialog(false);
    } catch (error) {
      console.error('Error adding fixture:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <Header />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <LoadingSpinner />
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
        <Typography variant="h4" sx={{ mb: 2 }}>
          Match Schedule
        </Typography>

        {(isCoach) && (
          <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpenAddDialog(true)}>
            Add Fixture
          </Button>
        )}

        {/* Calendar View */}
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          onNavigate={handleNavigate}  // Track navigation changes
        />

        {/* Add Fixture Dialog */}
        <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
          <DialogContent>
            <TextField
              placeholder="Enter Home Team"
              fullWidth
              sx={{ mb: 2 }}
              value={newFixture.homeTeam}
              onChange={(e) => setNewFixture({ ...newFixture, homeTeam: e.target.value })}
            />

            <TextField
              placeholder="Enter Away Team"
              fullWidth
              sx={{ mb: 2 }}
              value={newFixture.awayTeam}
              onChange={(e) => setNewFixture({ ...newFixture, awayTeam: e.target.value })}
            />

            <TextField
              placeholder="Select Date and Time"
              type="datetime-local"
              fullWidth
              sx={{ mb: 2 }}
              value={newFixture.date}
              onChange={(e) => setNewFixture({ ...newFixture, date: e.target.value })}
            />

            <TextField
              placeholder="Enter Creator's Name or Email"
              fullWidth
              value={newFixture.createdBy}
              onChange={(e) => setNewFixture({ ...newFixture, createdBy: e.target.value })}
            />

          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddFixture} variant="contained">
              Add
            </Button>
            <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
