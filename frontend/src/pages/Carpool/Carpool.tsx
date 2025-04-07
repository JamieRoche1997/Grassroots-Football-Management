import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid2 as Grid,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Chip,
  Avatar,
  Divider,
  useTheme,
  styled,
  Stack,
} from "@mui/material";
import {
  DriveEta,
  AccessTime,
  SportsSoccer,
  Event,
  Person,
  DirectionsCar,
  Close,
  Check,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import { getRides, offerRide, requestRide } from "../../services/carpool";
import {
  fetchFixturesByMonth,
  FixtureData,
} from "../../services/schedule_management";
import { useAuth } from "../../hooks/useAuth";

// Styled Components
const MatchCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  transition: "all 0.3s ease",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[6],
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
}));

const RideCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  marginBottom: theme.spacing(2),
  borderLeft: `4px solid ${theme.palette.primary.main}`,
}));

interface Ride {
  clubName: string;
  ageGroup: string;
  division: string;
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

export default function CarpoolOverview() {
  const theme = useTheme();
  const { user, clubName, ageGroup, division } = useAuth();
  const [isDriver, setIsDriver] = useState(false);
  const [offerRideOpen, setOfferRideOpen] = useState(false);
  const [seatsAvailable, setSeatsAvailable] = useState(3);
  const [departureLocation, setDepartureLocation] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [pickupStops, setPickupStops] = useState("Yes");
  const [matches, setMatches] = useState<FixtureData[]>([]);
  const [selectedMatch, setSelectedMatch] = useState("");
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [rideRequests, setRideRequests] = useState<string[]>([]);
  const [matchRides, setMatchRides] = useState<Ride[]>([]);
  const [rideDialogOpen, setRideDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Fetch matches and rides
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch matches
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

        setMatches(
          allMatches.filter((match) => new Date(match.date) >= new Date())
        );

        // Fetch rides
        const rides = await getRides(clubName!, ageGroup!, division!);
        setAvailableRides(
          rides.map((ride) => ({
            ...ride,
            matchDetails: ride.matchDetails || "Unknown Match",
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbar({
          open: true,
          message: "Failed to load data",
          severity: "error",
        });
      }
    };

    if (clubName && ageGroup && division) {
      fetchData();
    }
  }, [clubName, ageGroup, division]);

  const handleToggleDriver = () => setIsDriver(!isDriver);

  const handleMatchClick = (match: FixtureData) => {
    const ridesForMatch = availableRides.filter(
      (ride) => ride.matchId === match.matchId
    );
    setSelectedMatch(match.matchId);
    setMatchRides(ridesForMatch);
    setRideDialogOpen(true);
  };

  const handleRequestRide = async (rideId: string) => {
    try {
      const ride = availableRides.find((r) => r.id === rideId);

      if (!user?.displayName || !ride) return;

      if (user.displayName === ride.driverName) {
        setSnackbar({
          open: true,
          message: "You cannot request a ride from yourself!",
          severity: "error",
        });
        return;
      }

      if (ride.passengers.includes(user.displayName)) {
        setSnackbar({
          open: true,
          message: "You've already requested this ride!",
          severity: "error",
        });
        return;
      }

      await requestRide(
        {
          userName: user.displayName,
          ride_id: rideId,
        },
        clubName!,
        ageGroup!,
        division!
      );

      setRideRequests([...rideRequests, rideId]);
      setSnackbar({
        open: true,
        message: "Ride request sent successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error requesting ride:", error);
      setSnackbar({
        open: true,
        message: "Failed to request ride",
        severity: "error",
      });
    }
  };

  const handleOfferRide = async () => {
    if (!departureLocation || !departureTime || !selectedMatch) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "error",
      });
      return;
    }

    try {
      const matchInfo = matches.find(
        (match) => match.matchId === selectedMatch
      );
      const opponentTeam =
        matchInfo?.homeTeam === clubName
          ? matchInfo.awayTeam
          : matchInfo?.homeTeam;

      const newRide: Ride = {
        clubName: clubName || "",
        ageGroup: ageGroup || "",
        division: division || "",
        id: Date.now().toString(),
        matchId: selectedMatch,
        driverName: user?.displayName || "Unknown Driver",
        driverEmail: user?.email || "",
        driverPhone: user?.phoneNumber || "",
        seats: seatsAvailable,
        location: departureLocation,
        pickup: pickupStops,
        passengers: [],
        time: departureTime,
        matchDetails: matchInfo
          ? `${opponentTeam} - ${new Date(matchInfo.date).toLocaleDateString()}`
          : "Unknown Match",
      };

      await offerRide(newRide);
      const updatedRides = await getRides(clubName!, ageGroup!, division!);
      setAvailableRides(updatedRides);
      setOfferRideOpen(false);
      setSnackbar({
        open: true,
        message: "Ride offered successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error offering ride:", error);
      setSnackbar({
        open: true,
        message: "Failed to offer ride",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Layout>
      <Header />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

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
            Team Carpool
          </Typography>
        </Box>

        {/* Driver Mode Toggle */}
        <Card sx={{ mb: 4, p: 2, borderRadius: 3 }}>
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <DriveEta color="primary" sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h6">Driver Mode</Typography>
                <Typography variant="body2" color="text.secondary">
                  {isDriver
                    ? "You're offering rides"
                    : "You're looking for rides"}
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={isDriver}
              onChange={handleToggleDriver}
              color="primary"
            />
          </CardContent>

          {isDriver && (
            <CardContent sx={{ textAlign: "center" }}>
              <Button
                variant="contained"
                startIcon={<Person />}
                onClick={() => setOfferRideOpen(true)}
                sx={{ borderRadius: 2 }}
              >
                Offer a Ride
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Upcoming Matches */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          <Event sx={{ verticalAlign: "middle", mr: 1 }} />
          Upcoming Matches
        </Typography>

        <Grid container spacing={3}>
          {matches.map((match) => {
            const opponentTeam =
              match.homeTeam === clubName ? match.awayTeam : match.homeTeam;
            const matchDate = new Date(match.date);
            const formattedDate = matchDate.toLocaleDateString();
            const formattedTime = matchDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={match.matchId}>
                <MatchCard onClick={() => handleMatchClick(match)}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <SportsSoccer color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        vs {opponentTeam}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                      <Chip
                        icon={<AccessTime fontSize="small" />}
                        label={formattedTime}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<Event fontSize="small" />}
                        label={formattedDate}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                </MatchCard>
              </Grid>
            );
          })}
        </Grid>

        {/* Rides Dialog */}
        <Dialog
          open={rideDialogOpen}
          onClose={() => setRideDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 600,
            }}
          >
            <DirectionsCar sx={{ mr: 1, verticalAlign: "middle" }} />
            Available Rides
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            {matchRides.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  color: "text.secondary",
                }}
              >
                <Typography variant="h6">No rides available</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Be the first to offer a ride for this match!
                </Typography>
              </Box>
            ) : (
              matchRides.map((ride) => (
                <RideCard key={ride.id}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        {ride.driverName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {ride.driverName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {ride.seats} seat{ride.seats !== 1 ? "s" : ""}{" "}
                          available
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: "flex", gap: 3 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Departure
                        </Typography>
                        <Typography>{ride.location}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Time
                        </Typography>
                        <Typography>{ride.time}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Pickup Stops
                      </Typography>
                      <Typography>
                        {ride.pickup === "Yes" ? (
                          <Check
                            color="success"
                            sx={{ verticalAlign: "middle" }}
                          />
                        ) : (
                          <Close
                            color="error"
                            sx={{ verticalAlign: "middle" }}
                          />
                        )}
                      </Typography>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleRequestRide(ride.id)}
                      disabled={ride.seats === 0}
                      sx={{ mt: 2 }}
                    >
                      {ride.seats === 0 ? "No seats available" : "Request Ride"}
                    </Button>
                  </CardContent>
                </RideCard>
              ))
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRideDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Offer Ride Dialog */}
        <Dialog
          open={offerRideOpen}
          onClose={() => setOfferRideOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 600,
            }}
          >
            <Person sx={{ mr: 1, verticalAlign: "middle" }} />
            Offer a Ride
          </DialogTitle>

          <DialogContent sx={{ mt: 3 }}>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <Select
                  value={selectedMatch}
                  onChange={(e) => setSelectedMatch(e.target.value)}
                  label="Select Match"
                >
                  {matches.map((match) => {
                    const opponentTeam =
                      match.homeTeam === clubName
                        ? match.awayTeam
                        : match.homeTeam;
                    return (
                      <MenuItem key={match.matchId} value={match.matchId}>
                        {opponentTeam} -{" "}
                        {new Date(match.date).toLocaleDateString()}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <TextField
                placeholder="Number of seats available"
                type="number"
                value={seatsAvailable}
                onChange={(e) => setSeatsAvailable(Number(e.target.value))}
              />

              <TextField
                placeholder="Departure Location"
                value={departureLocation}
                onChange={(e) => setDepartureLocation(e.target.value)}
              />

              <TextField
                placeholder="Departure Time"
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
              />

              <FormControl fullWidth>
                <InputLabel>Pickup Stops</InputLabel>
                <Select
                  value={pickupStops}
                  onChange={(e) => setPickupStops(e.target.value)}
                  label="Pickup Stops"
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOfferRideOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleOfferRide}
              disabled={!selectedMatch || !departureLocation || !departureTime}
            >
              Confirm Ride
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
