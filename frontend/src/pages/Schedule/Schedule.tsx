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
  IconButton,
  Tooltip,
  Fade,
  Skeleton,
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
  Refresh,
  ErrorOutline,
} from "@mui/icons-material";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import {
  fetchFixturesByMonth,
  fetchTrainingsByMonth,
} from "../../services/schedule_management";
import { format, isBefore, parseISO, isValid } from "date-fns";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

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

const ClickableGlassCard = styled(GlassCard)(({ theme }) => ({
  cursor: 'pointer !important',
  position: 'relative',
  overflow: 'hidden',
  userSelect: 'none',
  WebkitTapHighlightColor: 'transparent',
  transition: 'all 0.25s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[10],
  },
  '&:active': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `linear-gradient(45deg, transparent, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s',
  },
  '&:hover::after': {
    transform: 'translateX(100%)',
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
  matchId?: string;
  trainingId?: string;
}

// Define match and training types to help with TypeScript
interface Match {
  date: string;
  homeTeam?: string;
  awayTeam?: string;
  details?: string;
  location?: string;
  matchId?: string;
}

interface Training {
  date: string;
  notes?: string;
  location?: string;
  trainingId?: string;
}

export default function ScheduleOverview() {
  const theme = useTheme();
  const { clubName, ageGroup, division, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchingError, setFetchingError] = useState<{
    fixtures?: string;
    trainings?: string;
  }>({});
  const [refreshing, setRefreshing] = useState(false);
  const todayRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const fetchScheduleData = async (showRefreshing = false) => {
    if (authLoading) return;

    if (!clubName || !ageGroup || !division) {
      setError("Club information is incomplete. Please update your profile settings.");
      setLoading(false);
      return;
    }

    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setFetchingError({});
    
    try {
      const currentYear = new Date().getFullYear();
      const allMonths = Array.from({ length: 12 }, (_, i) =>
        format(new Date(currentYear, i, 1), "yyyy-MM")
      );

      let fixturesError: string | undefined = undefined;
      let trainingsError: string | undefined = undefined;
      
      // Fetch fixtures with error handling
      let matches: Match[] = [];
      try {
        matches = (await Promise.all(
          allMonths.map((month) =>
            fetchFixturesByMonth(month, clubName, ageGroup, division)
          )
        )).flat();
      } catch (error) {
        console.error("Error fetching fixtures:", error);
        fixturesError = "Failed to load matches.";
        setFetchingError(prev => ({ ...prev, fixtures: fixturesError }));
      }
      
      // Fetch trainings with error handling
      let trainings: Training[] = [];
      try {
        trainings = (await Promise.all(
          allMonths.map((month) =>
            fetchTrainingsByMonth(month, clubName, ageGroup, division)
          )
        )).flat();
      } catch (error) {
        console.error("Error fetching trainings:", error);
        trainingsError = "Failed to load training sessions.";
        setFetchingError(prev => ({ ...prev, trainings: trainingsError }));
      }

      // Only set overall error if both fetches failed
      if (fixturesError && trainingsError) {
        setError("Failed to load schedule. Please try again.");
        setEvents([]);
      } else {
        // Process valid fixtures
        const matchEvents: Event[] = matches.map((match) => {
          // Validate date
          const parsedDate = parseISO(match.date);
          const validDate = isValid(parsedDate) ? match.date : format(new Date(), "yyyy-MM-dd");
          
          console.log('Processing match:', match);
          
          return {
            title: match.homeTeam && match.awayTeam ? 
              `${match.homeTeam} vs ${match.awayTeam}` : 
              "Scheduled Match",
            date: validDate,
            type: "match",
            details: "Match details not provided", // Default value for details
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            location: match.location || match.homeTeam,
            matchId: match.matchId, // Using matchId from the API response
          };
        });

        // Process valid trainings
        const trainingEvents: Event[] = trainings.map((training) => {
          // Validate date
          const parsedDate = parseISO(training.date);
          const validDate = isValid(parsedDate) ? training.date : format(new Date(), "yyyy-MM-dd");
          
          console.log('Processing training:', training);
          
          return {
            title: "Team Training",
            date: validDate,
            type: "training",
            details: training.notes || "Regular team training session",
            location: training.location || "Team Ground",
            trainingId: training.trainingId, // Using trainingId from the API response
          };
        });

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
      }
    } catch (error) {
      console.error("Error in schedule data processing:", error);
      setError("There was a problem processing the schedule data.");
      setEvents([]);
    } finally {
      setLoading(false);
      if (showRefreshing) {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    if (!authLoading) fetchScheduleData();
  }, [authLoading, clubName, ageGroup, division]);

  useEffect(() => {
    if (!loading && todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [events, loading]);

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

  const getEventColor = (type: string): "primary" | "success" | "warning" | "secondary" => {
    switch (type) {
      case "match":
        return "primary";
      case "training":
        return "success";
      case "today":
        return "warning";
      default:
        return "secondary";
    }
  };

  const handleRefresh = () => {
    fetchScheduleData(true);
  };

  // Handle click on event card
  const handleEventClick = (event: Event) => {
    console.log('Event clicked:', event);
    
    if (event.type === "match" && event.matchId) {
      console.log(`Navigating to match: /schedule/matches/${event.matchId}`);
      navigate(`/schedule/matches/${event.matchId}`, {
        state: { 
          match: {
            matchId: event.matchId,
            homeTeam: event.homeTeam,
            awayTeam: event.awayTeam,
            start: event.date
          } 
        }
      });
    } else if (event.type === "training" && event.trainingId) {
      console.log(`Navigating to training: /schedule/training/${event.trainingId}`);
      navigate(`/schedule/training/${event.trainingId}`, {
        state: { 
          training: {
            trainingId: event.trainingId,
            location: event.location || "Team Ground",
            start: event.date,
            notes: event.details
          } 
        }
      });
    } else {
      console.log('No navigation - missing ID', { 
        type: event.type, 
        matchId: event.matchId,
        trainingId: event.trainingId
      });
    }
  };

  if (authLoading) {
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
        <Stack 
          direction="row" 
          spacing={2} 
          alignItems="center" 
          justifyContent="space-between" 
          sx={{ mb: 4 }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <CalendarMonth
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
                Schedule Overview
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {clubName} • {ageGroup} • {division}
              </Typography>
            </Box>
          </Stack>
          
          <Tooltip title="Refresh schedule">
            <span>
              <IconButton 
                onClick={handleRefresh} 
                disabled={refreshing || loading}
                color="primary"
              >
                <Refresh />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {Object.entries(fetchingError).length > 0 && (
          <Stack spacing={1} sx={{ mb: 3 }}>
            {fetchingError.fixtures && (
              <Alert severity="warning" 
                sx={{ display: 'flex', alignItems: 'center' }}
                action={
                  <IconButton 
                    size="small" 
                    onClick={handleRefresh}
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                }
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <ErrorOutline fontSize="small" />
                  <Typography variant="body2">
                    {fetchingError.fixtures}
                  </Typography>
                </Stack>
              </Alert>
            )}
            {fetchingError.trainings && (
              <Alert severity="warning"
                sx={{ display: 'flex', alignItems: 'center' }}
                action={
                  <IconButton 
                    size="small" 
                    onClick={handleRefresh}
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                }
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <ErrorOutline fontSize="small" />
                  <Typography variant="body2">
                    {fetchingError.trainings}
                  </Typography>
                </Stack>
              </Alert>
            )}
          </Stack>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <IconButton 
                size="small" 
                onClick={handleRefresh}
              >
                <Refresh fontSize="small" />
              </IconButton>
            }
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Fade in={loading}>
            <Stack spacing={3}>
              {[1, 2, 3, 4].map((i) => (
                <Stack key={i} direction="row" spacing={2}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton 
                    variant="rounded" 
                    width="100%" 
                    height={160} 
                    sx={{ borderRadius: 3 }} 
                  />
                </Stack>
              ))}
            </Stack>
          </Fade>
        ) : events.length === 0 ? (
          <Alert 
            severity="info" 
            sx={{ mb: 3 }}
            action={
              <IconButton 
                size="small" 
                onClick={handleRefresh}
              >
                <Refresh fontSize="small" />
              </IconButton>
            }
          >
            No scheduled events found for this season.
          </Alert>
        ) : (
          <Timeline position="alternate" sx={{ p: 0 }}>
            {events.map((event, index) => {
              // Validate the date string before parsing
              const eventDate = isValid(parseISO(event.date)) 
                ? parseISO(event.date) 
                : new Date();
                
              const isTodayEvent = event.type === "today";
              const isPastEvent =
                isBefore(eventDate, new Date()) && !isTodayEvent;
              
              const isClickable = !isTodayEvent && (
                (event.type === "match" && event.matchId) || 
                (event.type === "training" && event.trainingId)
              );

              console.log('Event is clickable?', isClickable, event);

              const CardComponent = isClickable ? ClickableGlassCard : GlassCard;

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
                    <CardComponent 
                      sx={{ 
                        opacity: isPastEvent ? 0.8 : 1,
                        ...(isTodayEvent && {
                          border: `2px solid ${theme.palette.primary.main}`,
                          boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.3)}`
                        }),
                        ...(isClickable && {
                          cursor: 'pointer !important',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: theme.shadows[8],
                          },
                        })
                      }}
                      onClick={() => {
                        console.log('Card clicked', isClickable, event);
                        if (isClickable) {
                          handleEventClick(event);
                        }
                      }}
                    >
                      <CardContent>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography 
                            variant="h6" 
                            fontWeight={600}
                            color={isPastEvent ? "text.secondary" : "text.primary"}
                          >
                            {event.title}
                            {isClickable && (
                              <Typography 
                                component="span" 
                                variant="caption" 
                                sx={{ 
                                  ml: 1, 
                                  color: 'primary.main',
                                  display: { xs: 'none', sm: 'inline' }
                                }}
                              >
                                • Click for details
                              </Typography>
                            )}
                          </Typography>
                          <Chip
                            label={event.type.toUpperCase()}
                            size="small"
                            color={getEventColor(event.type)}
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
                            <Typography 
                              variant="h6" 
                              fontWeight={700}
                              color={isPastEvent ? "text.secondary" : "text.primary"}
                            >
                              {event.homeTeam}
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ color: "text.secondary" }}
                            >
                              vs
                            </Typography>
                            <Typography 
                              variant="h6" 
                              fontWeight={700}
                              color={isPastEvent ? "text.secondary" : "text.primary"}
                            >
                              {event.awayTeam}
                            </Typography>
                          </Stack>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Typography 
                          variant="body2"
                          color={isPastEvent ? "text.secondary" : "text.primary"}
                        >
                          {event.details}
                        </Typography>
                      </CardContent>
                    </CardComponent>
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
