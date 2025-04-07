import { useEffect, useState } from "react";
import { alpha, styled } from "@mui/material/styles";
import {
  Card,
  CardContent,
  Typography,
  Grid2 as Grid,
  Skeleton,
  Stack,
} from "@mui/material";
import {
  fetchAllFixtures,
  fetchAllTrainings,
} from "../../../services/schedule_management";
import { useAuth } from "../../../hooks/useAuth";
import EventIcon from "@mui/icons-material/Event";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

// Glass effect card component
const GlassCard = styled(Card)(({ theme }) => ({
  width: "100%",
  height: "100%",
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: "blur(12px)",
  border: "1px solid",
  borderColor: alpha(theme.palette.divider, 0.1),
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.1)",
  },
}));

type CalendarCardProps = {
  title: string;
  description: string;
  date: string;
  type?: "match" | "training";
};

function CalendarCard({ title, description, date, type }: CalendarCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <GlassCard variant="outlined">
      <CardContent sx={{ p: 3, height: "100%" }}>
        <Stack spacing={2} sx={{ height: "100%" }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {type === "match" ? (
              <SportsSoccerIcon color="primary" fontSize="medium" />
            ) : (
              <FitnessCenterIcon color="secondary" fontSize="medium" />
            )}
            <Typography variant="h6" component="div" fontWeight={600}>
              {title}
            </Typography>
          </Stack>

          <Typography variant="body1" sx={{ flexGrow: 1 }}>
            {description}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <EventIcon fontSize="small" color="disabled" />
            <Typography variant="caption" color="text.secondary">
              {date === "-" ? "No date available" : formattedDate}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </GlassCard>
  );
}

export default function CalendarView() {
  const [events, setEvents] = useState<CalendarCardProps[]>([]);
  const { clubName, ageGroup, division } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      if (!clubName || !ageGroup || !division) return;

      try {
        setLoading(true);
        const [fixtures, trainings] = await Promise.all([
          fetchAllFixtures(clubName, ageGroup, division),
          fetchAllTrainings(clubName, ageGroup, division),
        ]);

        const now = new Date();

        const sortedMatches = [...fixtures].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const sortedTrainings = [...trainings].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const previousMatch = [...sortedMatches]
          .reverse()
          .find((match) => new Date(match.date) < now);
        const upcomingMatch = sortedMatches.find(
          (match) => new Date(match.date) > now
        );
        const previousTraining = [...sortedTrainings]
          .reverse()
          .find((training) => new Date(training.date) < now);
        const upcomingTraining = sortedTrainings.find(
          (training) => new Date(training.date) > now
        );

        setEvents([
          {
            title: "Previous Match",
            description: previousMatch
              ? `${previousMatch.homeTeam} vs ${previousMatch.awayTeam}`
              : "No match found",
            date: previousMatch?.date || "-",
            type: "match",
          },
          {
            title: "Upcoming Match",
            description: upcomingMatch
              ? `${upcomingMatch.homeTeam} vs ${upcomingMatch.awayTeam}`
              : "No match found",
            date: upcomingMatch?.date || "-",
            type: "match",
          },
          {
            title: "Previous Training",
            description: previousTraining?.notes || "No training found",
            date: previousTraining?.date || "-",
            type: "training",
          },
          {
            title: "Upcoming Training",
            description: upcomingTraining?.notes || "No training found",
            date: upcomingTraining?.date || "-",
            type: "training",
          },
        ]);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [clubName, ageGroup, division]);

  return (
    <Grid container spacing={2}>
      {loading ? (
        <>
          {[...Array(4)].map((_, index) => (
            <Grid size={{ xs: 12, sm: 6 }} key={index}>
              <Skeleton variant="rounded" height={160} />
            </Grid>
          ))}
        </>
      ) : (
        events.map((event, index) => (
          <Grid size={{ xs: 12, sm: 6 }} key={index}>
            <CalendarCard {...event} />
          </Grid>
        ))
      )}
    </Grid>
  );
}
