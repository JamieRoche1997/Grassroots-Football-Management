import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Typography, Box, Card, Divider, TextField, Button, IconButton, Select, MenuItem } from '@mui/material';
import { updateFixtureResult, fetchMatches } from '../../services/schedule_management';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { updateUserMatchEvent } from '../../services/user_management';

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
  type: 'goal' | 'assist' | 'injury' | 'yellowCard' | 'redCard';
  playerEmail: string;
  minute: string;
  description?: string;
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
    description: '',
  });
  const { clubName, ageGroup, division } = useAuth();
  const [homePlayers, setHomePlayers] = useState<string[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<string[]>([]);

  useEffect(() => {
    if (match) {
      const homeTeamPlayers = match.homeTeamLineup ? Object.values(match.homeTeamLineup) : [];
      const awayTeamPlayers = match.awayTeamLineup ? Object.values(match.awayTeamLineup) : [];
      setHomePlayers(homeTeamPlayers);
      setAwayPlayers(awayTeamPlayers);
    }
  }, [match]);


  useEffect(() => {
    const fetchMatchById = async () => {
      if (!match && matchId) {
        try {
          console.log("Fetching match data...");
          const matches = await fetchMatches(new Date().toISOString().slice(0, 7), clubName!, ageGroup!, division!);
          const foundMatch = matches.find((m) => m.matchId === matchId);
  
          if (foundMatch) {
            console.log("Match found:", foundMatch);
  
            if (!foundMatch.homeTeamLineup) foundMatch.homeTeamLineup = {};
            if (!foundMatch.awayTeamLineup) foundMatch.awayTeamLineup = {};
            if (!foundMatch.events) foundMatch.events = []; // Ensure events exist
            setMatch(foundMatch);
          }
        } catch (error) {
          console.error("Error fetching match details:", error);
        } finally {
          setLoading(false);
        }
      }
    };
  
    fetchMatchById();
  }, [match, matchId, clubName, ageGroup, division]);
  

  const handleAddEvent = async () => {
    if (match) {
      const updatedEvents = match.events ? [...match.events, newEvent] : [newEvent];
      setMatch({ ...match, events: updatedEvents });
  
      try {
        await updateFixtureResult(match.matchId, match.homeScore || 0, match.awayScore || 0, updatedEvents);
        alert("Match event added successfully!");
  
        // Update Firestore user collection with event counts
        await updateUserMatchEvent(newEvent.playerEmail, newEvent.type);
  
        // Fetch updated match data to ensure the event is stored in Firestore
        const updatedMatchData = await fetchMatches(new Date().toISOString().slice(0, 7), clubName!, ageGroup!, division!);
        const refreshedMatch = updatedMatchData.find((m) => m.matchId === match.matchId);
  
        if (refreshedMatch) {
          setMatch(refreshedMatch);
        }
      } catch (error) {
        console.error("Error saving match event:", error);
        alert("Failed to save match event.");
      }
  
      setNewEvent({ type: "goal", playerEmail: "", minute: "", description: "" });
    }
  };  

  const handleSaveScore = async () => {
    if (match) {
      try {
        await updateFixtureResult(match.matchId, match.homeScore || 0, match.awayScore || 0, match.events || []);
        alert('Match result updated successfully!');

        // Update UI immediately
        setMatch((prevMatch) => prevMatch ? { ...prevMatch, homeScore: match.homeScore, awayScore: match.awayScore } : null);
      } catch (error) {
        console.error('Error updating match result:', error);
        alert('Failed to update match result.');
      }
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

          {/* Add Match Event */}
          <Typography variant="h5">Add Match Event</Typography>
          <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
            <Select
              fullWidth
              value={newEvent.playerEmail}
              onChange={(e) => setNewEvent({ ...newEvent, playerEmail: e.target.value })}
            >
              <MenuItem disabled value="">
                Select Player
              </MenuItem>
              <MenuItem disabled>── Home Team ──</MenuItem>
              {homePlayers.map((player) => (
                <MenuItem key={player} value={player}>
                  {player}
                </MenuItem>
              ))}
              <MenuItem disabled>── Away Team ──</MenuItem>
              {awayPlayers.map((player) => (
                <MenuItem key={player} value={player}>
                  {player}
                </MenuItem>
              ))}
            </Select>

            <TextField
              label="Minute"
              value={newEvent.minute}
              onChange={(e) => setNewEvent({ ...newEvent, minute: e.target.value })}
            />
            <Select
              value={newEvent.type}
              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as MatchEvent['type'] })}
            >
              <MenuItem value="goal">Goal</MenuItem>
              <MenuItem value="assist">Assist</MenuItem>
              <MenuItem value="injury">Injury</MenuItem>
              <MenuItem value="yellowCard">Yellow Card</MenuItem>
              <MenuItem value="redCard">Red Card</MenuItem>
            </Select>
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
                {event.minute}': {event.playerEmail} - {event.type.toUpperCase()} {event.description && `(${event.description})`}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No events recorded.
            </Typography>
          )}
        </Card>
      </Box>
    </Layout>
  );
}
