import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Typography, Box, Card, CardContent } from '@mui/material';
import { fetchPlayers } from '../../services/team_management';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Player {
  name: string;
  dob: string;
  position: string;
  uid: string;
}

const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function PlayerProfile() {
  const { playerUid } = useParams(); // Access player UID from URL params
  const { state } = useLocation(); // Access passed state
  const [player, setPlayer] = useState<Player | null>(state?.player || null); // Set initial player from state
  const [loading, setLoading] = useState<boolean>(!state?.player); // Only load if no player is passed through state

  // Fallback fetch in case player is accessed via direct URL
  useEffect(() => {
    const fetchPlayerByUid = async () => {
      if (!player && playerUid) {
        try {
          // Fetch players and find the one matching the UID
          const players = await fetchPlayers('Cobh Ramblers', 'Professional', 'Division Premier');
          const foundPlayer = players.find((p) => p.uid === playerUid);
          setPlayer(foundPlayer || null);
        } catch (error) {
          console.error('Error fetching player details:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPlayerByUid();
  }, [player, playerUid]);

  if (loading) {
    return (
      <Layout>
        <Header />
        <LoadingSpinner />
      </Layout>
    );
  }

  if (!player) {
    return (
      <Layout>
        <Header />
        <Typography variant="h5" sx={{ p: 3 }}>
          Player not found.
        </Typography>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <Box sx={{ p: 3 }}>
        <Card sx={{ p: 3 }}>
          <CardContent>
            <Typography variant="h4">{player.name}</Typography>
            <Typography variant="body1">Position: {player.position}</Typography>
            <Typography variant="body1">Age: {calculateAge(player.dob)}</Typography>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
}
