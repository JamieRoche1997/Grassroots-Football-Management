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
} from "@mui/material";
import { Phone, LocationOn, People, AccessTime, Delete } from "@mui/icons-material";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import { getRides, cancelRide } from "../../services/carpool";
import { fetchMatches, MatchData } from "../../services/schedule_management";
import { useAuth } from "../../hooks/useAuth";

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
  const { clubName, ageGroup, division } = useAuth();
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<boolean>(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  // Fetch Upcoming Matches
  useEffect(() => {
    async function loadMatches() {
      try {
        const futureMonths = [...Array(6)].map((_, i) => {
          const futureDate = new Date();
          futureDate.setMonth(new Date().getMonth() + i);
          return futureDate.toISOString().slice(0, 7); // Format as "YYYY-MM"
        });

        let allMatches: MatchData[] = [];
        for (const month of futureMonths) {
          const fetchedMatches = await fetchMatches(month, clubName!, ageGroup!, division!);
          allMatches = [...allMatches, ...fetchedMatches];
        }

        // Sort matches by closest date
        const futureMatches = allMatches
          .filter(match => new Date(match.date) >= new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setMatches(futureMatches);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    }

    if (clubName && ageGroup && division) {
      loadMatches();
    }
  }, [clubName, ageGroup, division]);

  // Fetch Available Rides
  useEffect(() => {
    async function fetchData() {
      try {
        const rides = await getRides();
        setDrivers(rides);
      } catch (error) {
        console.error("Error fetching rides:", error);
      }
    }
    fetchData();
  }, []);

  // Handle Match Selection
  const handleMatchSelection = (matchId: string) => {
    setSelectedMatch(matchId);
  };

  // Open confirmation dialog for ride removal
  const handleCancelRide = (driver: Driver) => {
    setSelectedDriver(driver);
    setConfirmCancel(true);
  };

  // Remove driver ride from list and update backend
  const confirmCancelRide = async () => {
    if (selectedDriver) {
      try {
        console.log("Cancelling ride:", selectedDriver.id); // ✅ Log ride ID before deletion
        await cancelRide(selectedDriver.id); // ✅ Ensure backend completes first

        // ✅ Update state correctly after deletion
        setDrivers((prevDrivers) => prevDrivers.filter((d) => d.id !== selectedDriver.id));

        console.log(`Ride ${selectedDriver.id} successfully removed from UI.`);
      } catch (error) {
        console.error("Error cancelling ride:", error);
      }
    }
    setConfirmCancel(false);
  };


  return (
    <Layout>
      <Header />
      <Box sx={{ maxWidth: 900, margin: "auto", mt: 4 }}>
        <Typography variant="h3" sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>
          🚘 Drivers Offering Rides
        </Typography>

        {/* Scrollable Match Selection */}
        <Box sx={{ display: "flex", overflowX: "auto", gap: 2, mb: 3, pb: 1 }}>
          {matches.map((match) => {
            const opponentTeam = match.homeTeam === clubName ? match.awayTeam : match.homeTeam;
            return (
              <Button
                key={match.matchId}
                variant={selectedMatch === match.matchId ? "contained" : "outlined"}
                onClick={() => handleMatchSelection(match.matchId)}
                sx={{
                  minWidth: "120px", // ✅ Ensures uniform button width
                  height: "40px", // ✅ Ensures uniform height
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  px: 2, // ✅ Ensures padding consistency
                }}
              >
                {opponentTeam} - {new Date(match.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </Button>

            );
          })}
        </Box>

        {/* Drivers List for Selected Match */}
        <Grid container spacing={3}>
          {drivers
            .filter((driver) => driver.matchId === selectedMatch)
            .map((driver) => (
              <Grid size={{ xs: 12, sm: 6 }} key={driver.id}>
                <Card
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    boxShadow: 3,
                    transition: "0.3s",
                    "&:hover": { transform: "scale(1.05)", boxShadow: 6 },
                  }}
                >
                  <CardContent sx={{ display: "flex", alignItems: "center" }}>
                    <Box>
                      <Typography variant="h6">{driver.driverName}</Typography>
                      <Typography variant="body2">
                        <LocationOn sx={{ verticalAlign: "middle", fontSize: 18, mr: 1 }} />
                        Departs from: <strong>{driver.location}</strong>
                      </Typography>
                      <Typography variant="body2">
                        <AccessTime sx={{ verticalAlign: "middle", fontSize: 18, mr: 1 }} />
                        Leaves at: <strong>{driver.time}</strong>
                      </Typography>
                      <Typography variant="body2">
                        🚦 Pickup Stops: <strong>{driver.pickup ? "Yes" : "No"}</strong>
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardContent>
                    <Typography variant="body2">
                      <People sx={{ verticalAlign: "middle", fontSize: 18, mr: 1 }} />
                      Seats Available: <strong>{driver.seats}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      👥 Passengers:
                      {driver.passengers?.length ?? 0 > 0 ? (
                        <strong> {driver.passengers.join(", ")}</strong>
                      ) : (
                        <strong> No passengers yet</strong>
                      )}

                    </Typography>
                  </CardContent>

                  <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <IconButton href={`tel:${driver.driverPhone}`} color="primary">
                        <Phone />
                      </IconButton>
                    </Box>
                    <Button variant="contained" color="error" startIcon={<Delete />} onClick={() => handleCancelRide(driver)}>
                      Cancel Ride
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Box>

      {/* Confirm Ride Cancellation Dialog */}
      <Dialog open={confirmCancel} onClose={() => setConfirmCancel(false)}>
        <DialogTitle>Cancel Your Ride</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel <strong>{selectedDriver?.driverName}'s</strong> ride?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCancel(false)}>No</Button>
          <Button variant="contained" color="error" onClick={confirmCancelRide}>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
