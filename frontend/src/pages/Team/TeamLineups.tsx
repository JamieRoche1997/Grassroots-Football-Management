import { useEffect, useState, useCallback } from "react";
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
  Alert,
  useTheme,
  useMediaQuery,
  Grid2 as Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import SaveIcon from "@mui/icons-material/Save";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import WarningIcon from "@mui/icons-material/Warning";
import { getMembershipsForTeam } from "../../services/membership";
import { format } from "date-fns";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import { fetchAllFixtures } from "../../services/schedule_management";
import { saveLineups, recordPlayerParticipation } from "../../services/match_management";

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
  "5-4-1": [
    ["GK"],
    ["RWB", "CB", "CB", "CB", "LWB"], // 5 defenders
    ["RM", "CM", "CM", "LM"], // 4 midfielders
    ["ST"], // 1 striker
  ], // Total: 10 outfield players

  "5-3-2": [
    ["GK"],
    ["RWB", "CB", "CB", "CB", "LWB"], // 5 defenders
    ["CM", "CM", "CM"], // 3 midfielders
    ["ST", "ST"], // 2 strikers
  ], // Total: 10 outfield players

  "4-5-1": [
    ["GK"],
    ["RB", "CB", "CB", "LB"], // 4 defenders
    ["CDM"], // 1 defensive mid
    ["RM", "CM", "CM", "LM"], // 4 midfielders
    ["ST"], // 1 striker
  ], // Total: 10 outfield players

  "4-4-2": [
    ["GK"],
    ["RB", "CB", "CB", "LB"], // 4 defenders
    ["RM", "CM", "CM", "LM"], // 4 midfielders
    ["ST", "ST"], // 2 strikers
  ], // Total: 10 outfield players

  "4-1-4-1": [
    ["GK"],
    ["RB", "CB", "CB", "LB"], // 4 defenders
    ["CDM"], // 1 defensive mid
    ["RM", "CM", "CM", "LM"], // 4 midfielders
    ["ST"], // 1 striker
  ], // Total: 10 outfield players

  "4-3-3": [
    ["GK"],
    ["RB", "CB", "CB", "LB"], // 4 defenders
    ["CM", "CM", "CM"], // 3 midfielders
    ["RW", "ST", "LW"], // 3 forwards
  ], // Total: 10 outfield players

  "4-3-2-1": [
    ["GK"],
    ["RB", "CB", "CB", "LB"], // 4 defenders
    ["CM", "CDM", "CM"], // 3 midfielders
    ["CAM", "CAM"], // 2 attacking mids
    ["ST"], // 1 striker
  ], // Total: 10 outfield players

  "4-2-3-1": [
    ["GK"],
    ["RB", "CB", "CB", "LB"], // 4 defenders
    ["CDM", "CDM"], // 2 defensive mids
    ["RW", "CAM", "LW"], // 3 attacking mids
    ["ST"], // 1 striker
  ], // Total: 10 outfield players

  "4-2-2-2": [
    ["GK"],
    ["RB", "CB", "CB", "LB"], // 4 defenders
    ["CDM", "CDM"], // 2 defensive mids
    ["CAM", "CAM"], // 2 attacking mids
    ["ST", "ST"], // 2 strikers
  ], // Total: 10 outfield players

  "3-6-1": [
    ["GK"],
    ["CB", "CB", "CB"], // 3 defenders
    ["RWB", "CM", "CDM", "CM", "LWB"], // 5 midfielders
    ["CAM"], // 1 attacking mid
    ["ST"], // 1 striker
  ], // Total: 10 outfield players

  "3-5-2": [
    ["GK"],
    ["CB", "CB", "CB"], // 3 defenders
    ["RWB", "CM", "CDM", "CM", "LWB"], // 5 midfielders
    ["ST", "ST"], // 2 strikers
  ], // Total: 10 outfield players

  "3-4-3": [
    ["GK"],
    ["CB", "CB", "CB"], // 3 defenders
    ["RWB", "CM", "CM", "LWB"], // 4 midfielders
    ["RW", "ST", "LW"], // 3 forwards
  ], // Total: 10 outfield players

  "3-4-1-2": [
    ["GK"],
    ["CB", "CB", "CB"], // 3 defenders
    ["RWB", "CM", "CM", "LWB"], // 4 midfielders
    ["CAM"], // 1 attacking mid
    ["ST", "ST"], // 2 strikers
  ], // Total: 10 outfield players

  "3-3-4": [
    ["GK"],
    ["CB", "CB", "CB"], // 3 defenders
    ["CM", "CM", "CM"], // 3 midfielders
    ["RW", "ST", "ST", "LW"], // 4 forwards
  ], // Total: 10 outfield players

  "3-2-5": [
    ["GK"],
    ["CB", "CB", "CB"], // 3 defenders
    ["CDM", "CDM"], // 2 midfielders
    ["RW", "CAM", "ST", "CAM", "LW"], // 5 attackers
  ], // Total: 10 outfield players
};

