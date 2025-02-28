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
  Divider,
  ListSubheader,
  Chip,
  Tooltip,
  Paper,
  Stack,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SaveIcon from '@mui/icons-material/Save';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
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


export default function TeamLineups() {
  const { clubName, ageGroup, division, loading: authLoading } = useAuth();
  const positionOrder = ["Goalkeeper", "Defender", "Midfielder", "Forward"];
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFormation, setSelectedFormation] = useState<keyof typeof formations>('4-4-2');
  const [assignedPlayers, setAssignedPlayers] = useState<{ [position: string]: string }>({});
  const [substitutes, setSubstitutes] = useState<string[]>([]); 
  const [strategyNotes, setStrategyNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const assignedPlayerEmails = new Set(Object.values(assignedPlayers)); 
  const availableSubstitutes = players.filter(player => !assignedPlayerEmails.has(player.email));

  useEffect(() => {
    const fetchAllMatchesForYear = async () => {
      if (authLoading) return;
  
      if (!clubName || !ageGroup || !division) {
        setError('Club information is incomplete.');
        setLoading(false);
        return;
      }
  
      try {
        const currentYear = format(new Date(), 'yyyy'); // Get current year
        let allMatches: Match[] = [];
  
        // Loop through all months from January (1) to December (12)
        for (let month = 1; month <= 12; month++) {
          const formattedMonth = `${currentYear}-${month.toString().padStart(2, '0')}`;
          const matches = await fetchMatches(formattedMonth, clubName, ageGroup, division);
  
          if (matches && matches.length > 0) {
            allMatches = [...allMatches, ...matches];
          }
        }
  
        setMatches(allMatches); // Store all matches for the year
        setError(null);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setError('Failed to load matches. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchAllMatchesForYear();
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

  const handleAddSubstitute = (playerEmail: string) => {
    if (!substitutes.includes(playerEmail) && substitutes.length < 10) {
      setSubstitutes([...substitutes, playerEmail]);
    }
  };

  const handleRemoveSubstitute = (playerEmail: string) => {
    setSubstitutes(substitutes.filter((sub) => sub !== playerEmail));
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
  
    // ✅ Convert substitutes into individual fields: { Sub1: "player1", Sub2: "player2" }
    const substituteEntries = substitutes.reduce((acc, playerEmail, index) => {
      acc[`Sub${index + 1}`] = playerEmail;
      return acc;
    }, {} as { [key: string]: string });
  
    // ✅ Assign substitutes inside the home or away lineup
    const teamLineup = { ...assignedPlayers, ...substituteEntries };
  
    // ✅ Dynamically assign home or away lineup
    const matchData: MatchData = {
      matchId: selectedMatch.matchId,
      homeTeam: selectedMatch.homeTeam,
      awayTeam: selectedMatch.awayTeam,
      date: selectedMatch.date,
      formation: selectedFormation,
      strategyNotes,
      ...(isHomeTeam ? { homeTeamLineup: teamLineup } : { awayTeamLineup: teamLineup }),
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

  function getPlayerName(playerEmail: string): string {
    const player = players.find(p => p.email === playerEmail);
    return player ? player.name : 'Unknown Player';
  }
  return (
    <Layout>
      <Header />
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: 1200, mx: "auto" }}>
        <Typography variant="h4" component="h1" fontWeight={600} sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <SportsSoccerIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          Team Lineups
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSaveSuccess(false)}>
            Match data saved successfully!
          </Alert>
        )}

        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>
            Match Details
          </Typography>
          
          <Select
            fullWidth
            displayEmpty
            value={selectedMatch?.matchId || ''}
            onChange={(e) => setSelectedMatch(matches.find((m) => m.matchId === e.target.value) || null)}
            sx={{ mb: 3 }}
          >
            <MenuItem value="" disabled>Select a match</MenuItem>
            {matches.map((match) => (
              <MenuItem key={match.matchId} value={match.matchId}>
                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">{match.homeTeam} vs {match.awayTeam}</Typography>
                  <Chip 
                    size="small" 
                    label={format(new Date(match.date), 'MMM d, yyyy')} 
                    sx={{ ml: 2 }}
                  />
                </Box>
              </MenuItem>
            ))}
          </Select>

          <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
            Formation
          </Typography>
          <Select
            value={selectedFormation}
            onChange={handleFormationChange}
            sx={{ width: '100%', mb: 2 }}
          >
            {Object.keys(formations).map((formation) => (
              <MenuItem key={formation} value={formation}>
                {formation}
              </MenuItem>
            ))}
          </Select>
        </Paper>

        {/* Field and lineup visualization */}
        <Paper 
          elevation={3} 
          sx={{
            mb: 4,
            overflow: 'hidden',
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              minHeight: '60vh',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              p: 3,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0,
              }
            }}
          >
            {formations[selectedFormation].map((row, rowIndex) => (
              <Grid
                key={rowIndex}
                container
                spacing={isMobile ? 1 : 2}
                justifyContent="center"
                sx={{ width: '100%', mb: 3, position: 'relative', zIndex: 1 }}
              >
                {row.map((position, positionIndex) => {
                  const positionKey = `${position}-${rowIndex}-${positionIndex}`;
                  const assignedPlayer = players.find(p => p.email === assignedPlayers[positionKey]);

                  return (
                    <Grid key={positionKey} sx={{ textAlign: 'center' }}>
                      <Card
                        sx={{
                          p: 1.5,
                          textAlign: 'center',
                          minWidth: isMobile ? 120 : 150,
                          width: '100%',
                          height: isMobile ? 80 : 100,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 2,
                          boxShadow: 3,
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 6,
                          },
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={600} sx={{ 
                          color: 'primary.main',
                          mb: 0.5
                        }}>
                          {position}
                        </Typography>
                        
                        <Select
                          fullWidth
                          displayEmpty
                          value={assignedPlayers[positionKey] || ""}
                          onChange={(e) => handlePlayerAssign(positionKey, e.target.value)}
                          size={isMobile ? "small" : "medium"}
                          sx={{ 
                            '.MuiOutlinedInput-notchedOutline': { 
                              borderColor: assignedPlayer ? 'transparent' : 'inherit',
                            },
                            backgroundColor: assignedPlayer ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                            borderRadius: 1.5
                          }}
                        >
                          <MenuItem value="">
                            <Typography variant="body2" color="text.secondary">
                              Select Player
                            </Typography>
                          </MenuItem>

                          {positionOrder.flatMap((posCategory, index) => {
                            const groupedPlayers = players.filter(player => player.position === posCategory);
                            if (groupedPlayers.length === 0) return [];

                            return [
                              index > 0 && <Divider key={`divider-${posCategory}`} />,
                              <ListSubheader key={`header-${posCategory}`}>{posCategory}</ListSubheader>,
                              ...groupedPlayers.map((player) => (
                                <MenuItem key={player.email} value={player.email}>
                                  {player.name}
                                </MenuItem>
                              ))
                            ];
                          })}
                        </Select>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ))}
          </Box>
        </Paper>

        {/* Substitutes Selection */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={500} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            Substitutes ({substitutes.length}/10)
          </Typography>
          
          {substitutes.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
              {substitutes.map((playerEmail) => (
                <Chip
                  key={playerEmail}
                  label={getPlayerName(playerEmail)}
                  onDelete={() => handleRemoveSubstitute(playerEmail)}
                  color="primary"
                  variant="outlined"
                  deleteIcon={<PersonRemoveIcon />}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          )}
          
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Available Players
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {availableSubstitutes.map((player) => (
              <Chip
                key={player.email}
                label={player.name}
                onClick={() => handleAddSubstitute(player.email)}
                icon={<PersonAddIcon />}
                disabled={substitutes.length >= 10}
                variant="outlined"
                clickable
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        </Paper>

        {/* Strategy Notes */}
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>
            Strategy Notes
          </Typography>
          <TextField
            fullWidth
            value={strategyNotes}
            onChange={(e) => setStrategyNotes(e.target.value)}
            placeholder="Enter your strategy and tactical notes here..."
          />
        </Paper>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title={!selectedMatch ? "Please select a match first" : ""}>
            <span>
              <Button 
                variant="contained" 
                size="large"
                onClick={handleSaveMatchData}
                disabled={!selectedMatch}
                startIcon={<SaveIcon />}
                sx={{ 
                  mt: 3,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: 4,
                  '&:hover': {
                    boxShadow: 6,
                  }
                }}
              >
                Save Lineup
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Layout>
  );
}