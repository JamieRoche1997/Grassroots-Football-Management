import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
  Skeleton,
  useTheme,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircleOutline as AvailableIcon,
  CancelOutlined as UnavailableIcon,
  CalendarToday as DateIcon,
  SportsSoccer as TeamIcon,
  ArrowBack as BackIcon,
} from "@mui/icons-material";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import { useAuth } from "../../hooks/useAuth";
import {
  fetchFixtureAvailability,
  updateFixtureAvailability,
} from "../../services/schedule_management";

interface Match {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  start: Date | string;
}

interface AvailabilityEntry {
  email: string;
  available: boolean;
  avatar?: string;
}

interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

export default function MatchDetails() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user, clubName, ageGroup, division } = useAuth();
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const match = location.state?.match as Match | undefined;
  const theme = useTheme();
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    message: "",
    severity: "info",
  });

  const loadAvailability = useCallback(async () => {
    if (!matchId) {
      setAlert({
        open: true,
        message: "Missing match ID",
        severity: "error",
      });
      return;
    }
    
    if (!clubName || !ageGroup || !division) {
      setAlert({
        open: true,
        message: "Missing team information",
        severity: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchFixtureAvailability(
        matchId,
        clubName,
        ageGroup,
        division
      );
      setAvailability(data);
    } catch (err) {
      console.error("Failed to load availability:", err);
      setAlert({
        open: true,
        message: "Failed to load availability. Please try again.",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [matchId, clubName, ageGroup, division]);

  const handleRSVP = async (isAvailable: boolean) => {
    if (!user?.email) {
      setAlert({
        open: true,
        message: "You must be logged in to update your availability",
        severity: "error",
      });
      return;
    }
    
    if (!matchId || !clubName || !ageGroup || !division) {
      setAlert({
        open: true,
        message: "Missing required information to update availability",
        severity: "error",
      });
      return;
    }

    // Prevent duplicate submissions
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateFixtureAvailability(
        matchId,
        user.email,
        clubName,
        ageGroup,
        division,
        isAvailable
      );
      await loadAvailability();
      setAlert({
        open: true,
        message: `You are now marked as ${isAvailable ? "available" : "unavailable"} for this match`,
        severity: "success",
      });
    } catch (err) {
      console.error("Failed to update RSVP:", err);
      setAlert({
        open: true,
        message: "Failed to update your availability. Please try again.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Show warning only on initial load if match data is missing
    if (!match) {
      setAlert({
        open: true,
        message: "Match details not found",
        severity: "warning",
      });
    }
    
    // Only load availability data once on component mount
    loadAvailability();
  }, [loadAvailability, match]);

  const availablePlayers = availability.filter((a) => a.available);
  const unavailablePlayers = availability.filter((a) => !a.available);
  
  const handleAlertClose = () => {
    setAlert({...alert, open: false});
  };

  const goBack = () => {
    navigate(-1);
  };

  const renderPlayerList = (
    players: AvailabilityEntry[],
    emptyMessage: string
  ) => {
    if (isLoading) {
      return Array(3)
        .fill(0)
        .map((_, idx) => (
          <Skeleton key={idx} variant="text" width="60%" sx={{ my: 0.5 }} />
        ));
    }

    return players.length > 0 ? (
      players.map((player) => (
        <Box key={player.email} display="flex" alignItems="center" py={1}>
          <Avatar src={player.avatar} sx={{ width: 32, height: 32, mr: 2 }}>
            {player.email.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body1">{player.email}</Typography>
        </Box>
      ))
    ) : (
      <Typography variant="body2" color="text.secondary">
        {emptyMessage}
      </Typography>
    );
  };

  return (
    <Layout>
      <Header />

      <Box
        sx={{
          maxWidth: 1000,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: 4,
        }}
      >
        <Button 
          startIcon={<BackIcon />} 
          onClick={goBack} 
          sx={{ mb: 2 }}
        >
          Back to Schedule
        </Button>

        {!match && !isLoading && (
          <Alert severity="warning" sx={{ mb: 4 }}>
            Match details are not available. This may happen if you accessed this page directly.
          </Alert>
        )}

        {/* Match Details Section */}
        {match && (
          <Card sx={{ mb: 4, boxShadow: theme.shadows[3] }}>
            <CardContent>
              <Typography
                variant="h5"
                fontWeight={600}
                gutterBottom
                display="flex"
                alignItems="center"
              >
                <DateIcon color="primary" sx={{ mr: 1 }} />
                Match Details
              </Typography>

              <Stack spacing={1.5} mt={2}>
                <Box display="flex" alignItems="center">
                  <Chip
                    label={new Date(match.start).toLocaleString(undefined, {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                    icon={<DateIcon fontSize="small" />}
                    variant="outlined"
                    sx={{ mr: 2 }}
                  />
                </Box>

                <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
                  <Chip
                    label={`Home: ${match.homeTeam}`}
                    icon={<TeamIcon fontSize="small" />}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`Away: ${match.awayTeam}`}
                    icon={<TeamIcon fontSize="small" />}
                    color="secondary"
                    variant="outlined"
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* RSVP Actions */}
        <Typography variant="h6" fontWeight={600} mb={2}>
          Mark Your Availability
        </Typography>

        <Stack direction="row" spacing={2} mb={4}>
          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={isSubmitting ? <CircularProgress size={24} color="inherit" /> : <AvailableIcon />}
            onClick={() => handleRSVP(true)}
            disabled={isSubmitting || isLoading || !user?.email}
            sx={{
              flex: 1,
              py: 1.5,
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            {isSubmitting ? "Updating..." : "I'm Available"}
          </Button>
          <Button
            variant="contained"
            color="error"
            size="large"
            startIcon={isSubmitting ? <CircularProgress size={24} color="inherit" /> : <UnavailableIcon />}
            onClick={() => handleRSVP(false)}
            disabled={isSubmitting || isLoading || !user?.email}
            sx={{
              flex: 1,
              py: 1.5,
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            {isSubmitting ? "Updating..." : "Not Available"}
          </Button>
        </Stack>

        {!user?.email && (
          <Alert severity="info" sx={{ mb: 4 }}>
            You must be logged in to update your availability.
          </Alert>
        )}

        {/* Availability Lists */}
        <Box display="grid" gridTemplateColumns={{ md: "1fr 1fr" }} gap={4}>
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                display="flex"
                alignItems="center"
                color="success.main"
              >
                <AvailableIcon color="success" sx={{ mr: 1 }} />
                Available Players ({availablePlayers.length})
              </Typography>

              <Divider sx={{ my: 2 }} />

              {renderPlayerList(availablePlayers, "No players available yet.")}
            </CardContent>
          </Card>

          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                display="flex"
                alignItems="center"
                color="error.main"
              >
                <UnavailableIcon color="error" sx={{ mr: 1 }} />
                Unavailable Players ({unavailablePlayers.length})
              </Typography>

              <Divider sx={{ my: 2 }} />

              {renderPlayerList(
                unavailablePlayers,
                "No players marked as unavailable."
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      {/* Feedback Snackbar */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleAlertClose} 
          severity={alert.severity} 
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
