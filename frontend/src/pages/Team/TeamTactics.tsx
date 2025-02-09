import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  Card,
  TextField,
  SelectChangeEvent,
} from '@mui/material';
import Grid from '@mui/material/Grid2'; // Correct import for Grid2
import { fetchPlayers } from '../../services/team_management';
import { getClubInfo } from '../../services/user_management';
import { auth } from '../../services/firebaseConfig';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Player {
  name: string;
  position: string;
  uid: string;
}

const formations = [
  { label: '4-4-2', positions: [4, 4, 2] },
  { label: '4-3-3', positions: [4, 3, 3] },
  { label: '3-5-2', positions: [3, 5, 2] },
  { label: '4-2-3-1', positions: [4, 2, 3, 1] },
];

export default function TeamTactics() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFormation, setSelectedFormation] = useState(formations[0]);
  const [assignedPlayers, setAssignedPlayers] = useState<{ [position: string]: string }>({});
  const [strategyNotes, setStrategyNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user || !user.email) {
          console.error('No authenticated user found');
          return;
        }

        const { clubName, ageGroup, division } = await getClubInfo(user.email);
        if (!clubName || !ageGroup || !division) {
          console.error('Club information is incomplete');
          return;
        }

        const playersData = await fetchPlayers(clubName, ageGroup, division);
        setPlayers(playersData);
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFormationChange = (event: SelectChangeEvent) => {
    const newFormation = formations.find((f) => f.label === event.target.value);
    if (newFormation) setSelectedFormation(newFormation);
  };

  const handlePlayerAssign = (position: string, playerUid: string) => {
    setAssignedPlayers((prev) => ({ ...prev, [position]: playerUid }));
  };

  const handleSaveTactics = () => {
    const tacticsData = {
      formation: selectedFormation.label,
      assignedPlayers,
      strategyNotes,
    };

    console.log('Saving tactics:', tacticsData);
    // Call the backend service to save the tactics data (Firestore or appropriate service)
  };

  if (loading) {
    return (
      <Layout>
        <Header />
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Team Tactics
        </Typography>

        {/* Formation Selector */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Select Formation</Typography>
          <Select
            value={selectedFormation.label}
            onChange={handleFormationChange}
            sx={{ width: 200, mb: 2 }}
          >
            {formations.map((formation) => (
              <MenuItem key={formation.label} value={formation.label}>
                {formation.label}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Formation Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {selectedFormation.positions.map((count, rowIndex) => (
            <Grid container spacing={2} justifyContent="center" key={rowIndex}>
              {Array.from({ length: count }).map((_, positionIndex) => {
                const positionKey = `${rowIndex}-${positionIndex}`;

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={positionKey}>
                    <Card
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        backgroundColor: '#f0f0f0',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Position {rowIndex + 1}-{positionIndex + 1}
                      </Typography>
                      <Select
                        fullWidth
                        displayEmpty
                        value={assignedPlayers[positionKey] || ''}
                        onChange={(e) => handlePlayerAssign(positionKey, e.target.value)}
                        sx={{ mt: 1 }}
                      >
                        <MenuItem value="">Select Player</MenuItem>
                        {players.map((player) => (
                          <MenuItem key={player.uid} value={player.uid}>
                            {player.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ))}
        </Grid>

        {/* Strategy Notes */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Strategy Notes</Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={strategyNotes}
            onChange={(e) => setStrategyNotes(e.target.value)}
          />
        </Box>

        {/* Save Button */}
        <Button variant="contained" onClick={handleSaveTactics}>
          Save Tactics
        </Button>
      </Box>
    </Layout>
  );
}
