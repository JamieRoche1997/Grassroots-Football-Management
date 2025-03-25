import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { 
  Box, Card, CardContent, Typography, TextField, Button, 
  Select, MenuItem, ListSubheader, Chip, Avatar, Stack, 
  useTheme, styled, alpha, Grid2 as Grid
} from '@mui/material';
import { Theme } from '@mui/material/styles';
import { 
  AddCircleOutline, 
  SportsSoccer,
  Event,
  Score,
  EmojiEvents,
  Group,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { getMembershipsForTeam } from '../../services/membership';
import { getFixtureById } from '../../services/schedule_management';
import { getEvents, addEvent, getLineups } from '../../services/match_management';
import { saveResult } from '../../services/match_management';
import { fetchPlayerRatings, submitPlayerRating } from '../../services/match_management';
import { updatePlayerStats } from '../../services/player_stats';

// Styled Components
const MatchCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  marginBottom: theme.spacing(3)
}));

const EventCard = styled(Card)(({ theme }) => ({
  borderRadius: 8,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  marginBottom: theme.spacing(1)
}));

const PositionChip = styled(Chip)(({ theme }) => ({
  fontWeight: 500,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main
}));

// Interfaces
interface Match {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  homeScore?: number;
  awayScore?: number;
  events?: MatchEvent[];
  homeTeamLineup?: { [position: string]: string };
  awayTeamLineup?: { [position: string]: string };
}

interface MatchEvent {
  type: 'goal' | 'assist' | 'injury' | 'yellowCard' | 'redCard' | 'substitution';
  playerEmail: string;
  minute: string;
  subbedInEmail?: string;
}

function mapPositionToCategory(position: string): string {
  position = position.split("-")[0];
  const positionMapping: { [key: string]: string } = {
    GK: "Goalkeeper",
    CB: "Defender",
    RB: "Defender",
    LB: "Defender",
    RWB: "Defender",
    LWB: "Defender",
    CDM: "Midfielder",
    CM: "Midfielder",
    CAM: "Midfielder",
    RM: "Midfielder",
    LM: "Midfielder",
    RW: "Forward",
    LW: "Forward",
    ST: "Forward",
    Sub1: "Substitution",
    Sub2: "Substitution",
    Sub3: "Substitution",
    Sub4: "Substitution",
    Sub5: "Substitution",
    Sub6: "Substitution",
    Sub7: "Substitution",
    Sub8: "Substitution",
    Sub9: "Substitution",
    Sub10: "Substitution",
  };
  return positionMapping[position] || "Unknown";
}

const getEventColor = (type: string, theme: Theme) => {
  switch(type) {
    case 'goal': return theme.palette.success.main;
    case 'assist': return theme.palette.info.main;
    case 'yellowCard': return theme.palette.warning.main;
    case 'redCard': return theme.palette.error.main;
    case 'injury': return theme.palette.secondary.main;
    case 'substitution': return theme.palette.primary.main;
    default: return theme.palette.text.primary;
  }
};

