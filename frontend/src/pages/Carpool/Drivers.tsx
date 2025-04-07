import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid2 as Grid,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Avatar,
  Chip,
  Divider,
  useTheme,
  styled,
  alpha,
} from "@mui/material";
import {
  Phone,
  LocationOn,
  People,
  AccessTime,
  Delete,
  DirectionsCar,
  Event,
  Warning,
} from "@mui/icons-material";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import { getRides, cancelRide } from "../../services/carpool";
import {
  fetchFixturesByMonth,
  FixtureData,
} from "../../services/schedule_management";
import { useAuth } from "../../hooks/useAuth";

// Styled Components
const DriverCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[6],
  },
}));

const MatchButton = styled(Button)({
  minWidth: 140,
  height: 40,
  borderRadius: 20,
  textTransform: "none",
});

interface Driver {
  id: string;
  matchId: string;
  driverName: string;
  driverEmail: string;
  driverPhone: string;
  seats: number;
  location: string;
  pickup: string;
  passengers: string[];
  time: string;
  matchDetails: string;
}

export default function Drivers() {
  const theme = useTheme();
  const { clubName, ageGroup, division, user } = useAuth();
  const [matches, setMatches] = useState<FixtureData[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  // Fetch Upcoming Matches
  useEffect(() => {
    const loadMatches = async () => {
      try {
        const futureMonths = [...Array(6)].map((_, i) => {
          const futureDate = new Date();
          futureDate.setMonth(new Date().getMonth() + i);
          return futureDate.toISOString().slice(0, 7);
        });

        let allMatches: FixtureData[] = [];
        for (const month of futureMonths) {
          const fetchedMatches = await fetchFixturesByMonth(
            month,
            clubName!,
            ageGroup!,
            division!
          );
          allMatches = [...allMatches, ...fetchedMatches];
        }

        const futureMatches = allMatches
          .filter((match) => new Date(match.date) >= new Date())
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        setMatches(futureMatches);
        if (futureMatches.length > 0 && !selectedMatch) {
          setSelectedMatch(futureMatches[0].matchId);
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };

    if (clubName && ageGroup && division) {
      loadMatches();
    }
  }, [clubName, ageGroup, division]);

  // Fetch Available Rides
  useEffect(() => {
    const fetchData = async () => {
      try {
        const rides = await getRides(clubName!, ageGroup!, division!);
        setDrivers(rides);
      } catch (error) {
        console.error("Error fetching rides:", error);
      }
    };
    fetchData();
  }, [clubName, ageGroup, division]);

  const handleMatchSelection = (matchId: string) => {
    setSelectedMatch(matchId);
  };

  const handleCancelRide = (driver: Driver) => {
    setSelectedDriver(driver);
    setConfirmCancel(true);
  };

  const confirmCancelRide = async () => {
    if (selectedDriver) {
      try {
        await cancelRide(selectedDriver.id, clubName!, ageGroup!, division!);
        setDrivers((prevDrivers) =>
          prevDrivers.filter((d) => d.id !== selectedDriver.id)
        );
      } catch (error) {
        console.error("Error cancelling ride:", error);
      }
    }
    setConfirmCancel(false);
  };

  return (
    <Layout>
      <Header />
      <Box
        sx={{
          maxWidth: 1200,
          margin: "auto",
          px: { xs: 2, md: 4 },
          py: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 4,
            gap: 2,
          }}
        >
          <DirectionsCar
            sx={{
              fontSize: 40,
              color: "primary.main",
              p: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: "50%",
            }}
          />
          <Typography variant="h4" fontWeight={700}>
            Available Drivers
          </Typography>
        </Box>

        {/* Match Selection */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          <Event sx={{ verticalAlign: "middle", mr: 1 }} />
          Select Match
        </Typography>

        <Box
          sx={{
            display: "flex",
            overflowX: "auto",
            gap: 2,
            mb: 4,
            pb: 2,
            "&::-webkit-scrollbar": {
              height: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.grey[400],
              borderRadius: "3px",
            },
          }}
        >
          {matches.map((match) => {
            const opponentTeam =
              match.homeTeam === clubName ? match.awayTeam : match.homeTeam;
            const matchDate = new Date(match.date);
            const isSelected = selectedMatch === match.matchId;

            return (
              <MatchButton
                key={match.matchId}
                onClick={() => handleMatchSelection(match.matchId)}
                startIcon={
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: isSelected ? "primary.main" : "grey.300",
                      color: isSelected ? "white" : "grey.700",
                      fontSize: 12,
                    }}
                  >
                    {opponentTeam.charAt(0)}
                  </Avatar>
                }
              >
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    fontWeight={isSelected ? 600 : 400}
                  >
                    {opponentTeam}
                  </Typography>
                  <Typography variant="caption">
                    {matchDate.toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
              </MatchButton>
            );
          })}
        </Box>

        {/* Drivers List */}
        {selectedMatch && (
          <>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              <People sx={{ verticalAlign: "middle", mr: 1 }} />
              {drivers.filter((d) => d.matchId === selectedMatch).length}{" "}
              Driver(s) Available
            </Typography>

            <Grid container spacing={3}>
              {drivers
                .filter((driver) => driver.matchId === selectedMatch)
                .map((driver) => {
                  const isCurrentUser = driver.driverEmail === user?.email;
                  const matchDetails = matches.find(
                    (m) => m.matchId === driver.matchId
                  );
                  const opponentTeam =
                    matchDetails?.homeTeam === clubName
                      ? matchDetails.awayTeam
                      : matchDetails?.homeTeam;

                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={driver.id}>
                      <DriverCard>
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: "primary.main",
                                width: 48,
                                height: 48,
                              }}
                            >
                              {driver.driverName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {driver.driverName}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                vs {opponentTeam}
                              </Typography>
                            </Box>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1.5,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <LocationOn color="primary" fontSize="small" />
                              <Typography variant="body2">
                                <strong>{driver.location}</strong>
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <AccessTime color="primary" fontSize="small" />
                              <Typography variant="body2">
                                <strong>{driver.time}</strong>
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <People color="primary" fontSize="small" />
                              <Typography variant="body2">
                                <strong>
                                  {driver.seats} seat
                                  {driver.seats !== 1 ? "s" : ""} available
                                </strong>
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <DirectionsCar color="primary" fontSize="small" />
                              <Typography variant="body2">
                                Pickup stops:{" "}
                                <strong>
                                  {driver.pickup === "Yes"
                                    ? "Available"
                                    : "Not available"}
                                </strong>
                              </Typography>
                            </Box>
                          </Box>

                          {driver.passengers?.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Passengers:
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 1,
                                  mt: 1,
                                }}
                              >
                                {driver.passengers.map((passenger) => (
                                  <Chip
                                    key={passenger}
                                    label={passenger}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}
                        </CardContent>

                        <CardContent
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            pt: 0,
                          }}
                        >
                          <IconButton
                            href={`tel:${driver.driverPhone}`}
                            color="primary"
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                              },
                            }}
                          >
                            <Phone />
                          </IconButton>

                          {isCurrentUser && (
                            <Button
                              variant="contained"
                              color="error"
                              startIcon={<Delete />}
                              onClick={() => handleCancelRide(driver)}
                              size="small"
                            >
                              Cancel Ride
                            </Button>
                          )}
                        </CardContent>
                      </DriverCard>
                    </Grid>
                  );
                })}
            </Grid>
          </>
        )}

        {/* Empty State */}
        {selectedMatch &&
          drivers.filter((d) => d.matchId === selectedMatch).length === 0 && (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <Warning color="disabled" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No drivers available for this match
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Be the first to offer a ride!
              </Typography>
            </Box>
          )}

        {/* Confirm Cancellation Dialog */}
        <Dialog
          open={confirmCancel}
          onClose={() => setConfirmCancel(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle
            sx={{
              bgcolor: "error.main",
              color: "error.contrastText",
              fontWeight: 600,
            }}
          >
            <Warning sx={{ mr: 1, verticalAlign: "middle" }} />
            Cancel Ride
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography>
              Are you sure you want to cancel your ride for{" "}
              <strong>{selectedDriver?.matchDetails}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setConfirmCancel(false)}>Keep Ride</Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmCancelRide}
              startIcon={<Delete />}
            >
              Confirm Cancellation
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
