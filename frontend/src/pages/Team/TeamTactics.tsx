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
import { fetchMatches, saveMatchData } from '../../services/schedule_management';

interface Player {
  email: string;
  name: string;
  position: string;
  uid: string;
}

export interface MatchData {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  formation: keyof typeof formations;
  strategyNotes?: string;
  homeTeamLineup?: { [position: string]: string }; // Optional because away teams won't send this
  awayTeamLineup?: { [position: string]: string }; // Optional because home teams won't send this
}

interface Match {
  matchId: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
}

const formations = {
  '5-4-1': [
    ['GK'],
    ['RWB', 'CB', 'CB', 'CB', 'LWB'], // 5 defenders
    ['RM', 'CM', 'CM', 'LM'], // 4 midfielders
    ['ST'], // 1 striker
  ], // Total: 10 outfield players

  '5-3-2': [
    ['GK'],
    ['RWB', 'CB', 'CB', 'CB', 'LWB'], // 5 defenders
    ['CM', 'CM', 'CM'], // 3 midfielders
    ['ST', 'ST'], // 2 strikers
  ], // Total: 10 outfield players

  '4-5-1': [
    ['GK'],
    ['RB', 'CB', 'CB', 'LB'], // 4 defenders
    ['CDM'], // 1 defensive mid
    ['RM', 'CM', 'CM', 'LM'], // 4 midfielders
    ['ST'], // 1 striker
  ], // Total: 10 outfield players

  '4-4-2': [
    ['GK'],
    ['RB', 'CB', 'CB', 'LB'], // 4 defenders
    ['RM', 'CM', 'CM', 'LM'], // 4 midfielders
    ['ST', 'ST'], // 2 strikers
  ], // Total: 10 outfield players

  '4-1-4-1': [
    ['GK'],
    ['RB', 'CB', 'CB', 'LB'], // 4 defenders
    ['CDM'], // 1 defensive mid
    ['RM', 'CM', 'CM', 'LM'], // 4 midfielders
    ['ST'], // 1 striker
  ], // Total: 10 outfield players

  '4-3-3': [
    ['GK'],
    ['RB', 'CB', 'CB', 'LB'], // 4 defenders
    ['CM', 'CM', 'CM'], // 3 midfielders
    ['RW', 'ST', 'LW'], // 3 forwards
  ], // Total: 10 outfield players

  '4-3-2-1': [
    ['GK'],
    ['RB', 'CB', 'CB', 'LB'], // 4 defenders
    ['CM', 'CDM', 'CM'], // 3 midfielders
    ['CAM', 'CAM'], // 2 attacking mids
    ['ST'], // 1 striker
  ], // Total: 10 outfield players

  '4-2-3-1': [
    ['GK'],
    ['RB', 'CB', 'CB', 'LB'], // 4 defenders
    ['CDM', 'CDM'], // 2 defensive mids
    ['RW', 'CAM', 'LW'], // 3 attacking mids
    ['ST'], // 1 striker
  ], // Total: 10 outfield players

  '4-2-2-2': [
    ['GK'],
    ['RB', 'CB', 'CB', 'LB'], // 4 defenders
    ['CDM', 'CDM'], // 2 defensive mids
    ['CAM', 'CAM'], // 2 attacking mids
    ['ST', 'ST'], // 2 strikers
  ], // Total: 10 outfield players

  '3-6-1': [
    ['GK'],
    ['CB', 'CB', 'CB'], // 3 defenders
    ['RWB', 'CM', 'CDM', 'CM', 'LWB'], // 5 midfielders
    ['CAM'], // 1 attacking mid
    ['ST'], // 1 striker
  ], // Total: 10 outfield players

  '3-5-2': [
    ['GK'],
    ['CB', 'CB', 'CB'], // 3 defenders
    ['RWB', 'CM', 'CDM', 'CM', 'LWB'], // 5 midfielders
    ['ST', 'ST'], // 2 strikers
  ], // Total: 10 outfield players

  '3-4-3': [
    ['GK'],
    ['CB', 'CB', 'CB'], // 3 defenders
    ['RWB', 'CM', 'CM', 'LWB'], // 4 midfielders
    ['RW', 'ST', 'LW'], // 3 forwards
  ], // Total: 10 outfield players

  '3-4-1-2': [
    ['GK'],
    ['CB', 'CB', 'CB'], // 3 defenders
    ['RWB', 'CM', 'CM', 'LWB'], // 4 midfielders
    ['CAM'], // 1 attacking mid
    ['ST', 'ST'], // 2 strikers
  ], // Total: 10 outfield players

  '3-3-4': [
    ['GK'],
    ['CB', 'CB', 'CB'], // 3 defenders
    ['CM', 'CM', 'CM'], // 3 midfielders
    ['RW', 'ST', 'ST', 'LW'], // 4 forwards
  ], // Total: 10 outfield players

  '3-2-5': [
    ['GK'],
    ['CB', 'CB', 'CB'], // 3 defenders
    ['CDM', 'CDM'], // 2 midfielders
    ['RW', 'CAM', 'ST', 'CAM', 'LW'], // 5 attackers
  ], // Total: 10 outfield players
};


