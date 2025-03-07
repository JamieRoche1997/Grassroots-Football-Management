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
  Select,
  MenuItem,
  Snackbar,
  Alert
} from "@mui/material";
import { DriveEta, People, LocationOn, AccessTime, SportsSoccer } from "@mui/icons-material";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import { getRides, offerRide, requestRide } from "../../services/carpool";
import { fetchFixturesByMonth, FixtureData } from "../../services/schedule_management";
import { useAuth } from "../../hooks/useAuth";

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
  const { user, clubName, ageGroup, division } = useAuth();
  const [isDriver, setIsDriver] = useState<boolean>(false);
  const [offerRideOpen, setOfferRideOpen] = useState<boolean>(false);
  const [seatsAvailable, setSeatsAvailable] = useState<number>(3);
  const [departureLocation, setDepartureLocation] = useState<string>("");
  const [departureTime, setDepartureTime] = useState<string>("");
  const [pickupStops, setPickupStops] = useState<string>("Yes");
  const [matches, setMatches] = useState<FixtureData[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [rideRequests, setRideRequests] = useState<string[]>([]);
  const [matchRides, setMatchRides] = useState<Ride[]>([]);
  const [rideDialogOpen, setRideDialogOpen] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  // Fetch All Future Matches
  useEffect(() => {
    async function loadMatches() {
      try {
        const futureMonths = [...Array(6)].map((_, i) => {
          const futureDate = new Date();
          futureDate.setMonth(new Date().getMonth() + i);
          return futureDate.toISOString().slice(0, 7); // Format as "YYYY-MM"
        });

        let allMatches: FixtureData[] = [];
        for (const month of futureMonths) {
          const fetchedMatches = await fetchFixturesByMonth(month, clubName!, ageGroup!, division!);
          allMatches = [...allMatches, ...fetchedMatches];
        }

        // Filter only future matches
        const futureMatches = allMatches.filter(match => new Date(match.date) >= new Date());
        setMatches(futureMatches);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    }

    if (clubName && ageGroup && division) {
      loadMatches();
    }
  }, [clubName, ageGroup, division]);

  // Fetch available rides from backend on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        const rides = await getRides(clubName!, ageGroup!, division!); // Fetch rides from backend
        const ridesWithDetails = rides.map(ride => ({
          ...ride,
          matchDetails: ride.matchDetails || "Unknown Match"
        }));
        setAvailableRides(ridesWithDetails);
      } catch (error) {
        console.error("Error fetching rides:", error);
      }
    }
    fetchData();
  }, [clubName, ageGroup, division]);

  // Toggle Driver Mode
  const handleToggleDriver = () => {
    setIsDriver(!isDriver);
  };

  // Handle Match Click
  const handleMatchClick = (match: FixtureData) => {
    const ridesForMatch = availableRides.filter((ride) => ride.matchId === match.matchId);
    setSelectedMatch(match.matchId);
    setMatchRides(ridesForMatch);
    setRideDialogOpen(true);
  };

  // Handle Ride Request
  const handleRequestRide = async (rideId: string) => {
    try {
      if (user?.displayName) {

        if (user?.displayName === availableRides.find(ride => ride.id === rideId)?.driverName) {
          setSnackbarMessage("You cannot request a ride from yourself!");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return;
        }
        // If the user has already requested a ride, show a message
        if (availableRides.find(ride => ride.id === rideId)?.passengers.includes(user?.displayName)) {
          setSnackbarMessage("You have already requested a ride for this match!");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return;
        }
        await requestRide({ userName: user.displayName, ride_id: rideId }, clubName!, ageGroup!, division!);

        setRideRequests([...rideRequests, rideId]);

        setSnackbarMessage("Ride request sent successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else {
        throw new Error("User display name is not available");
      }
    } catch (error) {
      console.error("Error requesting ride:", error);
      setSnackbarMessage("Failed to request ride. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // To close the Snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // ✅ Modify handleOfferRide to include matchId
  const handleOfferRide = async () => {
    if (!departureLocation || !departureTime || !selectedMatch) {
      alert("Please enter all details and select a match before offering a ride.");
      return;
    }

    try {
      const matchInfo = matches.find((match) => match.matchId === selectedMatch);

      const newRide: Ride = {
        clubName: clubName || "",
        ageGroup: ageGroup || "",
        division: division || "",
        id: "",
        matchId: matchInfo?.matchId || "",
        driverName: user?.displayName || "Unknown Driver",
        driverEmail: user?.email || "Unknown Email",
        driverPhone: user?.phoneNumber || "Unknown Phone",
        seats: seatsAvailable,
        location: departureLocation,
        pickup: pickupStops,
        passengers: [],
        time: departureTime,
        matchDetails: matchInfo ? `${matchInfo.homeTeam} vs ${matchInfo.awayTeam} - ${matchInfo.date}` : "Unknown Match",
      };

      console.log("Offering ride:", newRide);
      await offerRide(newRide); // ✅ Call API with matchId
      const rides = await getRides(clubName!, ageGroup!, division!); // Fetch updated rides
      setAvailableRides(rides);
      setOfferRideOpen(false);
    } catch (error) {
      console.error("Error offering ride:", error);
    }
  };

  return (
    <Layout>
      <Header />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Box sx={{ maxWidth: 900, margin: "auto", mt: 4 }}>
        <Typography variant="h3" sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>
          🚗 Carpool
        </Typography>

        {/* Driver Toggle */}
        <Card sx={{ mb: 3, p: 2, boxShadow: 3, borderRadius: 2 }}>
          <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <DriveEta sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h6">Are you driving?</Typography>
            </Box>
            <Switch checked={isDriver} onChange={handleToggleDriver} />
          </CardContent>

          {isDriver && (
            <CardContent sx={{ display: "flex", justifyContent: "center" }}>
              <Button variant="contained" onClick={() => setOfferRideOpen(true)}>
                🚘 Offer Ride
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Upcoming Matches as Clickable Cards */}
        <Grid container spacing={3}>
          {matches.map((match) => {
            const opponentTeam = match.homeTeam === clubName ? match.awayTeam : match.homeTeam;
            return (
              <Grid size={{ xs: 12, sm: 6 }} key={match.matchId}>
                <Card
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    boxShadow: 3,
                    transition: "0.3s",
                    cursor: "pointer",
                    "&:hover": { transform: "scale(1.05)", boxShadow: 6 },
                  }}
                  onClick={() => handleMatchClick(match)}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      <SportsSoccer sx={{ verticalAlign: "middle", mr: 1 }} />
                      {opponentTeam} - {new Date(match.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      🕒 {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Rides Modal for Selected Match */}
        <Dialog open={rideDialogOpen} onClose={() => setRideDialogOpen(false)}>
          <DialogTitle>
            Available Rides for {matches.find(match => match.matchId === selectedMatch)?.homeTeam} vs {matches.find(match => match.matchId === selectedMatch)?.awayTeam}
          </DialogTitle>
          <DialogContent>
            {matchRides.length === 0 ? (
              <Typography>No rides available for this match.</Typography>
            ) : (
              matchRides.map((ride) => (
                <Card key={ride.id} sx={{ mb: 2, p: 2, borderRadius: 2, boxShadow: 3 }}>
                  <Typography variant="h6">{ride.driverName}</Typography>
                  <Typography variant="body2">
                    <People sx={{ verticalAlign: "middle", fontSize: 18, mr: 1 }} />
                    {ride.seats} Seats Available
                  </Typography>
                  <Typography variant="body2">
                    <LocationOn sx={{ verticalAlign: "middle", fontSize: 18, mr: 1 }} />
                    Departs from: <strong>{ride.location}</strong>
                  </Typography>
                  <Typography variant="body2">
                    <AccessTime sx={{ verticalAlign: "middle", fontSize: 18, mr: 1 }} />
                    Leaves at: <strong>{ride.time}</strong>
                  </Typography>
                  <Typography variant="body2">
                    🚦 Pickup Stops: <strong>{ride.pickup}</strong>
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRequestRide(ride.id)}
                    disabled={ride.seats === 0}
                    sx={{ mt: 1 }}
                  >
                    {ride.seats === 0 ? "Full" : "Request Ride"}
                  </Button>
                </Card>
              ))
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRideDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Offer Ride Dialog */}
        <Dialog open={offerRideOpen} onClose={() => setOfferRideOpen(false)}>
          <DialogTitle>Offer a Ride</DialogTitle>
          <DialogContent>
            <Typography variant="body2">Enter your ride details below:</Typography>

            {/* Match Selection */}
            <Typography variant="body2" sx={{ mt: 2 }}>
              🏆 Select Match:
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <Select
                value={selectedMatch}
                onChange={(e) => setSelectedMatch(e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>Select a Match</MenuItem>
                {matches.length === 0 ? (
                  <MenuItem disabled>No upcoming matches available</MenuItem>
                ) : (
                  matches.map((match) => {
                    // Determine the opponent team
                    const opponentTeam = match.homeTeam === clubName ? match.awayTeam : match.homeTeam;

                    return (
                      <MenuItem key={match.matchId} value={match.matchId}>
                        {opponentTeam} - {match.date}
                      </MenuItem>
                    );
                  })
                )}
              </Select>
            </FormControl>


            {/* Seats Available */}
            <Typography variant="body2" sx={{ mt: 2 }}>
              🚗 Seats Available:
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={seatsAvailable}
              onChange={(e) => setSeatsAvailable(Number(e.target.value))}
              sx={{ mt: 2 }}
            />

            {/* Departure Location */}
            <Typography variant="body2" sx={{ mt: 2 }}>
              📍 Departure Location:
            </Typography>
            <TextField
              fullWidth
              value={departureLocation}
              onChange={(e) => setDepartureLocation(e.target.value)}
              sx={{ mt: 2 }}
            />

            {/* Departure Time */}
            <Typography variant="body2" sx={{ mt: 2 }}>
              🕒 Departure Time:
            </Typography>
            <TextField
              fullWidth
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              sx={{ mt: 2 }}
            />

            {/* Pickup Stops */}
            <Typography variant="body2" sx={{ mt: 2 }}>
              🚦 Pickup Stops:
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <Select value={pickupStops} onChange={(e) => setPickupStops(e.target.value)}>
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOfferRideOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleOfferRide}>
              Confirm Ride
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Layout>
  );
}
