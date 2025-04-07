import { useCallback } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
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
  const [error, setError] = useState<string | null>(null);
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
    async (month: Date) => {
      if (authLoading) return;

      if (!clubName || !ageGroup || !division) {
        setError("Age group or division is missing.");
        setLoading(false);
        return;
      }
      try {
        const formattedMonth = format(month, "yyyy-MM");
        const matches = await fetchFixturesByMonth(
          formattedMonth,
          clubName,
          ageGroup,
          division
        );
        console.log("matches:", matches);
        const formattedEvents = matches.map((match) => ({
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
        console.error("Age group or division is null");
        return;
      }

      const updatedFixture = {
        ...newFixture,
        ageGroup,
        division,
      };

      if (clubName && ageGroup && division) {
        await addFixture(
          { ...updatedFixture, matchId: new Date().toISOString() },
          clubName,
          ageGroup,
          division
        );
      } else {
        console.error("Club name, age group, or division is null");
      }
      alert("Fixture added successfully!");
      fetchMatchData(currentDate);
      setOpenAddDialog(false);
    } catch (error) {
      console.error("Error adding fixture:", error);
    }
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
          <Typography color="error" variant="h6">
            {error}
          </Typography>
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
          onClose={() => setOpenAddDialog(false)}
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
              />
              <TextField
                label="Away Team"
                fullWidth
                value={newFixture.awayTeam}
                onChange={(e) =>
                  setNewFixture({ ...newFixture, awayTeam: e.target.value })
                }
              />
              <TextField
                type="datetime-local"
                fullWidth
                value={newFixture.date}
                onChange={(e) =>
                  setNewFixture({ ...newFixture, date: e.target.value })
                }
              />
              <TextField
                label="Created By"
                fullWidth
                value={newFixture.createdBy}
                onChange={(e) =>
                  setNewFixture({ ...newFixture, createdBy: e.target.value })
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleAddFixture}
              disabled={
                !newFixture.homeTeam || !newFixture.awayTeam || !newFixture.date
              }
            >
              Add Fixture
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