export default function TeamTactics() {
  const { clubName, ageGroup, division, loading: authLoading } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFormation, setSelectedFormation] = useState<keyof typeof formations>('4-4-2');
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
    const newFormation = event.target.value as keyof typeof formations;
    setSelectedFormation(newFormation);
  };

  const handlePlayerAssign = (position: string, playerEmail: string) => {
    setAssignedPlayers((prev) => ({ ...prev, [position]: playerEmail }));
  };  

  const handleSaveMatchData = async () => {
    if (!selectedMatch) {
      alert('Please select a match before saving.');
      return;
    }
  
    const userTeam = clubName;
    const isHomeTeam = selectedMatch.homeTeam === userTeam;
    const isAwayTeam = selectedMatch.awayTeam === userTeam;
  
    if (!isHomeTeam && !isAwayTeam) {
      alert("You are not a coach for either of the teams in this match.");
      return;
    }
  
    // Dynamically assign home or away lineup
    const matchData: MatchData = {
      matchId: selectedMatch.matchId,
      homeTeam: selectedMatch.homeTeam,
      awayTeam: selectedMatch.awayTeam,
      date: selectedMatch.date,
      formation: selectedFormation,
      strategyNotes,
      ...(isHomeTeam ? { homeTeamLineup: assignedPlayers } : { awayTeamLineup: assignedPlayers }),
    };
  
    try {
      console.log('Saving match data:', matchData);
      await saveMatchData(matchData);
      alert('Match data saved successfully!');
    } catch (error) {
      console.error('Error saving match data:', error);
      alert('Failed to save match data. Please try again.');
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

        {/* Formation Selection */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Select Formation</Typography>
        <Select
          value={selectedFormation}
          onChange={handleFormationChange}
          sx={{ width: 200, mb: 2 }}
        >
          {Object.keys(formations).map((formation) => (
            <MenuItem key={formation} value={formation}>
              {formation}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Formation Grid Display */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          minHeight: '60vh',
          backgroundImage: 'url(/football_pitch.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          p: 2,
        }}
      >
        {formations[selectedFormation].map((row, rowIndex) => (
          <Grid
            key={rowIndex}
            container
            spacing={2}
            justifyContent="center"
            sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 3 }}
          >
            {row.map((position, positionIndex) => (
              <Grid key={positionIndex} sx={{ textAlign: 'center' }}>
                <Card
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    backgroundColor: '#f0f0f0',
                    minWidth: 200,
                    width: '100%',
                    maxWidth: 150,
                    height: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {position}
                  </Typography>
                  <Select
                    fullWidth
                    displayEmpty
                    value={assignedPlayers[position] || ''}
                    onChange={(e) => handlePlayerAssign(position, e.target.value)}
                    sx={{ mt: 1 }}
                  >
                    <MenuItem value="">Select Player</MenuItem>
                    {players.map((player) => (
                      <MenuItem key={player.email} value={player.email}>
                        {player.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Card>
              </Grid>
            ))}
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
        <Button variant="contained" onClick={handleSaveMatchData}>
          Save Tactics
        </Button>
      </Box>
    </Layout>
  );
}
