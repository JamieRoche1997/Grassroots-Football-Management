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
  CircularProgress,
  FormHelperText,
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
  Info,
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
  const { user, clubName, ageGroup, division, name } = useAuth();
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
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    seatsAvailable: "",
    departureLocation: "",
    departureTime: "",
    selectedMatch: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Fetch matches and rides
  useEffect(() => {
    const fetchData = async () => {
      if (!clubName || !ageGroup || !division) return;
      
      setLoading(true);
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
            clubName,
            ageGroup,
            division
          );
          allMatches = [...allMatches, ...fetchedMatches];
        }

        setMatches(
          allMatches.filter((match) => new Date(match.date) >= new Date())
        );

        // Fetch rides
        const rides = await getRides(clubName, ageGroup, division);
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
          message: "Failed to load data. Please try again later.",
          severity: "error",
        });
      } finally {
        setLoading(false);
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

  const validateRideForm = (): boolean => {
    const errors = {
      seatsAvailable: "",
      departureLocation: "",
      departureTime: "",
      selectedMatch: "",
    };
    
    let isValid = true;

    if (!selectedMatch) {
      errors.selectedMatch = "Please select a match";
      isValid = false;
    }

    if (seatsAvailable <= 0) {
      errors.seatsAvailable = "Must have at least 1 seat available";
      isValid = false;
    }

    if (!departureLocation.trim()) {
      errors.departureLocation = "Departure location is required";
      isValid = false;
    }

    if (!departureTime) {
      errors.departureTime = "Departure time is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleRequestRide = async (rideId: string) => {
    if (!name) {
      setSnackbar({
        open: true,
        message: "You must be logged in to request a ride",
        severity: "error",
      });
      return;
    }
    
    setLoading(true);
    try {
      const ride = availableRides.find((r) => r.id === rideId);

      if (!ride) {
        setSnackbar({
          open: true,
          message: "Ride information not found",
          severity: "error",
        });
        return;
      }

      if (name === ride.driverName) {
        setSnackbar({
          open: true,
          message: "You cannot request a ride from yourself!",
          severity: "error",
        });
        return;
      }

      if (ride.passengers && ride.passengers.includes(name)) {
        setSnackbar({
          open: true,
          message: "You've already requested this ride!",
          severity: "error",
        });
        return;
      }

      const passengerCount = ride.passengers?.length || 0;
      if (passengerCount >= ride.seats) {
        setSnackbar({
          open: true,
          message: "This ride is now full. Please choose another ride.",
          severity: "error",
        });
        return;
      }

      await requestRide(
        {
          userName: name,
          ride_id: rideId,
        },
        clubName!,
        ageGroup!,
        division!
      );

      // Update local state to reflect the change
      setRideRequests([...rideRequests, rideId]);
      
      // Refresh the rides list
      const updatedRides = await getRides(clubName!, ageGroup!, division!);
      setAvailableRides(updatedRides);
      
      // Update the current match rides
      const updatedMatchRides = updatedRides.filter(
        ride => ride.matchId === selectedMatch
      );
      setMatchRides(updatedMatchRides);
      
      setSnackbar({
        open: true,
        message: "Ride request sent successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error requesting ride:", error);
      setSnackbar({
        open: true,
        message: "Failed to request ride. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOfferRide = async () => {
    if (!validateRideForm()) {
      return;
    }

    setLoading(true);
    try {
      const matchInfo = matches.find(
        (match) => match.matchId === selectedMatch
      );
      
      if (!matchInfo) {
        setSnackbar({
          open: true,
          message: "Match information not found",
          severity: "error",
        });
        return;
      }
      
      const opponentTeam =
        matchInfo.homeTeam === clubName
          ? matchInfo.awayTeam
          : matchInfo.homeTeam;

      const newRide: Ride = {
        clubName: clubName || "",
        ageGroup: ageGroup || "",
        division: division || "",
        id: Date.now().toString(),
        matchId: selectedMatch,
        driverName: name || "Unknown Driver",
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
      
      // Reset form fields
      setSelectedMatch("");
      setSeatsAvailable(3);
      setDepartureLocation("");
      setDepartureTime("");
      setPickupStops("Yes");
      
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
        message: "Failed to offer ride. Please check your connection and try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseOfferDialog = () => {
    // If user has entered data, show confirmation
    if (departureLocation || departureTime || selectedMatch !== "") {
      if (window.confirm("Are you sure you want to cancel? Your ride information will be lost.")) {
        setOfferRideOpen(false);
        // Reset form fields
        setSelectedMatch("");
        setSeatsAvailable(3);
        setDepartureLocation("");
        setDepartureTime("");
        setPickupStops("Yes");
        setFormErrors({
          seatsAvailable: "",
          departureLocation: "",
          departureTime: "",
          selectedMatch: "",
        });
      }
    } else {
      setOfferRideOpen(false);
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
                disabled={loading}
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

        {loading && matches.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : matches.length === 0 ? (
          <Card sx={{ p: 3, textAlign: 'center', mb: 3 }}>
            <Info color="info" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">No upcoming matches found</Typography>
            <Typography variant="body2" color="text.secondary">
              Check back later for new match schedules
            </Typography>
          </Card>
        ) : (
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
        )}

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
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : matchRides.length === 0 ? (
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
                {isDriver && (
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={() => {
                      setRideDialogOpen(false);
                      setOfferRideOpen(true);
                    }}
                  >
                    Offer a Ride
                  </Button>
                )}
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
                          {ride.seats - (ride.passengers?.length || 0)} of {ride.seats} seat{ride.seats !== 1 ? "s" : ""} available
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
                      disabled={loading || ride.seats <= (ride.passengers?.length || 0) || Boolean(name && ride.passengers?.includes(name))}
                      sx={{ mt: 2 }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : ride.seats <= (ride.passengers?.length || 0) ? (
                        "No seats available"
                      ) : name && ride.passengers?.includes(name) ? (
                        "Ride Requested"
                      ) : (
                        "Request Ride"
                      )}
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
          onClose={handleCloseOfferDialog}
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
              <FormControl fullWidth error={!!formErrors.selectedMatch}>
                <InputLabel>Select Match</InputLabel>
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
                {formErrors.selectedMatch && (
                  <FormHelperText>{formErrors.selectedMatch}</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth error={!!formErrors.seatsAvailable}>
                <TextField
                  label="Number of seats available"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={seatsAvailable}
                  onChange={(e) => setSeatsAvailable(Number(e.target.value))}
                  error={!!formErrors.seatsAvailable}
                  helperText={formErrors.seatsAvailable}
                />
              </FormControl>

              <FormControl fullWidth error={!!formErrors.departureLocation}>
                <TextField
                  label="Departure Location"
                  value={departureLocation}
                  onChange={(e) => setDepartureLocation(e.target.value)}
                  error={!!formErrors.departureLocation}
                  helperText={formErrors.departureLocation}
                />
              </FormControl>

              <FormControl fullWidth error={!!formErrors.departureTime}>
                <TextField
                  label="Departure Time"
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  error={!!formErrors.departureTime}
                  helperText={formErrors.departureTime}
                  InputLabelProps={{ shrink: true }}
                />
              </FormControl>

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
            <Button onClick={handleCloseOfferDialog}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleOfferRide}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Confirm Ride"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
