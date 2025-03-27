import { useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Layout from '../../components/Layout';
import { fetchTrainingsByMonth, addTraining } from '../../services/schedule_management';
import { Box, Button, Typography, Dialog, DialogContent, DialogActions, TextField, 
  Stack, DialogTitle } from '@mui/material';
import { SportsSoccer, Add } from '@mui/icons-material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

// Styled Components - Same as Match Calendar
const CalendarContainer = styled(Box)(({ theme }) => ({
  '& .rbc-calendar': {
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(12px)',
    borderRadius: 12,
    padding: theme.spacing(2),
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    minHeight: 600,
  },
  '& .rbc-event': {
    backgroundColor: theme.palette.primary.main,
    borderRadius: 4,
  },
  '& .rbc-today': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

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
  notes?: string;
}

export default function TrainingCalendar() {
  const theme = useTheme();
  const { clubName, ageGroup, division, loading: authLoading, role } = useAuth();
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTraining, setNewTraining] = useState({ 
    date: '', 
    location: '', 
    notes: '', 
    createdBy: '',
    ageGroup: '',
    division: ''
  });
  const navigate = useNavigate();

  const isCoach = role === 'coach';

  const fetchTrainingData = useCallback(async (baseDate: Date) => {
    if (authLoading) return;

    if (!clubName || !ageGroup || !division) {
      setError('Age group or division is missing.');
      setLoading(false);
      return;
    }
    try {
      const months = [
        format(addMonths(baseDate, -1), 'yyyy-MM'),
        format(baseDate, 'yyyy-MM'),
        format(addMonths(baseDate, 1), 'yyyy-MM'),
      ];

      const allTrainings = await Promise.all(
        months.map((month) => fetchTrainingsByMonth(month, clubName, ageGroup, division))
      );
      
      const formattedEvents = allTrainings.flat().map((training) => ({
        title: training.notes 
          ? `Training (${training.notes})` 
          : 'Training',
        start: new Date(training.date),
        end: new Date(training.date),
        trainingId: training.trainingId,
        location: training.location,
        notes: training.notes,
      }));
      setEvents(formattedEvents);
      setError(null);
    } catch (error) {
      console.error('Error fetching trainings:', error);
      setError('Failed to load trainings. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [authLoading, clubName, ageGroup, division]);

  useEffect(() => {
    if (!authLoading) {
      fetchTrainingData(currentDate);
    }
  }, [currentDate, fetchTrainingData, authLoading]);

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
        trainingId: new Date().toISOString(), // Generate a unique ID
      };

      if (clubName && ageGroup && division) {
        await addTraining(updatedTraining, clubName, ageGroup, division);
      } else {
        console.error('Club name, age group, or division is null');
      }
      alert('Training session added successfully!');
      fetchTrainingData(currentDate);
      setOpenAddDialog(false);
      setNewTraining({ date: '', location: '', notes: '', createdBy: '', ageGroup: '', division: '' });
    } catch (error) {
      console.error('Error adding training session:', error);
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
      <Box sx={{ 
        px: { xs: 2, md: 4 }, 
        py: 3,
        maxWidth: 1400,
        mx: 'auto'
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <SportsSoccer sx={{ 
              fontSize: 40,
              color: 'primary.main',
              p: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: '50%'
            }} />
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Training Schedule
              </Typography>
            </Box>
          </Stack>

          {isCoach && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenAddDialog(true)}
              sx={{ borderRadius: 2 }}
            >
              Add Training
            </Button>
          )}
        </Stack>

        <CalendarContainer>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onNavigate={handleNavigate}
            onSelectEvent={(event: TrainingEvent) =>
              navigate(`/schedule/training/${event.trainingId}`, { state: { training: event } })
            }
            
            components={{
              event: ({ event }) => (
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {event.title}
                  </Typography>
                  <Typography variant="caption">
                    {format(event.start, 'h:mm a')}
                    {event.location && ` • ${event.location}`}
                  </Typography>
                </Box>
              ),
            }}
          />
        </CalendarContainer>

        {/* Add Training Dialog */}
        <Dialog 
          open={openAddDialog} 
          onClose={() => setOpenAddDialog(false)}
          maxWidth="sm"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: 4,
                bgcolor: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(12px)',
              },
            },
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            fontWeight: 600
          }}>
            Add New Training
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                type="datetime-local"
                fullWidth
                value={newTraining.date}
                onChange={(e) => setNewTraining({ ...newTraining, date: e.target.value })}
              />
              <TextField
                label="Location"
                fullWidth
                value={newTraining.location}
                onChange={(e) => setNewTraining({ ...newTraining, location: e.target.value })}
              />
              <TextField
                label="Notes"
                fullWidth
                value={newTraining.notes}
                onChange={(e) => setNewTraining({ ...newTraining, notes: e.target.value })}
              />
              <TextField
                label="Created By"
                fullWidth
                value={newTraining.createdBy}
                onChange={(e) => setNewTraining({ ...newTraining, createdBy: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleAddTraining}
              disabled={!newTraining.date || !newTraining.location}
            >
              Add Training
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}