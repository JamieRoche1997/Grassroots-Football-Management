import Stack from "@mui/material/Stack";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import MainGrid from "./components/MainGrid";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { CircularProgress, Box, Typography, Button } from "@mui/material";

export default function Dashboard() {
  const { clubName, ageGroup, division, loading, name, role } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [waitingTime, setWaitingTime] = useState(0);

  // Log auth state for debugging
  useEffect(() => {
    console.log("Dashboard: Auth state", { clubName, ageGroup, division, loading, name, role });
  }, [clubName, ageGroup, division, loading, name, role]);

  // Force a re-render when Dashboard component mounts
  // or when user membership info changes
  useEffect(() => {
    // Proceed if we have the essential data (club, age group, division)
    // Don't make role mandatory as it might not be available immediately
    if (clubName && ageGroup && division) {
      console.log("Dashboard: Essential data is available, showing content");
      // Set a small delay to ensure the context is fully propagated
      setTimeout(() => setIsReady(true), 300);
    } else {
      setIsReady(false);
    }
  }, [clubName, ageGroup, division]);
  
  // Add a timer to track how long we've been waiting
  useEffect(() => {
    if (loading && !isReady) {
      const timer = setInterval(() => {
        setWaitingTime(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [loading, isReady]);
  
  // Force show after 5 seconds even if role is missing
  useEffect(() => {
    if (waitingTime > 5 && clubName && ageGroup && division) {
      console.log("Dashboard: Timeout reached, forcing display even without role");
      setIsReady(true);
    }
  }, [waitingTime, clubName, ageGroup, division]);

  // If loading for too long, show a manual refresh button
  const handleManualRefresh = () => {
    window.location.reload();
  };

  if (loading || !isReady) {
    return (
      <Layout>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            mt: 8
          }}
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading your dashboard...
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Club: {clubName || 'Loading...'} <br />
            Role: {role || 'Loading...'}
          </Typography>
          
          {waitingTime > 10 && (
            <Button 
              variant="contained" 
              onClick={handleManualRefresh}
              sx={{ mt: 3 }}
            >
              Refresh Now
            </Button>
          )}
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Stack
        spacing={2}
        sx={{
          alignItems: "center",
          pb: 5,
          mt: { xs: 8, md: 0 },
        }}
      >
        <Header />
        <MainGrid />
      </Stack>
    </Layout>
  );
}
