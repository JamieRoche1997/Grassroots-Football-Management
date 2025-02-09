import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Layout from '../../components/Layout';
import { fetchTrainings, addTraining } from '../../services/schedule_management';
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

interface TrainingEvent {
  title: string;
  start: Date;
  end: Date;
  trainingId: string;
  location: string;
}

export default function TrainingCalendar() {
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [division, setDivision] = useState<string | null>(null);
  const [newTraining, setNewTraining] = useState({ date: '', location: '', notes: '', createdBy: '' });

  const fetchTrainingData = async (baseDate: Date) => {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        console.error('No authenticated user found');
        return;
      }

      const { ageGroup, division } = await getClubInfo(user.email);
      if (!ageGroup || !division) {
        console.error('Club information is incomplete');
        return;
      }

      setAgeGroup(ageGroup);
      setDivision(division);

      const months = [
        format(addMonths(baseDate, -1), 'yyyy-MM'),
        format(baseDate, 'yyyy-MM'),
        format(addMonths(baseDate, 1), 'yyyy-MM'),
      ];

      const allTrainings = await Promise.all(months.map((month) => fetchTrainings(month, ageGroup, division)));
      const formattedEvents = allTrainings.flat().map((training) => ({
        title: `Training at ${training.location}`,
        start: new Date(training.date),
        end: new Date(training.date),
        trainingId: training.trainingId,
        location: training.location,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching trainings:', error);
    }
  };

  useEffect(() => {
    fetchTrainingData(currentDate);
  }, [currentDate]);

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleAddTraining = async () => {
    try {
      if (!ageGroup || !division) {
        console.error('Age group or division is null');
        return;
      }

      const updatedTraining = {
        ...newTraining,
        ageGroup,
        division,
        trainingId: '', // Generate or assign a unique ID here
      };

      await addTraining(updatedTraining);
      alert('Training session added successfully!');
      fetchTrainingData(currentDate);
      setOpenAddDialog(false);
    } catch (error) {
      console.error('Error adding training session:', error);
    }
  };

  return (
    <Layout>
      <Header />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Training Schedule
        </Typography>
        <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpenAddDialog(true)}>
          Add Training
        </Button>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          onNavigate={handleNavigate}
        />

        <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
          <DialogContent>
            <TextField
              placeholder="Select Date and Time"
              type="datetime-local"
              fullWidth
              sx={{ mb: 2 }}
              value={newTraining.date}
              onChange={(e) => setNewTraining({ ...newTraining, date: e.target.value })}
            />

            <TextField
              placeholder="Enter Location"
              fullWidth
              sx={{ mb: 2 }}
              value={newTraining.location}
              onChange={(e) => setNewTraining({ ...newTraining, location: e.target.value })}
            />

            <TextField
              placeholder="Additional Notes"
              fullWidth
              value={newTraining.notes}
              onChange={(e) => setNewTraining({ ...newTraining, notes: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddTraining} variant="contained">
              Add
            </Button>
            <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
