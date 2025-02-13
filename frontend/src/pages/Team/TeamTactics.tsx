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
import Grid from '@mui/material/Grid2';
import { fetchPlayers } from '../../services/team_management';
import { format } from 'date-fns';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { fetchMatches, saveTactics } from '../../services/schedule_management';

interface Player {
  name: string;
  position: string;
  uid: string;
}

interface Match {
  matchId: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
}

const formations = [
  { label: '3-6-1', positions: [3, 6, 1] },  // Overloads midfield with one striker
  { label: '3-5-2', positions: [3, 5, 2] },  // Midfield-heavy, wingbacks push forward
  { label: '3-4-3', positions: [3, 4, 3] },  // Balanced press with wide attackers
  { label: '3-4-1-2', positions: [3, 4, 1, 2] },  // Creative attacking midfield
  { label: '3-3-3-1', positions: [3, 3, 3, 1] },  // Pressing system with attacking midfield
  { label: '3-2-5', positions: [3, 2, 5] },  // Heavy attacking overload
  { label: '3-3-4', positions: [3, 3, 4] },  // High offensive intent

  { label: '4-6-0', positions: [4, 6, 0] },  // Strikerless, fluid attack
  { label: '4-5-1', positions: [4, 5, 1] },  // Defensive midfield block
  { label: '4-4-2', positions: [4, 4, 2] },  // Classic balance
  { label: '4-4-1-1', positions: [4, 4, 1, 1] },  // More attacking than 4-4-2
  { label: '4-3-3', positions: [4, 3, 3] },  // Modern pressing and attacking football
  { label: '4-3-2-1', positions: [4, 3, 2, 1] },  // "Christmas Tree" formation
  { label: '4-2-4', positions: [4, 2, 4] },  // Heavy attacking, used in classic Brazil teams
  { label: '4-2-3-1', positions: [4, 2, 3, 1] },  // Flexible, common modern shape
  { label: '4-2-2-2', positions: [4, 2, 2, 2] },  // Compact with dual strikers
  { label: '4-1-4-1', positions: [4, 1, 4, 1] },  // Defensive pivot, counterattacks
  { label: '4-1-3-2', positions: [4, 1, 3, 2] },  // Midfield-heavy, attacking duo
  { label: '4-3-1-2', positions: [4, 3, 1, 2] },  // Midfield diamond, narrow attacks

  { label: '5-4-1', positions: [5, 4, 1] },  // Defensive wall, limited attack
  { label: '5-3-2', positions: [5, 3, 2] },  // Wingbacks push, defensive core
  { label: '5-2-3', positions: [5, 2, 3] },  // Balance between attack and defense
  { label: '5-2-2-1', positions: [5, 2, 2, 1] },  // Defensive with counter-attacking wide players
];

  
export default function TeamTactics() {
  const { clubName, ageGroup, division, loading: authLoading } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFormation, setSelectedFormation] = useState(formations[0]);
  const [assignedPlayers, setAssignedPlayers] = useState<{ [position: string]: string }>({});
  const [strategyNotes, setStrategyNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingMatches = async () => {
      if (authLoading) return;

      if (!clubName || !ageGroup || !division) {
        setError('Club information is incomplete.');
        setLoading(false);
        return;
      }

      try {
        const currentMonth = format(new Date(), 'yyyy-MM');
        const allMatches = await fetchMatches(currentMonth, clubName, ageGroup, division);

        // Filter matches to only show upcoming matches (after today's date)
        const upcomingMatches = allMatches.filter((match: Match) => new Date(match.date) > new Date());

        setMatches(upcomingMatches);
        setError(null);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setError('Failed to load matches. Please try again later.');
      }
    };

    fetchUpcomingMatches();
  }, [authLoading, clubName, ageGroup, division]);

  useEffect(() => {
    const fetchPlayersForMatch = async () => {
      if (authLoading) return;

      if (!clubName || !ageGroup || !division) {
        setError('Club information is incomplete.');
        setLoading(false);
        return;
      }

      try {
        const playersData = await fetchPlayers(clubName, ageGroup, division);
        setPlayers(playersData);
        setError(null);
      } catch (error) {
        console.error('Error fetching players:', error);
        setError('Failed to load players. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchPlayersForMatch();
    }
  }, [authLoading, selectedMatch, clubName, ageGroup, division]);

  const handleFormationChange = (event: SelectChangeEvent) => {
    const newFormation = formations.find((f) => f.label === event.target.value);
    if (newFormation) setSelectedFormation(newFormation);
  };

  const handlePlayerAssign = (position: string, playerUid: string) => {
    setAssignedPlayers((prev) => ({ ...prev, [position]: playerUid }));
  };

const handleSaveTactics = async () => {
    if (!selectedMatch) {
        alert('Please select a match before saving tactics.');
        return;
    }

    const tacticsData = {
        matchId: selectedMatch.matchId,
        formation: selectedFormation.label,
        assignedPlayers,
        strategyNotes,
    };

    try {
        console.log('Saving tactics:', tacticsData);
        await saveTactics(tacticsData);
        alert('Tactics saved successfully!');
    } catch (error) {
        console.error('Error saving tactics:', error);
        alert('Failed to save tactics. Please try again.');
    }
};

  if (authLoading || loading) {
    return (
      <Layout>
        <Header />
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Header />
        <Box sx={{ p: 3 }}>
          <Typography color="error" variant="h6">{error}</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Team Tactics
        </Typography>

        {/* Match Selection Dropdown */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Select Match</Typography>
          <Select
            fullWidth
            displayEmpty
            value={selectedMatch?.matchId || ''}
            onChange={(e) => setSelectedMatch(matches.find((m) => m.matchId === e.target.value) || null)}
          >
            <MenuItem value="" disabled>Select a match</MenuItem>
            {matches.map((match) => (
              <MenuItem key={match.matchId} value={match.matchId}>
                {match.homeTeam} vs {match.awayTeam} - {format(new Date(match.date), 'MMMM d, yyyy')}
              </MenuItem>
            ))}
          </Select>
        </Box>

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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            minHeight: '60vh',
            backgroundImage: 'url(/football_pitch.png)', // Add a football pitch background
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            p: 2,
          }}
        >
          {selectedFormation.positions.map((count, rowIndex) => (
            <Grid
              container
              key={rowIndex}
              justifyContent="center"
              spacing={2}
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                mb: 3, // ✅ Adds space between rows
              }}
            >
              {Array.from({ length: count }).map((_, positionIndex) => {
                const positionKey = `${rowIndex}-${positionIndex}`;

                return (
                  <Grid
                    size={{ xs: 12 / count}} 
                    key={positionKey}
                    sx={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}
                  >
                    <Card
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        backgroundColor: '#f0f0f0',
                        minWidth: 120,
                        width: '100%', 
                        maxWidth: 250, 
                        height: 100, 
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
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

        </Box>

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
