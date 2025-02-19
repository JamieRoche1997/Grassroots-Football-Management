import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Typography, Box, Card, Divider, TextField, Button, IconButton, Select, MenuItem, ListSubheader } from '@mui/material';
import { updateFixtureResult, fetchMatches } from '../../services/schedule_management';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { updateUserMatchEvent } from '../../services/user_management';
import { fetchPlayers } from '../../services/team_management';

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

  useEffect(() => {
    const fetchPlayersData = async () => {
      if (clubName && ageGroup && division) {
        try {
          const allPlayers = await fetchPlayers(clubName, ageGroup, division); // ✅ Fetch all players
          const emailToPlayerMap = allPlayers.reduce((map, player) => {
            map[player.email] = { name: player.name, position: player.position }; // ✅ Store name & position
            return map;
          }, {} as { [email: string]: { name: string; position: string } });

          setPlayersMap(emailToPlayerMap);
        } catch (error) {
          console.error("Error fetching players:", error);
        }
      }
    };

    fetchPlayersData();
  }, [clubName, ageGroup, division]);

  useEffect(() => {
    if (match) {
      // Convert home and away lineup from { position: email } to [{ email, name, position }]
      const homeTeamPlayers = match.homeTeamLineup
        ? Object.entries(match.homeTeamLineup).map(([, email]) => ({
          email,
          name: playersMap[email]?.name || "Unknown Player",
          position: playersMap[email]?.position || "Unknown Position", // ✅ Ensure position is included
        }))
        : [];

      const awayTeamPlayers = match.awayTeamLineup
        ? Object.entries(match.awayTeamLineup).map(([, email]) => ({
          email,
          name: playersMap[email]?.name || "Unknown Player",
          position: playersMap[email]?.position || "Unknown Position", // ✅ Ensure position is included
        }))
        : [];

      setHomePlayers(homeTeamPlayers);
      setAwayPlayers(awayTeamPlayers);
    }
  }, [match, playersMap]);


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
    if (!match) return;

    try {
      // ✅ Fetch the latest match data to get the most recent event list
      const updatedMatchData = await fetchMatches(new Date().toISOString().slice(0, 7), clubName!, ageGroup!, division!);
      const refreshedMatch = updatedMatchData.find((m) => m.matchId === match.matchId);

      const existingEvents = refreshedMatch?.events || []; // ✅ Get existing events from DB

      // ✅ Append the new event to existing ones
      const updatedEvents = [...existingEvents, newEvent];

      // ✅ Ensure no duplicate events before saving
      const uniqueEvents = updatedEvents.filter(
        (event, index, self) =>
          index === self.findIndex((e) =>
            e.playerEmail === event.playerEmail &&
            e.minute === event.minute &&
            e.type === event.type &&
            e.subbedInEmail === event.subbedInEmail
          )
      );

      // ✅ Overwrite Firestore data to remove duplicates
      await updateFixtureResult(match.matchId, match.homeScore || 0, match.awayScore || 0, uniqueEvents);

      alert("Match event added successfully!");

      // ✅ Update UI with latest unique events
      setMatch((prevMatch) =>
        prevMatch ? { ...prevMatch, events: uniqueEvents } : prevMatch
      );

      // ✅ Update Firestore user collection with event counts
      await updateUserMatchEvent(newEvent.playerEmail, newEvent.type);
    } catch (error) {
      console.error("Error saving match event:", error);
      alert("Failed to save match event.");
    }

    // ✅ Reset new event form without affecting existing state
    setNewEvent({ type: "goal", playerEmail: "", minute: "", subbedInEmail: "" });
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
                        {player.name} - {player.position} {/* ✅ Show Name and Position */}
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
        </Card>
      </Box>
    </Layout>
  );
}
