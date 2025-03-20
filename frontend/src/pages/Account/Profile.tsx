import Stack from '@mui/material/Stack';
import Header from '../../components/Header';
import Layout from '../../components/Layout';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { useEffect, useState } from "react";
import { useAuth } from '../../hooks/useAuth';
import { getPlayerStats, PlayerStats } from '../../services/player_stats';
import { getMembershipInfo } from '../../services/membership';

export default function Profile() {
  const { user, clubName, ageGroup, division } = useAuth();
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoleAndStats = async () => {
      if (!clubName || !ageGroup || !division || !user?.email) {
        setLoading(false);
        return;
      }

      try {
        // ✅ Fetch user membership info (includes role)
        const membershipInfo = await getMembershipInfo(clubName, ageGroup, division, user.email);

        if (membershipInfo) {
          setUserRole(membershipInfo.role);  // ✅ Set user role

          // ✅ Only fetch player stats if user is a player
          if (membershipInfo.role === "player") {
            const stats = await getPlayerStats(clubName, ageGroup, division, user.email);
            setPlayerStats(stats);
          }
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error fetching membership info or player stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoleAndStats();
  }, [clubName, ageGroup, division, user]);

  return (
    <Layout>
      <Stack
        spacing={2}
        sx={{
          alignItems: 'center',
          pb: 5,
          mt: { xs: 8, md: 0 },
        }}
      >
        <Header />
        <Box sx={{ width: '100%', maxWidth: 600, textAlign: 'center' }}>
          {/* Profile Avatar and Name */}
          <Avatar sx={{ width: 100, height: 100, margin: 'auto' }} />
          <Typography variant="h5" sx={{ mt: 1 }}>{user?.displayName}</Typography>
          <Typography variant="body1" color="text.secondary">{user?.email}</Typography>

          {/* Team Affiliation */}
          <Typography variant="h6" sx={{ mt: 2 }}>Team: {clubName}</Typography>
          <Typography variant="body2">Age Group: {ageGroup}</Typography>
          <Typography variant="body2">Division: {division}</Typography>

        <Divider sx={{ my: 2 }} />

          {/* Loading Indicator */}
          {loading && <Typography variant="body2" color="text.secondary">Loading player stats...</Typography>}

          {/* Player Stats - Only show if user is a player */}
          {!loading && userRole === "player" && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Performance Stats</Typography>
              <Typography variant="body2">Games Played: {playerStats?.gamesPlayed ?? 0}</Typography>
              <Typography variant="body2">Goals: {playerStats?.goals ?? 0}</Typography>
              <Typography variant="body2">Assists: {playerStats?.assists ?? 0}</Typography>
              <Typography variant="body2">Yellow Cards: {playerStats?.yellowCards ?? 0}</Typography>
              <Typography variant="body2">Red Cards: {playerStats?.redCards ?? 0}</Typography>
            </>
          )}

          {/* Message for Non-Players */}
          {!loading && userRole && userRole !== "player" && (
            <Typography variant="body2" color="text.secondary">
              Player statistics are only available for registered players.
            </Typography>
          )}
        </Box>
      </Stack>
    </Layout>
  );
}
