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
  Paper
} from "@mui/material";
import {
  CheckCircleOutline as AvailableIcon,
  CancelOutlined as UnavailableIcon,
  CalendarToday as DateIcon,
  LocationOn as LocationIcon,
  Notes as NotesIcon
} from "@mui/icons-material";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import { useAuth } from "../../hooks/useAuth";
import {
  fetchTrainingAvailability,
  updateTrainingAvailability,
} from "../../services/schedule_management";

interface Training {
  trainingId: string;
  location: string;
  start: Date | string;
  notes?: string;
}

interface AvailabilityEntry {
  email: string;
  available: boolean;
  avatar?: string;
}

export default function TrainingDetails() {
  const { trainingId } = useParams<{ trainingId: string }>();
  const { user, clubName, ageGroup, division } = useAuth();
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const training = location.state?.training as Training | undefined;
  const theme = useTheme();

  const loadAvailability = useCallback(async () => {
    if (!trainingId || !clubName || !ageGroup || !division) return;
    
    setIsLoading(true);
    try {
      const data = await fetchTrainingAvailability(
        trainingId,
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
  }, [trainingId, clubName, ageGroup, division]);

  const handleRSVP = async (isAvailable: boolean) => {
    if (!user?.email || !trainingId || !clubName || !ageGroup || !division) return;
    
    setIsSubmitting(true);
    try {
      await updateTrainingAvailability(
        trainingId,
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

  const renderPlayerList = (players: AvailabilityEntry[], emptyMessage: string) => {
    if (isLoading) {
      return Array(3).fill(0).map((_, idx) => (
        <Skeleton key={idx} variant="text" width="60%" sx={{ my: 0.5 }} />
      ));
    }

    return players.length > 0 ? (
      players.map((player) => (
        <Box key={player.email} display="flex" alignItems="center" py={1}>
          <Avatar 
            src={player.avatar} 
            sx={{ width: 32, height: 32, mr: 2 }}
          >
            {player.email.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body1">
            {player.email}
          </Typography>
        </Box>
      ))
    ) : (
      <Typography variant="body2" color="text.secondary">
        {emptyMessage}
      </Typography>
    );
  };

  const formatTrainingDate = (date: Date | string) => {
    return new Date(date).toLocaleString(undefined, {
      dateStyle: "full",
      timeStyle: "short",
    });
  };

  return (
    <Layout>
      <Header />
      
      <Box sx={{ 
        maxWidth: 1000, 
        mx: "auto", 
        px: { xs: 2, md: 4 }, 
        py: 4 
      }}>
        {/* Training Details Section */}
        {training && (
          <Card sx={{ 
            mb: 4, 
            boxShadow: theme.shadows[2],
            background: theme.palette.background.paper
          }}>
            <CardContent>
              <Typography 
                variant="h5" 
                fontWeight={600} 
                gutterBottom
                display="flex"
                alignItems="center"
              >
                <DateIcon color="primary" sx={{ mr: 1.5 }} />
                Training Session
              </Typography>
              
              <Stack spacing={2} mt={2}>
                <Box display="flex" alignItems="center">
                  <Chip
                    label={formatTrainingDate(training.start)}
                    icon={<DateIcon fontSize="small" />}
                    variant="outlined"
                    sx={{ mr: 2 }}
                  />
                </Box>
                
                <Box display="flex" alignItems="center">
                  <LocationIcon color="action" sx={{ mr: 1.5 }} />
                  <Typography variant="body1">
                    {training.location}
                  </Typography>
                </Box>

                {training.notes && (
                  <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                    <Box display="flex">
                      <NotesIcon color="action" sx={{ mr: 1.5 }} />
                      <Typography variant="body1">
                        {training.notes}
                      </Typography>
                    </Box>
                  </Paper>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* RSVP Actions */}
        <Typography variant="h6" fontWeight={600} mb={3}>
          Confirm Your Attendance
        </Typography>
        
        <Stack 
          direction={{ xs: "column", sm: "row" }} 
          spacing={2} 
          mb={5}
          justifyContent="center"
        >
          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={<AvailableIcon />}
            onClick={() => handleRSVP(true)}
            disabled={isSubmitting || isLoading}
            sx={{ 
              py: 1.5,
              fontWeight: 600,
              borderRadius: 2,
              flex: { xs: 1, sm: 0.5 }
            }}
          >
            Confirm Availability
          </Button>
          <Button
            variant="contained"
            color="error"
            size="large"
            startIcon={<UnavailableIcon />}
            onClick={() => handleRSVP(false)}
            disabled={isSubmitting || isLoading}
            sx={{ 
              py: 1.5,
              fontWeight: 600,
              borderRadius: 2,
              flex: { xs: 1, sm: 0.5 }
            }}
          >
            Unavailable
          </Button>
        </Stack>

        {/* Availability Lists */}
        <Box display="grid" gridTemplateColumns={{ md: "1fr 1fr" }} gap={4}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AvailableIcon color="success" sx={{ mr: 1.5 }} />
                <Typography variant="h6" color="success.main">
                  Available ({availablePlayers.length})
                </Typography>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              {renderPlayerList(
                availablePlayers, 
                "No players have confirmed availability yet"
              )}
            </CardContent>
          </Card>

          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <UnavailableIcon color="error" sx={{ mr: 1.5 }} />
                <Typography variant="h6" color="error.main">
                  Unavailable ({unavailablePlayers.length})
                </Typography>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              {renderPlayerList(
                unavailablePlayers, 
                "All players currently available"
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Layout>
  );
}