// Paper style with better performance
const paperSx = {
  p: 3,
  mb: 4,
  borderRadius: 2,
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(12px)",
  border: "1px solid",
  borderColor: "rgba(0, 0, 0, 0.05)",
  transition: "box-shadow 0.3s ease, transform 0.3s ease",
  willChange: "transform, box-shadow",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: 6,
  },
};

export default function TeamLineups() {
  const { clubName, ageGroup, division, loading: authLoading } = useAuth();
  const positionOrder = ["Goalkeeper", "Defender", "Midfielder", "Forward"];
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFormation, setSelectedFormation] =
    useState<keyof typeof formations>("4-4-2");
  const [assignedPlayers, setAssignedPlayers] = useState<{
    [position: string]: string;
  }>({});
  const [substitutes, setSubstitutes] = useState<string[]>([]);
  const [strategyNotes, setStrategyNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  // Calculate these values once per render to avoid recalculations
  const assignedPlayerEmails = new Set(Object.values(assignedPlayers));
  const availableSubstitutes = players.filter(
    (player) => !assignedPlayerEmails.has(player.email)
  );
  
  // Count total positions in formation
  const totalPositions = formations[selectedFormation].flat().length;
  const filledPositions = Object.keys(assignedPlayers).length;

  // Memoize the player lookup function for better performance
  const getPlayerName = useCallback((playerEmail: string): string => {
    const player = players.find((p) => p.email === playerEmail);
    return player ? player.name : "Unknown Player";
  }, [players]);

  useEffect(() => {
    const fetchAllMatchesForYear = async () => {
      if (authLoading) return;

      if (!clubName || !ageGroup || !division) {
        setError("Club information is incomplete.");
        setLoading(false);
        return;
      }

      try {
        const allMatches = await fetchAllFixtures(clubName, ageGroup, division);
        setMatches(allMatches);
        setError(null);
      } catch (error) {
        console.error("Error fetching matches:", error);
        setError("Failed to load matches. Please try again later.");
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
        setError("Club information is incomplete.");
        setLoading(false);
        return;
      }

      try {
        const playersData = await getMembershipsForTeam(
          clubName,
          ageGroup,
          division
        );
        setPlayers(playersData);
        setError(null);
      } catch (error) {
        console.error("Error fetching players:", error);
        setError("Failed to load players. Please try again later.");
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
    
    // Confirm before changing formation if players are already assigned
    if (Object.keys(assignedPlayers).length > 0) {
      if (window.confirm("Changing formation will clear your current lineup. Continue?")) {
        setSelectedFormation(newFormation);
        setAssignedPlayers({});
      }
    } else {
      setSelectedFormation(newFormation);
    }
  };

  const handlePlayerAssign = (position: string, playerEmail: string) => {
    // Check if player is already assigned to another position
    const alreadyAssignedPosition = Object.entries(assignedPlayers).find(
      ([pos, email]) => email === playerEmail && pos !== position
    );
    
    // If already assigned, remove from previous position
    if (alreadyAssignedPosition && playerEmail) {
      const [prevPosition] = alreadyAssignedPosition;
      const updatedAssignments = { ...assignedPlayers };
      delete updatedAssignments[prevPosition];
      updatedAssignments[position] = playerEmail;
      setAssignedPlayers(updatedAssignments);
    } else if (!playerEmail) {
      // If clearing a position
      const updatedAssignments = { ...assignedPlayers };
      delete updatedAssignments[position];
      setAssignedPlayers(updatedAssignments);
    } else {
      // Normal assignment
      setAssignedPlayers((prev) => ({ ...prev, [position]: playerEmail }));
    }
    
    // Clear validation errors when changes are made
    setValidationErrors([]);
  };

  const handleAddSubstitute = (playerEmail: string) => {
    if (!substitutes.includes(playerEmail) && substitutes.length < 10) {
      setSubstitutes([...substitutes, playerEmail]);
    } else if (substitutes.length >= 10) {
      alert("Maximum 10 substitutes allowed");
    }
  };

  const handleRemoveSubstitute = (playerEmail: string) => {
    setSubstitutes(substitutes.filter((sub) => sub !== playerEmail));
  };

  const validateLineup = () => {
    const errors = [];
    
    // Check if sufficient positions are filled
    if (filledPositions < totalPositions) {
      errors.push(`${totalPositions - filledPositions} positions still need to be filled`);
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSaveMatchData = async () => {
    if (!selectedMatch) {
      alert("Please select a match before saving.");
      return;
    }

    // Validate lineup before saving
    if (!validateLineup()) {
      return;
    }

    const isHomeTeam = selectedMatch.homeTeam === clubName;
    const isAwayTeam = selectedMatch.awayTeam === clubName;

    if (!isHomeTeam && !isAwayTeam) {
      alert("You are not a coach for either team in this match.");
      return;
    }

    const lineup = {
      ...assignedPlayers,
      ...substitutes.reduce((acc, playerEmail, index) => {
        acc[`Sub${index + 1}`] = playerEmail;
        return acc;
      }, {} as { [key: string]: string }),
    };

    try {
      if (isHomeTeam && clubName && ageGroup && division) {
        await saveLineups(
          selectedMatch.matchId,
          clubName,
          ageGroup,
          division,
          lineup,
          {}
        );
        
        // Record game participation for all starter players
        await recordPlayerParticipation(
          selectedMatch.matchId,
          clubName,
          ageGroup,
          division,
          assignedPlayers, // Only starters, not substitutes
          true // Home game
        );
      } else if (isAwayTeam && clubName && ageGroup && division) {
        await saveLineups(
          selectedMatch.matchId,
          clubName,
          ageGroup,
          division,
          {},
          lineup
        );
        
        // Record game participation for all starter players
        await recordPlayerParticipation(
          selectedMatch.matchId,
          clubName,
          ageGroup,
          division,
          assignedPlayers, // Only starters, not substitutes
          false // Away game
        );
      }

      alert("Lineup saved successfully!");
      setSaveSuccess(true);
      setValidationErrors([]);
    } catch (error) {
      console.error("Error saving lineup:", error);
      alert("Failed to save lineup. Please try again.");
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
          <Typography color="error" variant="h6">
            {error}
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }}
            onClick={() => setError(null)}
          >
            Try Again
          </Button>
        </Box>
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
        mx: "auto",
        containIntrinsic: "size layout style paint", // Optimize rendering (modern browsers)
      }}>
        <Typography
          variant="h4"
          component="h1"
          fontWeight={600}
          sx={{ mb: 4, display: "flex", alignItems: "center" }}
        >
          <SportsSoccerIcon sx={{ mr: 1.5, color: "primary.main" }} />
          Team Lineups
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {saveSuccess && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            onClose={() => setSaveSuccess(false)}
          >
            Match data saved successfully!
          </Alert>
        )}

        <Paper
          elevation={2}
          sx={paperSx}
        >
          <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>
            Match Details
          </Typography>

          <Select
            fullWidth
            displayEmpty
            value={selectedMatch?.matchId || ""}
            onChange={(e) =>
              setSelectedMatch(
                matches.find((m) => m.matchId === e.target.value) || null
              )
            }
            sx={{ mb: 3 }}
          >
            <MenuItem value="" disabled>
              Select a match
            </MenuItem>
            {matches.map((match) => (
              <MenuItem key={match.matchId} value={match.matchId}>
                <Box
                  sx={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body1">
                    {match.homeTeam} vs {match.awayTeam}
                  </Typography>
                  <Chip
                    size="small"
                    label={format(new Date(match.date), "MMM d, yyyy")}
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
            sx={{ width: "100%", mb: 2 }}
          >
            {Object.keys(formations).map((formation) => (
              <MenuItem key={formation} value={formation}>
                {formation}
              </MenuItem>
            ))}
          </Select>
          
          {validationErrors.length > 0 && (
            <Alert 
              severity="warning" 
              icon={<WarningIcon />}
              sx={{ mt: 2 }}
            >
              {validationErrors.map((error, index) => (
                <Typography key={index} variant="body2">{error}</Typography>
              ))}
            </Alert>
          )}
        </Paper>

        {/* Field and lineup visualisation */}
        <Paper
          elevation={3}
          sx={{
            ...paperSx,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              minHeight: "60vh",
              p: 3,
              position: "relative",
              contain: "content", // Optimize rendering
            }}
          >
            {formations[selectedFormation].map((row, rowIndex) => (
              <Grid
                key={rowIndex}
                container
                spacing={isMobile ? 1 : 2}
                justifyContent="center"
                sx={{ width: "100%", mb: 3, position: "relative", zIndex: 1 }}
              >
                {row.map((position, positionIndex) => {
                  const positionKey = `${position}-${rowIndex}-${positionIndex}`;
                  const assignedPlayer = players.find(
                    (p) => p.email === assignedPlayers[positionKey]
                  );

                  return (
                    <Grid key={positionKey} sx={{ textAlign: "center" }}>
                      <Card
                        sx={{
                          p: 1.5,
                          textAlign: "center",
                          minWidth: isMobile ? 120 : 150,
                          width: "100%",
                          height: isMobile ? 80 : 100,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: 2,
                          boxShadow: 3,
                          willChange: "transform, box-shadow", // Hint for browser optimization
                          transform: "translateZ(0)", // Force GPU acceleration
                          transition: "transform 0.2s ease, box-shadow 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-4px) translateZ(0)",
                            boxShadow: 6,
                          },
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          sx={{
                            color: "primary.main",
                            mb: 0.5,
                          }}
                        >
                          {position}
                        </Typography>

                        <Select
                          fullWidth
                          displayEmpty
                          value={assignedPlayers[positionKey] || ""}
                          onChange={(e) =>
                            handlePlayerAssign(positionKey, e.target.value)
                          }
                          size={isMobile ? "small" : "medium"}
                          sx={{
                            ".MuiOutlinedInput-notchedOutline": {
                              borderColor: assignedPlayer
                                ? "transparent"
                                : "inherit",
                            },
                            backgroundColor: assignedPlayer
                              ? "rgba(25, 118, 210, 0.08)"
                              : "transparent",
                            borderRadius: 1.5,
                          }}
                        >
                          <MenuItem value="">
                            <Typography variant="body2" color="text.secondary">
                              Select Player
                            </Typography>
                          </MenuItem>

                          {positionOrder.flatMap((posCategory, index) => {
                            const groupedPlayers = players.filter(
                              (player) => player.position === posCategory
                            );
                            if (groupedPlayers.length === 0) return [];

                            return [
                              index > 0 && (
                                <Divider key={`divider-${posCategory}`} />
                              ),
                              <ListSubheader key={`header-${posCategory}`}>
                                {posCategory}
                              </ListSubheader>,
                              ...groupedPlayers.map((player) => {
                                const isAlreadyAssigned = assignedPlayerEmails.has(player.email) && assignedPlayers[positionKey] !== player.email;
                                return (
                                  <MenuItem
                                    key={player.email}
                                    value={player.email}
                                    disabled={isAlreadyAssigned}
                                  >
                                    {player.name}
                                    {isAlreadyAssigned && " (already assigned)"}
                                  </MenuItem>
                                );
                              }),
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
        <Paper
          elevation={2}
          sx={paperSx}
        >
          <Typography
            variant="h6"
            fontWeight={500}
            sx={{ mb: 2, display: "flex", alignItems: "center" }}
          >
            Substitutes ({substitutes.length}/10)
          </Typography>

          {/* List of Substitutes */}
          {substitutes.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No substitutes added yet.
            </Typography>
          ) : (
            <Paper variant="outlined" sx={{ mb: 3 }}>
              <List disablePadding>
                {substitutes.map((playerEmail) => (
                  <ListItem
                    key={playerEmail}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="remove"
                        onClick={() => handleRemoveSubstitute(playerEmail)}
                      >
                        <PersonRemoveIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText 
                      primary={getPlayerName(playerEmail)} 
                      secondary={players.find(p => p.email === playerEmail)?.position}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Available Players
          </Typography>

          {/* List of Available Players */}
          {availableSubstitutes.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No available players to add.
            </Typography>
          ) : (
            <Paper variant="outlined">
              <List disablePadding>
                {availableSubstitutes.map((player) => (
                  <ListItem
                    key={player.email}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="add"
                        onClick={() => handleAddSubstitute(player.email)}
                        disabled={substitutes.length >= 10}
                      >
                        <PersonAddIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText 
                      primary={player.name} 
                      secondary={player.position}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Paper>

        {/* Strategy Notes */}
        <Paper
          elevation={2}
          sx={paperSx}
        >
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
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
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
                  "&:hover": {
                    boxShadow: 6,
                  },
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
