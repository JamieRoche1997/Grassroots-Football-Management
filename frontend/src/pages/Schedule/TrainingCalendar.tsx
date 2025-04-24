import { useCallback } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addMonths, isBefore } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import {
  fetchTrainingsByMonth,
  addTraining,
} from "../../services/schedule_management";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  DialogTitle,
  Alert,
  Snackbar,
  FormHelperText,
  CircularProgress,
  Backdrop,
  Tooltip,
  IconButton,
} from "@mui/material";
import { SportsSoccer, Add, Close } from "@mui/icons-material";
import { styled, alpha, useTheme } from "@mui/material/styles";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";

// Styled Components
const CalendarContainer = styled(Box)(({ theme }) => ({
  "& .rbc-calendar": {
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: "blur(12px)",
    borderRadius: 12,
    padding: theme.spacing(2),
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    minHeight: 600,
  },
  "& .rbc-event": {
    backgroundColor: theme.palette.primary.main,
    borderRadius: 4,
  },
  "& .rbc-today": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

const locales = { "en-US": enUS };
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

interface FormErrors {
  date?: string;
  location?: string;
  createdBy?: string;
}

export default function TrainingCalendar() {
  const theme = useTheme();
  const {
    clubName,
    ageGroup,
    division,
    loading: authLoading,
    role,
  } = useAuth();
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });
  const [newTraining, setNewTraining] = useState({
    date: "",
    location: "",
    notes: "",
    createdBy: "",
    ageGroup: "",
    division: "",
  });
  const [hasFormChanges, setHasFormChanges] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const navigate = useNavigate();

  const isCoach = role === "coach";

  const fetchTrainingData = useCallback(
    async (baseDate: Date) => {
      if (authLoading) return;

      if (!clubName || !ageGroup || !division) {
        setError("Missing required team information. Please check your profile settings.");
        setLoading(false);
        return;
      }
      try {
        const months = [
          format(addMonths(baseDate, -1), "yyyy-MM"),
          format(baseDate, "yyyy-MM"),
          format(addMonths(baseDate, 1), "yyyy-MM"),
        ];

        const allTrainings = await Promise.all(
          months.map((month) =>
            fetchTrainingsByMonth(month, clubName, ageGroup, division)
          )
        );

        const formattedEvents = allTrainings.flat().map((training) => ({
          title: training.notes ? `Training (${training.notes})` : "Training",
          start: new Date(training.date),
          end: new Date(training.date),
          trainingId: training.trainingId,
          location: training.location,
          notes: training.notes,
        }));
        setEvents(formattedEvents);
        setError(null);
      } catch (error) {
        console.error("Error fetching trainings:", error);
        setError("Failed to load trainings. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
    [authLoading, clubName, ageGroup, division]
  );

  useEffect(() => {
    if (!authLoading) {
      fetchTrainingData(currentDate);
    }
  }, [currentDate, fetchTrainingData, authLoading]);

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!newTraining.date) {
      errors.date = "Date and time are required";
      isValid = false;
    } else {
      const selectedDate = new Date(newTraining.date);
      if (isBefore(selectedDate, new Date())) {
        errors.date = "Cannot schedule training in the past";
        isValid = false;
      }
    }

    if (!newTraining.location.trim()) {
      errors.location = "Location is required";
      isValid = false;
    }

    if (!newTraining.createdBy.trim()) {
      errors.createdBy = "Creator name is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleFieldChange = (field: string, value: string) => {
    setNewTraining({ ...newTraining, [field]: value });
    setHasFormChanges(true);
    
    // Clear specific field error when user types
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors({
        ...formErrors,
        [field]: undefined,
      });
    }
  };

  const handleAddTraining = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      if (!ageGroup || !division || !clubName) {
        setSnackbar({
          open: true,
          message: "Missing team information. Please check your profile settings.",
          severity: "error",
        });
        return;
      }

      const updatedTraining = {
        ...newTraining,
        ageGroup,
        division,
        trainingId: new Date().toISOString(), // Generate a unique ID
      };

      await addTraining(updatedTraining, clubName, ageGroup, division);
      
      setSnackbar({
        open: true,
        message: "Training session added successfully!",
        severity: "success",
      });
      
      fetchTrainingData(currentDate);
      resetForm();
    } catch (error) {
      console.error("Error adding training session:", error);
      setSnackbar({
        open: true,
        message: "Failed to add training. Please try again.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setOpenAddDialog(false);
    setNewTraining({
      date: "",
      location: "",
      notes: "",
      createdBy: "",
      ageGroup: "",
      division: "",
    });
    setFormErrors({});
    setHasFormChanges(false);
  };

  const handleDialogClose = () => {
    if (hasFormChanges) {
      setConfirmClose(true);
    } else {
      resetForm();
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <Header />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 200,
          }}
        >
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
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => fetchTrainingData(currentDate)}>
            Try Again
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 3,
          maxWidth: 1400,
          mx: "auto",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <SportsSoccer
              sx={{
                fontSize: 40,
                color: "primary.main",
                p: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: "50%",
              }}
            />
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
              navigate(`/schedule/training/${event.trainingId}`, {
                state: { training: event },
              })
            }
            components={{
              event: ({ event }) => (
                <Tooltip title={`${event.location}${event.notes ? ` - ${event.notes}` : ""}`}>
                  <Box sx={{ p: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {event.title}
                    </Typography>
                    <Typography variant="caption">
                      {format(event.start, "h:mm a")}
                      {event.location && ` • ${event.location}`}
                    </Typography>
                  </Box>
                </Tooltip>
              ),
            }}
          />
        </CalendarContainer>

        {/* Add Training Dialog */}
        <Dialog
          open={openAddDialog}
          onClose={handleDialogClose}
          maxWidth="sm"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: 4,
                bgcolor: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: "blur(12px)",
              },
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 600,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Add New Training
            <IconButton 
              size="small" 
              onClick={handleDialogClose}
              sx={{ color: "white" }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                  Date and Time *
                </Typography>
                <TextField
                  type="datetime-local"
                  fullWidth
                  value={newTraining.date}
                  onChange={(e) => handleFieldChange("date", e.target.value)}
                  error={!!formErrors.date}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                {formErrors.date && (
                  <FormHelperText error>{formErrors.date}</FormHelperText>
                )}
              </Box>
              
              <TextField
                label="Location *"
                fullWidth
                value={newTraining.location}
                onChange={(e) => handleFieldChange("location", e.target.value)}
                error={!!formErrors.location}
                helperText={formErrors.location}
                size="small"
              />
              
              <TextField
                label="Notes"
                fullWidth
                value={newTraining.notes}
                onChange={(e) => handleFieldChange("notes", e.target.value)}
                size="small"
                multiline
                rows={2}
                placeholder="Optional details about this training session"
              />
              
              <TextField
                label="Created By *"
                fullWidth
                value={newTraining.createdBy}
                onChange={(e) => handleFieldChange("createdBy", e.target.value)}
                error={!!formErrors.createdBy}
                helperText={formErrors.createdBy}
                size="small"
              />
              
              <Typography variant="caption" color="text.secondary">
                * Required fields
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleAddTraining}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {submitting ? "Adding..." : "Add Training"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Close Dialog */}
        <Dialog
          open={confirmClose}
          onClose={() => setConfirmClose(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Discard changes?</DialogTitle>
          <DialogContent>
            <Typography>
              You have unsaved changes. Are you sure you want to discard them?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmClose(false)}>
              Continue Editing
            </Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={() => {
                setConfirmClose(false);
                resetForm();
              }}
            >
              Discard Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        
        {/* Loading Backdrop */}
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={submitting}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Box>
    </Layout>
  );
}
