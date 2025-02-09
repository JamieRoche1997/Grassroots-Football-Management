import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Layout from '../../components/Layout';
import { fetchMatches, addFixture, updateFixtureResult } from '../../services/schedule_management';
import { Box, Button, Typography, Dialog, DialogContent, DialogActions, TextField } from '@mui/material';
import { auth } from '../../services/firebaseConfig';
import { getClubInfo } from '../../services/user_management';

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
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());  // Track the displayed month
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openResultDialog, setOpenResultDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchEvent | null>(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [division, setDivision] = useState<string | null>(null);
  const [newFixture, setNewFixture] = useState({ homeTeam: '', awayTeam: '', date: '', ageGroup: '', division: '', createdBy: '' });

  const fetchMatchData = async (month: Date) => {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        console.error('No authenticated user found');
        return;
      }

      // Get club, age group, and division
      const { clubName, ageGroup, division } = await getClubInfo(user.email);
      console.log('Club:', clubName, 'Age Group:', ageGroup, 'Division:', division);
      if (!clubName || !ageGroup || !division) {
        console.error('Club information is incomplete');
        return;
      }

      setAgeGroup(ageGroup);
      setDivision(division);

      const formattedMonth = format(month, 'yyyy-MM'); // e.g., "2025-02"
      const matches = await fetchMatches(formattedMonth, ageGroup, division);
      const formattedEvents = matches.map((match) => ({
        title: `${match.homeTeam} vs ${match.awayTeam}`,
        start: new Date(match.date),
        end: new Date(match.date),
        matchId: match.matchId,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  // Fetch matches when the component mounts and when the month changes
  useEffect(() => {
    fetchMatchData(currentDate);
  }, [currentDate]);

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

      await addFixture(updatedFixture);
      alert('Fixture added successfully!');
      fetchMatchData(currentDate);
      setOpenAddDialog(false);
    } catch (error) {
      console.error('Error adding fixture:', error);
    }
  };

  const handleUpdateResult = async () => {
    try {
      if (selectedMatch) {
        await updateFixtureResult(selectedMatch.matchId, parseInt(homeScore), parseInt(awayScore));
        alert('Match result updated successfully!');
        fetchMatchData(currentDate);
        setOpenResultDialog(false);
      }
    } catch (error) {
      console.error('Error updating result:', error);
    }
  };

  return (
    <Layout>
      <Header />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Match Schedule
        </Typography>
        <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpenAddDialog(true)}>
          Add Fixture
        </Button>

        {/* Calendar View */}
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          onNavigate={handleNavigate}  // Track navigation changes
          onSelectEvent={(event) => {
            setSelectedMatch(event);
            setOpenResultDialog(true);
          }}
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

        {/* Update Result Dialog */}
        <Dialog open={openResultDialog} onClose={() => setOpenResultDialog(false)}>
          <DialogContent>
            <Typography variant="h6">{selectedMatch?.title}</Typography>
            <TextField
              label="Home Team Score"
              fullWidth
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Away Team Score"
              fullWidth
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleUpdateResult} variant="contained">
              Update
            </Button>
            <Button onClick={() => setOpenResultDialog(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
