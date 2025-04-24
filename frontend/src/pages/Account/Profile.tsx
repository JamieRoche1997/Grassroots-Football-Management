import Stack from "@mui/material/Stack";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getPlayerStats, PlayerStats } from "../../services/player_stats";
import { getMembershipInfo } from "../../services/membership";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";

export default function Profile() {
  const { user, clubName, ageGroup, division } = useAuth();
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRoleAndStats = async () => {
      if (!clubName || !ageGroup || !division || !user?.email) {
        setLoading(false);
        return;
      }

      setError(null);
      setLoading(true);
      
      try {
        // Fetch user membership info (includes role)
        const membershipInfo = await getMembershipInfo(
          clubName,
          ageGroup,
          division,
          user.email
        );

        if (membershipInfo) {
          setUserRole(membershipInfo.role); // Set user role

          // Only fetch player stats if user is a player
          if (membershipInfo.role === "player") {
            try {
              const stats = await getPlayerStats(
                clubName,
                ageGroup,
                division,
                user.email
              );
              setPlayerStats(stats);
            } catch (statsError) {
              console.error("Error fetching player stats:", statsError);
              setError("Failed to load player statistics. Please try again later.");
            }
          }
        } else {
          setUserRole(null);
          setError("No membership information found for this user.");
        }
      } catch (error) {
        console.error("Error fetching membership info:", error);
        setError("Failed to load membership information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoleAndStats();
  }, [clubName, ageGroup, division, user]);

  const renderProfileContent = () => {
    if (loading) {
      return (
        <Box sx={{ width: "100%", textAlign: "center", py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Loading profile data...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      );
    }

    if (!clubName || !ageGroup || !division) {
      return (
        <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
          You are not currently associated with any team. Please update your team information.
        </Alert>
      );
    }

    return (
      <>
        {/* Team Affiliation */}
        <Typography variant="h6" sx={{ mt: 2 }}>
          Team: {clubName}
        </Typography>
        <Typography variant="body2">Age Group: {ageGroup}</Typography>
        <Typography variant="body2">Division: {division}</Typography>

        <Divider sx={{ my: 2 }} />

        {/* Player Stats - Only show if user is a player */}
        {userRole === "player" && (
          <>
            <Typography variant="h6">Performance Stats</Typography>
            {playerStats ? (
              <>
                <Typography variant="body2">
                  Games Played: {playerStats.gamesPlayed ?? 0}
                </Typography>
                <Typography variant="body2">
                  Goals: {playerStats.goals ?? 0}
                </Typography>
                <Typography variant="body2">
                  Assists: {playerStats.assists ?? 0}
                </Typography>
                <Typography variant="body2">
                  Yellow Cards: {playerStats.yellowCards ?? 0}
                </Typography>
                <Typography variant="body2">
                  Red Cards: {playerStats.redCards ?? 0}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No statistics available yet.
              </Typography>
            )}
          </>
        )}

        {/* Message for Non-Players */}
        {userRole && userRole !== "player" && (
          <Typography variant="body2" color="text.secondary">
            Player statistics are only available for registered players.
          </Typography>
        )}
      </>
    );
  };

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
        <Box sx={{ width: "100%", maxWidth: 600, textAlign: "center" }}>
          {/* Profile Avatar and Name */}
          {loading ? (
            <>
              <Skeleton variant="circular" width={100} height={100} sx={{ margin: "auto" }} />
              <Skeleton variant="text" width={200} sx={{ margin: "auto", mt: 1 }} />
              <Skeleton variant="text" width={250} sx={{ margin: "auto" }} />
            </>
          ) : (
            <>
              <Avatar sx={{ width: 100, height: 100, margin: "auto" }} />
              <Typography variant="h5" sx={{ mt: 1 }}>
                {user?.displayName || "User"}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user?.email || "No email available"}
              </Typography>
            </>
          )}

          <Divider sx={{ my: 2 }} />
          
          {renderProfileContent()}
        </Box>
      </Stack>
    </Layout>
  );
}
