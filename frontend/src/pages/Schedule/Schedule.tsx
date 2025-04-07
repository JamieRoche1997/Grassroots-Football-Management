import { useEffect, useState, useRef } from "react";
import { alpha, styled, useTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  Alert,
  Stack,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import {
  SportsSoccer,
  FitnessCenter,
  Today,
  CalendarMonth,
  LocationOn,
  Info,
} from "@mui/icons-material";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import {
  fetchFixturesByMonth,
  fetchTrainingsByMonth,
} from "../../services/schedule_management";
import { format, isBefore, parseISO } from "date-fns";
import { useAuth } from "../../hooks/useAuth";

// Styled Components
const GlassCard = styled(Card)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: "blur(12px)",
  border: "1px solid",
  borderColor: alpha(theme.palette.divider, 0.1),
  borderRadius: 12,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[6],
  },
}));

const EventDot = styled(TimelineDot)({
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

interface Event {
  title: string;
  date: string;
  type: "match" | "training" | "today";
  details: string;
  location?: string;
  homeTeam?: string;
  awayTeam?: string;
}

export default function ScheduleOverview() {
  const theme = useTheme();
  const { clubName, ageGroup, division, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const todayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchScheduleData = async () => {
      if (authLoading) return;

      if (!clubName || !ageGroup || !division) {
        setError("Club information is incomplete.");
        setLoading(false);
        return;
      }

      try {
        const currentYear = new Date().getFullYear();
        const allMonths = Array.from({ length: 12 }, (_, i) =>
          format(new Date(currentYear, i, 1), "yyyy-MM")
        );

        const [matches, trainings] = await Promise.all([
          Promise.all(
            allMonths.map((month) =>
              fetchFixturesByMonth(month, clubName, ageGroup, division)
            )
          ),
          Promise.all(
            allMonths.map((month) =>
              fetchTrainingsByMonth(month, clubName, ageGroup, division)
            )
          ),
        ]);

        const matchEvents: Event[] = matches.flat().map((match) => ({
          title: `${match.homeTeam} vs ${match.awayTeam}`,
          date: match.date,
          type: "match",
          details: "Match details",
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
        }));

        const trainingEvents: Event[] = trainings.flat().map((training) => ({
          title: "Team Training",
          date: training.date,
          type: "training",
          details: training.notes || "Regular team training session",
          location: training.location,
        }));

        const combinedEvents = [...matchEvents, ...trainingEvents].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const todayDate = format(new Date(), "yyyy-MM-dd");
        const todayEvent: Event = {
          title: "Today",
          date: todayDate,
          type: "today",
          details: "Current date marker",
        };

        let todayIndex = combinedEvents.findIndex((event) =>
          isBefore(new Date(todayDate), new Date(event.date))
        );
        if (todayIndex === -1) todayIndex = combinedEvents.length;

        combinedEvents.splice(todayIndex, 0, todayEvent);
        setEvents(combinedEvents);
        setError(null);
      } catch (error) {
        console.error("Error fetching schedule:", error);
        setError("Failed to load schedule. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) fetchScheduleData();
  }, [authLoading, clubName, ageGroup, division]);

  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [events]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "match":
        return <SportsSoccer />;
      case "training":
        return <FitnessCenter />;
      case "today":
        return <Today />;
      default:
        return <Info />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "match":
        return "primary";
      case "training":
        return "success";
      case "today":
        return "warning";
      default:
        return "grey";
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
            height: "60vh",
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Header />
        <Alert severity="error" sx={{ m: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
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
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <CalendarMonth
            sx={{
              fontSize: 40,
              color: "primary.main",
              p: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: "50%",
            }}
          />
          <Typography variant="h4" fontWeight={700}>
            Schedule Overview
            <Typography variant="subtitle1" color="text.secondary">
              {clubName} • {ageGroup} • {division}
            </Typography>
          </Typography>
        </Stack>

        {events.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No scheduled events found for this season.
          </Alert>
        ) : (
          <Timeline position="alternate" sx={{ p: 0 }}>
            {events.map((event, index) => {
              const eventDate = parseISO(event.date);
              const isTodayEvent = event.type === "today";
              const isPastEvent =
                isBefore(eventDate, new Date()) && !isTodayEvent;

              return (
                <TimelineItem key={index} ref={isTodayEvent ? todayRef : null}>
                  <TimelineSeparator>
                    <EventDot
                      color={getEventColor(event.type)}
                      variant={isPastEvent ? "outlined" : "filled"}
                    >
                      {getEventIcon(event.type)}
                    </EventDot>
                    {index !== events.length - 1 && (
                      <TimelineConnector
                        sx={{
                          bgcolor: isPastEvent
                            ? "action.disabledBackground"
                            : "primary.main",
                          opacity: isPastEvent ? 0.5 : 1,
                        }}
                      />
                    )}
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: 2 }}>
                    <GlassCard sx={{ opacity: isPastEvent ? 0.8 : 1 }}>
                      <CardContent>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="h6" fontWeight={600}>
                            {event.title}
                          </Typography>
                          <Chip
                            label={event.type.toUpperCase()}
                            size="small"
                            variant={isPastEvent ? "outlined" : "filled"}
                          />
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mt: 1, mb: 2 }}
                        >
                          <CalendarMonth fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {format(eventDate, "MMMM d, yyyy • h:mm a")}
                          </Typography>
                        </Stack>

                        {event.location && (
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mb: 1 }}
                          >
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="body2">
                              {event.location}
                            </Typography>
                          </Stack>
                        )}

                        {event.homeTeam && event.awayTeam && (
                          <Stack
                            direction="row"
                            spacing={2}
                            justifyContent="center"
                            sx={{ my: 2 }}
                          >
                            <Typography variant="h6" fontWeight={700}>
                              {event.homeTeam}
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ color: "text.secondary" }}
                            >
                              vs
                            </Typography>
                            <Typography variant="h6" fontWeight={700}>
                              {event.awayTeam}
                            </Typography>
                          </Stack>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="body2">{event.details}</Typography>
                      </CardContent>
                    </GlassCard>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        )}
      </Box>
    </Layout>
  );
}
