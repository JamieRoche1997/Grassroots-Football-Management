import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
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
} from "@mui/material";
import {
  CheckCircleOutline as AvailableIcon,
  CancelOutlined as UnavailableIcon,
  CalendarToday as DateIcon,
  SportsSoccer as TeamIcon,
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

export default function MatchDetails() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user, clubName, ageGroup, division } = useAuth();
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const match = location.state?.match as Match | undefined;
  const theme = useTheme();

  const loadAvailability = useCallback(async () => {
    if (!matchId || !clubName || !ageGroup || !division) return;

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
    } finally {
      setIsLoading(false);
    }
  }, [matchId, clubName, ageGroup, division]);

  const handleRSVP = async (isAvailable: boolean) => {
    if (!user?.email || !matchId || !clubName || !ageGroup || !division) return;

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
    } catch (err) {
      console.error("Failed to update RSVP:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const availablePlayers = availability.filter((a) => a.available);
  const unavailablePlayers = availability.filter((a) => !a.available);

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
            startIcon={<AvailableIcon />}
            onClick={() => handleRSVP(true)}
            disabled={isSubmitting || isLoading}
            sx={{
              flex: 1,
              py: 1.5,
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            I'm Available
          </Button>
          <Button
            variant="contained"
            color="error"
            size="large"
            startIcon={<UnavailableIcon />}
            onClick={() => handleRSVP(false)}
            disabled={isSubmitting || isLoading}
            sx={{
              flex: 1,
              py: 1.5,
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            Not Available
          </Button>
        </Stack>

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
    </Layout>
  );
}