export default function ResultProfile() {
  const theme = useTheme();
  const { matchId } = useParams();
  const { state } = useLocation();
  const [match, setMatch] = useState<Match | null>(state?.match || null);
  const [loading, setLoading] = useState(!state?.match);
  const [newEvent, setNewEvent] = useState<MatchEvent>({
    type: 'goal',
    playerEmail: '',
    minute: '',
  });
  const { clubName, ageGroup, division } = useAuth();
  const [homePlayers, setHomePlayers] = useState<{ email: string; name: string; position: string }[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<{ email: string; name: string; position: string }[]>([]);
  const [playersMap, setPlayersMap] = useState<{ [email: string]: { name: string; position: string } }>({});
  const [playerRatings, setPlayerRatings] = useState<{ [email: string]: number }>({});

  useEffect(() => {
    const fetchPlayersData = async () => {
      if (clubName && ageGroup && division) {
        try {
          const allPlayers = await getMembershipsForTeam(clubName, ageGroup, division);
          const emailToPlayerMap = allPlayers.reduce((map: { [email: string]: { name: string; position: string } }, player: { email: string; name: string; position: string }) => {
            map[player.email] = { name: player.name, position: player.position };
            return map;
          }, {});
          setPlayersMap(emailToPlayerMap);
        } catch (error) {
          console.error("Error fetching players:", error);
        }
      }
    };
    fetchPlayersData();
  }, [clubName, ageGroup, division]);

  useEffect(() => {
    const fetchLineups = async () => {
      if (matchId && clubName && ageGroup && division) {
        try {
          const lineups = await getLineups(matchId, clubName, ageGroup, division);
          const homeTeamPlayers = Object.entries(lineups.homeTeamLineup || {}).map(([position, email]) => ({
            email,
            name: playersMap[email]?.name || "Unknown Player",
            position: mapPositionToCategory(position)
          }));
          const awayTeamPlayers = Object.entries(lineups.awayTeamLineup || {}).map(([position, email]) => ({
            email,
            name: playersMap[email]?.name || "Unknown Player",
            position: mapPositionToCategory(position)
          }));
          setHomePlayers(homeTeamPlayers);
          setAwayPlayers(awayTeamPlayers);
        } catch (error) {
          console.error("Error fetching lineups:", error);
        }
      }
    };
    fetchLineups();
  }, [matchId, clubName, ageGroup, division, playersMap]);

  useEffect(() => {
    const fetchFixtureAndEvents = async () => {
      if (matchId && clubName && ageGroup && division) {
        setLoading(true);
        try {
          const fixture = await getFixtureById(matchId, clubName, ageGroup, division);
          const events = await getEvents(matchId, clubName, ageGroup, division);
          setMatch({ ...fixture, events: events as MatchEvent[] });
        } catch (error) {
          console.error('Error fetching match details:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchFixtureAndEvents();
  }, [matchId, clubName, ageGroup, division]);

  useEffect(() => {
    const loadRatings = async () => {
      if (matchId && clubName && ageGroup && division) {
        const ratings = await fetchPlayerRatings(matchId, clubName, ageGroup, division);
        const ratingMap = ratings.reduce((map, rating) => {
          map[rating.playerEmail] = rating.overallPerformance ?? 0;
          return map;
        }, {} as { [email: string]: number });
        setPlayerRatings(ratingMap);
      }
    };
    loadRatings();
  }, [matchId, clubName, ageGroup, division]);

  const handleAddEvent = async () => {
    if (!match || !clubName || !ageGroup || !division) return;

    try {
      await addEvent(match.matchId, clubName, ageGroup, division, newEvent);
      
      if (newEvent.playerEmail) {
        await updatePlayerStats(
          clubName,
          ageGroup,
          division,
          newEvent.playerEmail,
          playersMap[newEvent.playerEmail]?.name || "Unknown Player",
          newEvent.type as "goal" | "assist" | "yellowCard" | "redCard"
        );
      }

      const updatedEvents = await getEvents(match.matchId, clubName, ageGroup, division);
      setMatch((prevMatch) => prevMatch ? { ...prevMatch, events: updatedEvents as MatchEvent[] } : prevMatch);
      setNewEvent({ type: 'goal', playerEmail: '', minute: '', subbedInEmail: '' });
    } catch (error) {
      console.error('Error saving match event:', error);
    }
  };

  const handleSaveScore = async () => {
    if (match && clubName && ageGroup && division) {
      try {
        await saveResult(match.matchId, clubName, ageGroup, division, match.homeScore ?? 0, match.awayScore ?? 0);
      } catch (error) {
        console.error('Error updating match result:', error);
      }
    }
  };

  const handleRatingChange = async (email: string, rating: number) => {
    setPlayerRatings((prev) => ({ ...prev, [email]: rating }));
    try {
      await submitPlayerRating(matchId!, clubName!, ageGroup!, division!, { playerEmail: email, overallPerformance: rating });
    } catch (error) {
      console.error("Failed to save rating:", error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Header />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <LoadingSpinner />
        </Box>
      </Layout>
    );
  }

  if (!match) {
    return (
      <Layout>
        <Header />
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
          Match not found
        </Typography>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <Box sx={{ 
        px: { xs: 2, md: 4 }, 
        py: 3,
        maxWidth: 1200,
        mx: 'auto'
      }}>
        {/* Match Header */}
        <MatchCard>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <SportsSoccer sx={{ 
                fontSize: 40,
                color: 'primary.main',
                p: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: '50%'
              }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {match.homeTeam} vs {match.awayTeam}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  <Event sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {new Date(match.date).toLocaleDateString()} • {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            </Stack>

            {/* Score Section */}
            <Box sx={{ 
              p: 3, 
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              mb: 3
            }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Score sx={{ mr: 1 }} /> Match Score
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 5}}>
                  <TextField
                    fullWidth
                    label={`${match.homeTeam} Score`}
                    type="number"
                    value={match.homeScore || ''}
                    onChange={(e) => setMatch({ ...match, homeScore: parseInt(e.target.value) })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2}} sx={{ textAlign: 'center' }}>
                  <Typography variant="h5">vs</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 5}}>
                  <TextField
                    fullWidth
                    label={`${match.awayTeam} Score`}
                    type="number"
                    value={match.awayScore || ''}
                    onChange={(e) => setMatch({ ...match, awayScore: parseInt(e.target.value) })}
                  />
                </Grid>
                <Grid size={{ xs: 12}}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    onClick={handleSaveScore}
                    sx={{ mt: 1 }}
                  >
                    Save Score
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Add Event Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <AddCircleOutline sx={{ mr: 1 }} /> Add Match Event
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6}}>
                  <Select
                    fullWidth
                    value={newEvent.playerEmail || ""}
                    onChange={(e) => setNewEvent({ ...newEvent, playerEmail: e.target.value })}
                    displayEmpty
                  >
                    <MenuItem disabled value="">Select Player</MenuItem>
                    <ListSubheader>Home Team</ListSubheader>
                    {homePlayers.map((player) => (
                      <MenuItem key={player.email} value={player.email}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {player.name.charAt(0)}
                          </Avatar>
                          {player.name} <PositionChip label={player.position} size="small" />
                        </Box>
                      </MenuItem>
                    ))}
                    <ListSubheader>Away Team</ListSubheader>
                    {awayPlayers.map((player) => (
                      <MenuItem key={player.email} value={player.email}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {player.name.charAt(0)}
                          </Avatar>
                          {player.name} <PositionChip label={player.position} size="small" />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid size={{ xs: 12, md: 2}}>
                  <TextField
                    fullWidth
                    label="Minute"
                    value={newEvent.minute}
                    onChange={(e) => setNewEvent({ ...newEvent, minute: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4}}>
                  <Select
                    fullWidth
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as MatchEvent['type'] })}
                  >
                    <MenuItem value="goal">Goal ⚽</MenuItem>
                    <MenuItem value="assist">Assist 🅰️</MenuItem>
                    <MenuItem value="yellowCard">Yellow Card 🟨</MenuItem>
                    <MenuItem value="redCard">Red Card 🟥</MenuItem>
                    <MenuItem value="substitution">Substitution 🔄</MenuItem>
                    <MenuItem value="injury">Injury 🏥</MenuItem>
                  </Select>
                </Grid>
                {newEvent.type === 'substitution' && (
                  <Grid size={{ xs: 12}}>
                    <Select
                      fullWidth
                      value={newEvent.subbedInEmail || ""}
                      onChange={(e) => setNewEvent({ ...newEvent, subbedInEmail: e.target.value })}
                      displayEmpty
                    >
                      <MenuItem disabled value="">Select Substitution</MenuItem>
                      <ListSubheader>Home Team</ListSubheader>
                      {homePlayers.map((player) => (
                        <MenuItem key={player.email} value={player.email}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                              {player.name.charAt(0)}
                            </Avatar>
                            {player.name} <PositionChip label={player.position} size="small" />
                          </Box>
                        </MenuItem>
                      ))}
                      <ListSubheader>Away Team</ListSubheader>
                      {awayPlayers.map((player) => (
                        <MenuItem key={player.email} value={player.email}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                              {player.name.charAt(0)}
                            </Avatar>
                            {player.name} <PositionChip label={player.position} size="small" />
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                )}
                <Grid size={{ xs: 12}}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    startIcon={<AddCircleOutline />}
                    onClick={handleAddEvent}
                    disabled={!newEvent.playerEmail || !newEvent.minute}
                  >
                    Add Event
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Match Events */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <EmojiEvents sx={{ mr: 1 }} /> Match Events
              </Typography>
              {match.events && match.events.length > 0 ? (
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {match.events.map((event, index) => (
                    <EventCard key={index}>
                      <CardContent sx={{ py: 1, px: 2 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between'
                        }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {event.minute}'
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: getEventColor(event.type, theme),
                            fontWeight: 600
                          }}>
                            {event.type.toUpperCase()}
                          </Typography>
                          <Typography variant="body2">
                            {playersMap[event.playerEmail]?.name || event.playerEmail}
                          </Typography>
                          {event.type === 'substitution' && event.subbedInEmail && (
                            <Typography variant="body2">
                              ↪ {playersMap[event.subbedInEmail]?.name || event.subbedInEmail}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </EventCard>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No events recorded yet
                </Typography>
              )}
            </Box>
          </CardContent>
        </MatchCard>

        {/* Player Ratings */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6}}>
            <MatchCard>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Group sx={{ mr: 1 }} /> {match.homeTeam} Ratings
                </Typography>
                {homePlayers.map((player) => (
                  <Box 
                    key={player.email} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: 2,
                      p: 1,
                      borderRadius: 1,
                      '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.05) }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {player.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{player.name}</Typography>
                        <PositionChip label={player.position} size="small" />
                      </Box>
                    </Box>
                    <Select
                      value={playerRatings[player.email] || 0}
                      onChange={(e) => handleRatingChange(player.email, Number(e.target.value))}
                      sx={{ minWidth: 80 }}
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <MenuItem key={num} value={num}>{num}</MenuItem>
                      ))}
                    </Select>
                  </Box>
                ))}
              </CardContent>
            </MatchCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6}}>
            <MatchCard>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Group sx={{ mr: 1 }} /> {match.awayTeam} Ratings
                </Typography>
                {awayPlayers.map((player) => (
                  <Box 
                    key={player.email} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: 2,
                      p: 1,
                      borderRadius: 1,
                      '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.05) }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {player.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{player.name}</Typography>
                        <PositionChip label={player.position} size="small" />
                      </Box>
                    </Box>
                    <Select
                      value={playerRatings[player.email] || 0}
                      onChange={(e) => handleRatingChange(player.email, Number(e.target.value))}
                      sx={{ minWidth: 80 }}
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <MenuItem key={num} value={num}>{num}</MenuItem>
                      ))}
                    </Select>
                  </Box>
                ))}
              </CardContent>
            </MatchCard>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}