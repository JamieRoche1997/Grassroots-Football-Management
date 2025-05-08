import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
  Button,
  styled,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ArrowBack,
  SportsSoccer,
  EmojiEvents,
  LocalActivity,
  Warning,
  Dangerous,
  Home,
  FlightTakeoff,
  AllInclusive,
} from "@mui/icons-material";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import { listAllPlayerStats, PlayerStats } from "../../services/player_stats";
import { getMembershipsForTeam } from "../../services/membership";
import { useAuth } from "../../hooks/useAuth";

// Type definitions to include playerUid
interface PlayerStatsWithUid extends PlayerStats {
  playerUid?: string;
}

// Styled Components
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
  transition: "background-color 0.2s",
}));

// Type definitions
type SortDirection = "asc" | "desc";
type StatType = "goals" | "assists" | "yellowCards" | "redCards";
type GameLocation = "all" | "home" | "away";

export default function TeamStats() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { clubName, ageGroup, division } = useAuth();
  
  // State variables
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerStatsWithUid[]>([]);
  const [statType, setStatType] = useState<StatType>("goals");
  const [gameLocation, setGameLocation] = useState<GameLocation>("all");
  const [sortOrder, setSortOrder] = useState<SortDirection>("desc");
  
  // Fetch team stats and player UIDs on component mount
  useEffect(() => {
    const fetchTeamStats = async () => {
      if (!clubName || !ageGroup || !division) {
        setError("Missing team information");
        setLoading(false);
        return;
      }
      
      try {
        // First get the player membership data to access the UIDs
        const memberships = await getMembershipsForTeam(clubName, ageGroup, division);
        
        // Now fetch the player stats
        const response = await listAllPlayerStats(
          clubName,
          ageGroup,
          division
        );
        
        // Combine player stats with their UIDs
        const statsWithUids = response.allPlayers.map((player: PlayerStats) => ({
          ...player,
          playerUid: memberships.find((m: {email: string, uid: string}) => m.email === player.playerEmail)?.uid
        }));
        
        setPlayers(statsWithUids);
      } catch (err) {
        console.error("Error fetching team stats:", err);
        const errorMessage = err instanceof Error 
          ? err.message 
          : "Failed to fetch team statistics";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamStats();
  }, [clubName, ageGroup, division]);
  
  // Handle navigation to player stats page
  const handlePlayerClick = (player: PlayerStatsWithUid) => {
    if (!player.playerEmail) {
      console.error("Player email is missing");
      return;
    }
    
    // If we have the UID, use it for navigation, otherwise use email as fallback
    const playerId = player.playerUid || player.playerEmail;
    navigate(`/ratings/players/${playerId}`, { state: { playerEmail: player.playerEmail } });
  };
  
  // Handle stat type change
  const handleStatTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newStatType: StatType | null
  ) => {
    if (newStatType !== null) {
      setStatType(newStatType);
    }
  };
  
  // Handle game location change
  const handleGameLocationChange = (
    _event: React.MouseEvent<HTMLElement>,
    newLocation: GameLocation | null
  ) => {
    if (newLocation !== null) {
      setGameLocation(newLocation);
    }
  };
  
  // Handle sort direction toggle
  const handleSortDirectionChange = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  
  // Get the appropriate stat value based on game location
  const getStatValue = (player: PlayerStatsWithUid) => {
    if (gameLocation === "home" && player.homeStats) {
      return player.homeStats[statType] || 0;
    } else if (gameLocation === "away" && player.awayStats) {
      return player.awayStats[statType] || 0;
    }
    return player[statType] || 0;
  };
  
  // Get games played value based on game location
  const getGamesPlayed = (player: PlayerStatsWithUid) => {
    if (gameLocation === "home" && player.homeStats) {
      return player.homeStats.gamesPlayed || 0;
    } else if (gameLocation === "away" && player.awayStats) {
      return player.awayStats.gamesPlayed || 0;
    }
    return player.gamesPlayed || 0;
  };
  
  // Sort players by selected stat type
  const sortedPlayers = [...players].sort((a, b) => {
    let valueA = 0;
    let valueB = 0;
    
    // Get the appropriate stats based on game location filter
    if (gameLocation === "home") {
      valueA = a.homeStats ? a.homeStats[statType] || 0 : 0;
      valueB = b.homeStats ? b.homeStats[statType] || 0 : 0;
    } else if (gameLocation === "away") {
      valueA = a.awayStats ? a.awayStats[statType] || 0 : 0;
      valueB = b.awayStats ? b.awayStats[statType] || 0 : 0;
    } else {
      valueA = a[statType] || 0;
      valueB = b[statType] || 0;
    }
    
    return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
  });
  
  // Navigate back
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // Get icon for current stat type
  const getStatIcon = () => {
    switch(statType) {
      case "goals": return <EmojiEvents fontSize="small" />;
      case "assists": return <LocalActivity fontSize="small" />;
      case "yellowCards": return <Warning fontSize="small" />;
      case "redCards": return <Dangerous fontSize="small" />;
      default: return <EmojiEvents fontSize="small" />;
    }
  };
  
  // Get color for stat type
  const getStatColor = () => {
    switch(statType) {
      case "goals": return theme.palette.primary.main;
      case "assists": return theme.palette.primary.main;
      case "yellowCards": return theme.palette.warning.main;
      case "redCards": return theme.palette.error.main;
      default: return theme.palette.primary.main;
    }
  };
  
  return (
    <Layout>
      <Header />
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
          sx={{ mb: 2 }}
          variant="text"
        >
          Back
        </Button>
        
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SportsSoccer
              sx={{
                color: "primary.main",
                p: 0.8,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: "50%",
              }}
            />
            Team Statistics
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
            <CircularProgress size={60} />
            <Typography color="text.secondary">Loading team statistics...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="bold">Error</Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        ) : (
          <>
            <Box sx={{ mb: 4, display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Stat Type</Typography>
                <ToggleButtonGroup
                  value={statType}
                  exclusive
                  onChange={handleStatTypeChange}
                  aria-label="stat type"
                  size="small"
                >
                  <ToggleButton value="goals" aria-label="goals">
                    <EmojiEvents fontSize="small" sx={{ mr: 0.5 }} /> Goals
                  </ToggleButton>
                  <ToggleButton value="assists" aria-label="assists">
                    <LocalActivity fontSize="small" sx={{ mr: 0.5 }} /> Assists
                  </ToggleButton>
                  <ToggleButton value="yellowCards" aria-label="yellow cards">
                    <Warning fontSize="small" sx={{ mr: 0.5 }} /> Yellow Cards
                  </ToggleButton>
                  <ToggleButton value="redCards" aria-label="red cards">
                    <Dangerous fontSize="small" sx={{ mr: 0.5 }} /> Red Cards
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>Game Location</Typography>
                <ToggleButtonGroup
                  value={gameLocation}
                  exclusive
                  onChange={handleGameLocationChange}
                  aria-label="game location"
                  size="small"
                >
                  <ToggleButton value="all" aria-label="all games">
                    <AllInclusive fontSize="small" sx={{ mr: 0.5 }} /> All Games
                  </ToggleButton>
                  <ToggleButton value="home" aria-label="home games">
                    <Home fontSize="small" sx={{ mr: 0.5 }} /> Home
                  </ToggleButton>
                  <ToggleButton value="away" aria-label="away games">
                    <FlightTakeoff fontSize="small" sx={{ mr: 0.5 }} /> Away
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
            
            <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2, overflow: "hidden" }}>
              <Table aria-label="team statistics table">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">#</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">Player</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={true}
                        direction={sortOrder}
                        onClick={handleSortDirectionChange}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ color: getStatColor() }}>
                            {statType === "goals" ? "Goals" : 
                            statType === "assists" ? "Assists" : 
                            statType === "yellowCards" ? "Yellow Cards" : 
                            "Red Cards"}
                          </Typography>
                          {getStatIcon()}
                        </Box>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight="bold">Games Played</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedPlayers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">No statistics available for this team</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedPlayers.map((player, index) => (
                      <StyledTableRow 
                        key={player.playerEmail} 
                        onClick={() => handlePlayerClick(player)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{player.playerName}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" sx={{ color: getStatColor() }}>
                            {getStatValue(player)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{getGamesPlayed(player)}</TableCell>
                      </StyledTableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Note: Click on a player to view their detailed statistics
            </Typography>
          </>
        )}
      </Box>
    </Layout>
  );
} 