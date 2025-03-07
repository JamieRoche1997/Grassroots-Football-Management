import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Typography, Box, Card, Divider, TextField, Button, IconButton, Select, MenuItem, ListSubheader } from '@mui/material';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { getMembershipsForTeam } from '../../services/membership';
import { getFixtureById } from '../../services/schedule_management';
import { getEvents, addEvent, getLineups } from '../../services/match_management';
import { saveResult } from '../../services/match_management';
import { fetchPlayerRatings, submitPlayerRating } from '../../services/match_management';


// Interface for match and events
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
  position = position.split("-")[0]; // ✅ Extract the main position
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
    ST: "Forward"
  };
  return positionMapping[position] || "Unknown";  // Fallback to Unknown
}


export default function ResultProfile() {
  const { matchId } = useParams();
  const { state } = useLocation();
  const [match, setMatch] = useState<Match | null>(state?.match || null);
  const [loading, setLoading] = useState<boolean>(!state?.match);
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
          const allPlayers = await getMembershipsForTeam(clubName, ageGroup, division); // ✅ Fetch all players
          interface Player {
            email: string;
            name: string;
            position: string;
          }

          interface PlayersMap {
            [email: string]: { name: string; position: string };
          }

          const emailToPlayerMap: PlayersMap = allPlayers.reduce((map: PlayersMap, player: Player) => {
            map[player.email] = { name: player.name, position: player.position }; // ✅ Store name & position
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
  }, [matchId, clubName, ageGroup, division, playersMap]);  // Notice: match itself is not a dependency


  useEffect(() => {
    const fetchFixtureAndEvents = async () => {
      if (matchId && clubName && ageGroup && division) {
        setLoading(true);
        try {
          const fixture = await getFixtureById(matchId, clubName, ageGroup, division);
          const events = await getEvents(matchId, clubName, ageGroup, division);
          console.log('fixture:', fixture);

          setMatch({ ...fixture, events: events as MatchEvent[] });  // ✅ Load both at once
        } catch (error) {
          console.error('Error fetching match details:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFixtureAndEvents();
  }, [matchId, clubName, ageGroup, division]);  // ✅ `match` itself is NOT a dependency

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
      alert('Event added successfully!');

      // Fetch latest events and update the UI
      const updatedEvents = await getEvents(match.matchId, clubName, ageGroup, division);
      setMatch((prevMatch) => prevMatch ? { ...prevMatch, events: updatedEvents as MatchEvent[] } : prevMatch);

      // Reset the form
      setNewEvent({ type: 'goal', playerEmail: '', minute: '', subbedInEmail: '' });
    } catch (error) {
      console.error('Error saving match event:', error);
      alert('Failed to save match event.');
    }
  };

  const handleSaveScore = async () => {
    if (match && clubName && ageGroup && division) {
      try {
        await saveResult(match.matchId, clubName, ageGroup, division, match.homeScore ?? 0, match.awayScore ?? 0);
        alert('Match result updated successfully!');
      } catch (error) {
        console.error('Error updating match result:', error);
        alert('Failed to update match result.');
      }
    }
  };

  const handleRatingChange = async (email: string, rating: number) => {
    setPlayerRatings((prev) => ({ ...prev, [email]: rating }));

    console.log('Rating:', rating);

    try {
      await submitPlayerRating(matchId!, clubName!, ageGroup!, division!, { playerEmail: email, overallPerformance: rating });
    } catch (error) {
      console.error("Failed to save rating:", error);
      alert("Failed to save rating.");
    }
  };


  if (loading) {
    return (
      <Layout>
        <Header />
        <LoadingSpinner />
      </Layout>
    );
  }

  if (!match) {
    return (
      <Layout>
        <Header />
        <Typography variant="h5" sx={{ p: 3 }}>
          Match not found.
        </Typography>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <Box sx={{ p: 3 }}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h4">
            {match.homeTeam} vs {match.awayTeam}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Date: {match.date}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Update Score */}
          <Typography variant="h5">Match Score</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              label={`${match.homeTeam} Score`}
              type="number"
              value={match.homeScore || ''}
              onChange={(e) => setMatch({ ...match, homeScore: parseInt(e.target.value) })}
              sx={{ width: 200 }}
            />
            <TextField
              label={`${match.awayTeam} Score`}
              type="number"
              value={match.awayScore || ''}
              onChange={(e) => setMatch({ ...match, awayScore: parseInt(e.target.value) })}
              sx={{ width: 200 }}
            />
            <Button variant="contained" onClick={handleSaveScore}>
              Save Score
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h5">Add Match Event</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
            {/* Player Being Substituted Out */}
            <Select
              fullWidth
              value={newEvent.playerEmail || "default"}
              onChange={(e) => setNewEvent({ ...newEvent, playerEmail: e.target.value })}
            >
              <MenuItem disabled value="default">Select Player</MenuItem>

              {/* ✅ Home Team Section */}
              <MenuItem disabled>── Home Team ──</MenuItem>
              {["Goalkeeper", "Defender", "Midfielder", "Forward"].flatMap((posCategory, index) => {
                const groupedPlayers = homePlayers.filter(player => player.position === posCategory);
                if (groupedPlayers.length === 0) return []; // ✅ Skip empty categories

                return [
                  index > 0 && <Divider key={`divider-home-${posCategory}`} />, // ✅ Add divider if not the first category
                  <ListSubheader key={`header-home-${posCategory}`}>{posCategory}</ListSubheader>,
                  ...groupedPlayers.map((player) => (
                    <MenuItem key={player.email} value={player.email}>
                      {player.name} - {player.position} {/* ✅ Show Name and Position */}
                    </MenuItem>
                  ))
                ];
              })}

              {/* ✅ Away Team Section */}
              <MenuItem disabled>── Away Team ──</MenuItem>
              {["Goalkeeper", "Defender", "Midfielder", "Forward"].flatMap((posCategory, index) => {
                const groupedPlayers = awayPlayers.filter(player => player.position === posCategory);
                if (groupedPlayers.length === 0) return []; // ✅ Skip empty categories

                return [
                  index > 0 && <Divider key={`divider-away-${posCategory}`} />, // ✅ Add divider if not the first category
                  <ListSubheader key={`header-away-${posCategory}`}>{posCategory}</ListSubheader>,
                  ...groupedPlayers.map((player) => (
                    <MenuItem key={player.email} value={player.email}>
                      {player.name} - {player.position} {/* ✅ Show Name and Position */}
                    </MenuItem>
                  ))
                ];
              })}
            </Select>

            {/* Match Minute Input */}
            <TextField
              label="Minute"
              value={newEvent.minute}
              onChange={(e) => setNewEvent({ ...newEvent, minute: e.target.value })}
            />

            {/* Event Type Selection */}
            <Select
              fullWidth
              value={newEvent.type}
              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as MatchEvent['type'] })}
            >
              <MenuItem value="goal">Goal</MenuItem>
              <MenuItem value="assist">Assist</MenuItem>
              <MenuItem value="injury">Injury</MenuItem>
              <MenuItem value="yellowCard">Yellow Card</MenuItem>
              <MenuItem value="redCard">Red Card</MenuItem>
              <MenuItem value="substitution">Substitution</MenuItem>
            </Select>

            {/* Show "Subbed In" dropdown only if substitution is selected */}
            {newEvent.type === 'substitution' && (
              <Select
                fullWidth
                value={newEvent.subbedInEmail || "default"}
                onChange={(e) => setNewEvent({ ...newEvent, subbedInEmail: e.target.value })}
              >
                <MenuItem disabled value="default">Select Player Coming On</MenuItem>

                {/* ✅ Home Team Section */}
                <MenuItem disabled>── Home Team ──</MenuItem>
                {["Goalkeeper", "Defender", "Midfielder", "Forward"].flatMap((posCategory, index) => {
                  const groupedPlayers = homePlayers.filter(player => player.position === posCategory);
                  if (groupedPlayers.length === 0) return []; // ✅ Skip empty categories

                  return [
                    index > 0 && <Divider key={`divider-home-${posCategory}`} />, // ✅ Add divider if not the first category
                    <ListSubheader key={`header-home-${posCategory}`}>{posCategory}</ListSubheader>,
                    ...groupedPlayers.map((player) => (
                      <MenuItem key={player.email} value={player.email}>
                        {player.name} - {player.position} {/* ✅ Show Name and Position */}
                      </MenuItem>
                    ))
                  ];
                })}

                {/* ✅ Away Team Section */}
                <MenuItem disabled>── Away Team ──</MenuItem>
                {["Goalkeeper", "Defender", "Midfielder", "Forward"].flatMap((posCategory, index) => {
                  const groupedPlayers = awayPlayers.filter(player => player.position === posCategory);
                  if (groupedPlayers.length === 0) return []; // ✅ Skip empty categories

                  return [
                    index > 0 && <Divider key={`divider-away-${posCategory}`} />, // ✅ Add divider if not the first category
                    <ListSubheader key={`header-away-${posCategory}`}>{posCategory}</ListSubheader>,
                    ...groupedPlayers.map((player) => (
                      <MenuItem key={player.email} value={player.email}>
                        {player.name}
                      </MenuItem>
                    ))
                  ];
                })}
              </Select>
            )}


            {/* Add Event Button */}
            <IconButton color="primary" onClick={handleAddEvent}>
              <AddCircleOutlineIcon />
            </IconButton>
          </Box>


          <Divider sx={{ my: 2 }} />

          {/* Display Match Events */}
          <Typography variant="h5">Match Events</Typography>
          {match.events && match.events.length > 0 ? (
            match.events.map((event, index) => (
              <Typography key={index} variant="body1">
                {event.minute}': {event.playerEmail} - {event.type.toUpperCase()}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No events recorded.
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Player Ratings */}
          <Typography variant="h6">Home Team Lineup</Typography>
          {homePlayers.map((player) => (
            <Box key={player.email} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography>{player.name} - {player.position}</Typography>
              <Select
                value={playerRatings[player.email] ?? ""}
                onChange={(e) => handleRatingChange(player.email, Number(e.target.value))}
                displayEmpty
                sx={{ width: 80 }}
              >
                <MenuItem value="" disabled>Rate</MenuItem>
                {Array.from({ length: 10 }, (_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                ))}
              </Select>
            </Box>
          ))}

        </Card>
      </Box>
    </Layout>
  );
}
