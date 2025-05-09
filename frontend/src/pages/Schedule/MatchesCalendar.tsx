import { useCallback } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, parseISO, addMonths } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import {
  fetchFixturesByMonth,
  addFixture,
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
} from "@mui/material";
import { SportsSoccer, Add } from "@mui/icons-material";
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

interface MatchEvent {
  title: string;
  start: Date;
  end: Date;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  isHomeGame: boolean;
}

export default function MatchesCalendar() {
  const theme = useTheme();
  const {
    clubName,
    ageGroup,
    division,
    loading: authLoading,
    role,
  } = useAuth();
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date()); // Track the displayed month
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{
    homeTeam?: string;
    awayTeam?: string;
    date?: string;
    createdBy?: string;
  }>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [newFixture, setNewFixture] = useState({
    matchId: "",
    homeTeam: "",
    awayTeam: "",
    date: "",
    ageGroup: "",
    division: "",
    createdBy: "",
  });
  const navigate = useNavigate();

  const isCoach = role === "coach";

  const fetchMatchData = useCallback(
    async (baseDate: Date) => {
      if (authLoading) return;

      if (!clubName || !ageGroup || !division) {
        setError("Age group or division is missing. Please check your profile settings.");
        setLoading(false);
        return;
      }
      try {
        // Fetch data for previous, current, and next month
        const months = [
          format(addMonths(baseDate, -1), "yyyy-MM"),
          format(baseDate, "yyyy-MM"),
          format(addMonths(baseDate, 1), "yyyy-MM"),
        ];

        const allMatches = await Promise.all(
          months.map((month) =>
            fetchFixturesByMonth(month, clubName, ageGroup, division)
          )
        );

        const formattedEvents = allMatches.flat().map((match) => ({
          title:
            match.homeTeam === clubName
              ? `${match.awayTeam} (H)`
              : `${match.homeTeam} (A)`,
          start: new Date(match.date),
          end: new Date(match.date),
          matchId: match.matchId,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          isHomeGame: match.homeTeam === clubName,
        }));
        
        setEvents(formattedEvents);
        setError(null);
      } catch (error) {
        console.error("Error fetching matches:", error);
        setError("Failed to load matches. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
    [authLoading, clubName, ageGroup, division]
  );

  // Set loading to true only initially and when changing months
  useEffect(() => {
    if (!authLoading) {
      // Only set loading on initial load or explicit month changes
      // This prevents flashing during month navigation
      if (events.length === 0) {
        setLoading(true);
      }
      fetchMatchData(currentDate);
    }
  }, [currentDate, fetchMatchData, authLoading, events.length]);

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const validateForm = () => {
    const errors: {
      homeTeam?: string;
      awayTeam?: string;
      date?: string;
      createdBy?: string;
    } = {};
    let formIsValid = true;

    if (!newFixture.homeTeam.trim()) {
      errors.homeTeam = "Home team is required";
      formIsValid = false;
    }

    if (!newFixture.awayTeam.trim()) {
      errors.awayTeam = "Away team is required";
      formIsValid = false;
    } else if (newFixture.homeTeam === newFixture.awayTeam) {
      errors.awayTeam = "Home and away teams cannot be the same";
      formIsValid = false;
    }

    if (!newFixture.date) {
      errors.date = "Date and time are required";
      formIsValid = false;
    } else {
      const dateObj = parseISO(newFixture.date);
      if (dateObj.toString() === "Invalid Date") {
        errors.date = "Please provide a valid date";
        formIsValid = false;
      }
    }

    if (!newFixture.createdBy.trim()) {
      errors.createdBy = "Creator name is required";
      formIsValid = false;
    }

    setFormErrors(errors);
    return formIsValid;
  };

  const handleAddFixture = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      if (!ageGroup || !division) {
        setSnackbar({
          open: true,
          message: "Age group or division information is missing",
          severity: "error",
        });
        return;
      }

      const updatedFixture = {
        ...newFixture,
        ageGroup,
        division,
        matchId: new Date().toISOString(),
      };

      if (clubName && ageGroup && division) {
        await addFixture(
          updatedFixture,
          clubName,
          ageGroup,
          division
        );
        setSnackbar({
          open: true,
          message: "Fixture added successfully!",
          severity: "success",
        });
        fetchMatchData(currentDate);
        setOpenAddDialog(false);
        setNewFixture({
          matchId: "",
          homeTeam: "",
          awayTeam: "",
          date: "",
          ageGroup: "",
          division: "",
          createdBy: "",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Missing club information. Please check your profile.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error adding fixture:", error);
      setSnackbar({
        open: true,
        message: "Failed to add fixture. Please try again.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
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
          <Button 
            variant="outlined" 
            onClick={() => fetchMatchData(currentDate)}
            sx={{ mt: 2 }}
          >
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
                Match Schedule
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
              Add Fixture
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
            onSelectEvent={(event: MatchEvent) =>
              navigate(`/schedule/matches/${event.matchId}`, {
                state: { match: event },
              })
            }
            components={{
              event: ({ event }) => (
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {event.title}
                  </Typography>
                  <Typography variant="caption">
                    {format(event.start, "h:mm a")}
                  </Typography>
                </Box>
              ),
            }}
          />
        </CalendarContainer>

        {/* Add Fixture Dialog */}
        <Dialog
          open={openAddDialog}
          onClose={() => !submitting && setOpenAddDialog(false)}
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
            }}
          >
            Add New Fixture
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Home Team"
                fullWidth
                value={newFixture.homeTeam}
                onChange={(e) =>
                  setNewFixture({ ...newFixture, homeTeam: e.target.value })
                }
                error={!!formErrors.homeTeam}
                helperText={formErrors.homeTeam}
                disabled={submitting}
                required
              />
              <TextField
                label="Away Team"
                fullWidth
                value={newFixture.awayTeam}
                onChange={(e) =>
                  setNewFixture({ ...newFixture, awayTeam: e.target.value })
                }
                error={!!formErrors.awayTeam}
                helperText={formErrors.awayTeam}
                disabled={submitting}
                required
              />
              <TextField
                label="Match Date & Time"
                type="datetime-local"
                fullWidth
                value={newFixture.date}
                onChange={(e) =>
                  setNewFixture({ ...newFixture, date: e.target.value })
                }
                error={!!formErrors.date}
                helperText={formErrors.date}
                disabled={submitting}
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Created By"
                fullWidth
                value={newFixture.createdBy}
                onChange={(e) =>
                  setNewFixture({ ...newFixture, createdBy: e.target.value })
                }
                error={!!formErrors.createdBy}
                helperText={formErrors.createdBy}
                disabled={submitting}
                required
              />
              {!ageGroup || !division ? (
                <Alert severity="warning">
                  Age group or division information is missing. Please update your profile settings.
                </Alert>
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setOpenAddDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddFixture}
              disabled={submitting}
            >
              {submitting ? "Adding..." : "Add Fixture"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success/Error Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
}
