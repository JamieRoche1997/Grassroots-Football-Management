import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid2 as Grid,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Stack,
  Chip,
  useTheme,
  styled,
  alpha,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  FilterList,
  SportsSoccer,
  Add,
  Delete,
  Person,
  Group,
  Warning,
} from "@mui/icons-material";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import { checkUserExists, createUserPre } from "../../services/authentication";
import { createProfile } from "../../services/profile";
import {
  createMembership,
  getMembershipsForTeam,
  deleteMembership,
} from "../../services/membership";
import { updateProfile } from "../../services/profile";

// Styled Components
const PlayerCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  transition: "all 0.3s ease",
  boxShadow: theme.shadows[2],
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[6],
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
}));

const PositionChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
}));

const FilterButton = styled(Button)(({ theme }) => ({
  borderRadius: 20,
  textTransform: "none",
  padding: "6px 16px",
  transition: "all 0.2s",
  "&.MuiButton-contained": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

// Player Interface
interface Player {
  email: string;
  name: string;
  dob: string;
  position: string;
  uid: string;
  image?: string;
}

const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

export default function TeamPlayers() {
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    clubName,
    ageGroup,
    division,
    loading: authLoading,
    role,
  } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [sortOption, setSortOption] = useState("name");
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    email: "",
    position: "",
    dob: "",
    uid: "",
  });
  const [removePlayerOpen, setRemovePlayerOpen] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    position?: string;
    dob?: string;
  }>({});
  const uid = Math.random().toString(36).substr(2, 9);

  const isCoach = role === "coach";

  const fetchClubAndPlayers = useCallback(async () => {
    if (authLoading) return;

    try {
      setLoading(true);
      if (!clubName || !ageGroup || !division) {
        setError("Club information is incomplete.");
        setLoading(false);
        return;
      }

      const playersData = await getMembershipsForTeam(
        clubName,
        ageGroup,
        division
      );
      setPlayers(playersData);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load players. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [authLoading, clubName, ageGroup, division]);

  const handlePlayerClick = (playerUid: string, playerEmail: string) => {
    navigate(`/ratings/players/${playerUid}`, { state: { playerEmail } });
  };

  useEffect(() => {
    if (!authLoading) {
      fetchClubAndPlayers();
    }
  }, [fetchClubAndPlayers, authLoading]);

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      if (sortOption === "name") return a.name.localeCompare(b.name);
      if (sortOption === "age")
        return calculateAge(a.dob) - calculateAge(b.dob);
      return 0;
    });
  }, [players, sortOption]);

  const filteredPlayers = useMemo(() => {
    if (selectedFilter === "All") return sortedPlayers;
    return sortedPlayers.filter(
      (player) => player.position.toLowerCase() === selectedFilter.toLowerCase()
    );
  }, [sortedPlayers, selectedFilter]);

  const togglePlayerSelection = (playerEmail: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerEmail)
        ? prev.filter((email) => email !== playerEmail)
        : [...prev, playerEmail]
    );
  };

  const validateForm = () => {
    const errors: {
      name?: string;
      email?: string;
      position?: string;
      dob?: string;
    } = {};
    let isValid = true;

    if (!newPlayer.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!newPlayer.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(newPlayer.email.trim())
    ) {
      errors.email = "Invalid email address";
      isValid = false;
    }

    if (!newPlayer.position) {
      errors.position = "Position is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleAddPlayer = async () => {
    if (!validateForm()) {
      return;
    }

    if (!clubName || !ageGroup || !division) {
      setSnackbar({
        open: true,
        message: "Team information is incomplete",
        severity: "error",
      });
      return;
    }

    try {
      setActionLoading(true);
      const userExists = await checkUserExists(newPlayer.email);
      if (userExists) {
        setSnackbar({
          open: true,
          message: "A user with this email already exists. Please ask them to sign in.",
          severity: "warning",
        });
        return;
      }

      await createUserPre(newPlayer.email, uid, "player");
      await createProfile(
        newPlayer.email,
        newPlayer.name,
        "player",
        false,
        clubName,
        ageGroup,
        division
      );

      await createMembership({
        email: newPlayer.email,
        name: newPlayer.name,
        dob: newPlayer.dob,
        uid: uid,
        position: newPlayer.position,
        clubName: clubName,
        ageGroup: ageGroup,
        division: division,
        role: "player",
        userRegistered: false,
      });

      setSnackbar({
        open: true,
        message: "Player added successfully!",
        severity: "success",
      });
      setAddPlayerOpen(false);
      setNewPlayer({ name: "", email: "", position: "", dob: "", uid: "" });
      fetchClubAndPlayers();
    } catch (error) {
      console.error("Error adding player:", error);
      setSnackbar({
        open: true,
        message: "Failed to add player. Please try again.",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemovePlayers = async () => {
    if (selectedPlayers.length === 0) {
      setSnackbar({
        open: true,
        message: "Select players to remove",
        severity: "warning",
      });
      return;
    }

    try {
      setActionLoading(true);
      await Promise.all(
        selectedPlayers.map(async (playerEmail) => {
          if (clubName && ageGroup && division) {
            await deleteMembership(clubName, ageGroup, division, playerEmail);
            await updateProfile(playerEmail, {
              clubName: "",
              ageGroup: "",
              division: "",
            });
          }
        })
      );

      setSnackbar({
        open: true,
        message: `Successfully removed ${selectedPlayers.length} player${
          selectedPlayers.length > 1 ? "s" : ""
        }`,
        severity: "success",
      });
      fetchClubAndPlayers();
      setRemovePlayerOpen(false);
      setConfirmRemoveOpen(false);
      setSelectedPlayers([]);
    } catch (error) {
      console.error("Error removing players:", error);
      setSnackbar({
        open: true,
        message: "Error removing players. Please try again.",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRemove = () => {
    setConfirmRemoveOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <Header />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 200,
          }}
        >
          <LoadingSpinner />
        </Box>
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
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 3,
          maxWidth: 1400,
          mx: "auto",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Group
              sx={{
                fontSize: 40,
                color: "primary.main",
                p: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: "50%",
              }}
            />
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Team Squad
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {ageGroup} {division} • {clubName}
              </Typography>
            </Box>
          </Stack>

          {isCoach && (
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddPlayerOpen(true)}
                sx={{ borderRadius: 2 }}
              >
                Add Player
              </Button>
              <Button
                variant="outlined"
                startIcon={<Delete />}
                onClick={() => setRemovePlayerOpen(true)}
                sx={{ borderRadius: 2 }}
                color="error"
              >
                Remove Players
              </Button>
            </Stack>
          )}
        </Stack>

        {/* Filters */}
        <Card sx={{ mb: 4, p: 2, borderRadius: 3 }}>
          <CardContent>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ flexWrap: "wrap" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                <FilterList color="action" sx={{ mr: 1 }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mr: 1 }}
                >
                  Filter:
                </Typography>
              </Box>

              {["All", "Goalkeeper", "Defender", "Midfielder", "Forward"].map(
                (position) => (
                  <FilterButton
                    key={position}
                    onClick={() => setSelectedFilter(position)}
                    variant={
                      selectedFilter === position ? "contained" : "outlined"
                    }
                  >
                    {position}
                  </FilterButton>
                )
              )}

              <FormControl size="small" sx={{ minWidth: 120, ml: "auto" }}>
                <Select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <MenuItem value="name">Sort by Name</MenuItem>
                  <MenuItem value="age">Sort by Age</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        {/* Players Grid */}
        <Grid container spacing={3}>
          {filteredPlayers.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                  border: `1px dashed ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <SportsSoccer color="disabled" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No players found
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {selectedFilter === "All"
                    ? "No players in the squad yet"
                    : `No ${selectedFilter.toLowerCase()}s in the squad`}
                </Typography>
              </Box>
            </Grid>
          ) : (
            filteredPlayers.map((player) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={player.email}>
                <PlayerCard
                  onClick={() => handlePlayerClick(player.uid, player.email)}
                  sx={{ cursor: "pointer", height: "100%" }}
                >
                  <CardContent sx={{ textAlign: "center", p: 3 }}>
                    <Avatar
                      src={player.image}
                      sx={{
                        width: 80,
                        height: 80,
                        mx: "auto",
                        mb: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                        color: theme.palette.primary.main,
                        fontSize: 32,
                      }}
                    >
                      {player.name.charAt(0)}
                    </Avatar>

                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {player.name}
                    </Typography>

                    <PositionChip
                      label={player.position}
                      size="small"
                      sx={{ mb: 2 }}
                    />

                    <Typography variant="body1" color="text.secondary">
                      Age: {calculateAge(player.dob)}
                    </Typography>
                  </CardContent>
                </PlayerCard>
              </Grid>
            ))
          )}
        </Grid>

        {/* Add Player Dialog */}
        <Dialog
          open={addPlayerOpen}
          onClose={() => !actionLoading && setAddPlayerOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 600,
            }}
          >
            <Person sx={{ mr: 1, verticalAlign: "middle" }} />
            Add New Player
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Full Name"
                fullWidth
                value={newPlayer.name}
                onChange={(e) =>
                  setNewPlayer({ ...newPlayer, name: e.target.value })
                }
                error={!!formErrors.name}
                helperText={formErrors.name}
                disabled={actionLoading}
              />
              <TextField
                label="Email"
                fullWidth
                type="email"
                value={newPlayer.email}
                onChange={(e) =>
                  setNewPlayer({ ...newPlayer, email: e.target.value })
                }
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={actionLoading}
              />
             
              <FormControl fullWidth error={!!formErrors.position}>
                <InputLabel>Position</InputLabel>
                <Select
                  value={newPlayer.position}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, position: e.target.value })
                  }
                  label="Position"
                  disabled={actionLoading}
                >
                  <MenuItem value="Goalkeeper">Goalkeeper</MenuItem>
                  <MenuItem value="Defender">Defender</MenuItem>
                  <MenuItem value="Midfielder">Midfielder</MenuItem>
                  <MenuItem value="Forward">Forward</MenuItem>
                </Select>
                {formErrors.position && (
                  <Typography color="error" variant="caption" sx={{ mt: 1, ml: 2 }}>
                    {formErrors.position}
                  </Typography>
                )}
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setAddPlayerOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddPlayer}
              disabled={actionLoading}
              startIcon={actionLoading ? <CircularProgress size={20} /> : null}
            >
              {actionLoading ? "Adding..." : "Add Player"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Remove Player Dialog */}
        <Dialog
          open={removePlayerOpen}
          onClose={() => !actionLoading && setRemovePlayerOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "error.main",
              color: "error.contrastText",
              fontWeight: 600,
            }}
          >
            <Delete sx={{ mr: 1, verticalAlign: "middle" }} />
            Remove Players
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select players to remove from the squad:
            </Typography>
            {players.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                No players available to remove
              </Alert>
            ) : (
              <List dense>
                {players.map((player) => (
                  <ListItem
                    key={player.email}
                    sx={{
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.1
                      )}`,
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.action.hover, 0.1),
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={selectedPlayers.includes(player.email)}
                        onChange={() => togglePlayerSelection(player.email)}
                        color="error"
                        disabled={actionLoading}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={player.name}
                      secondary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <PositionChip label={player.position} size="small" />
                          <Typography variant="caption">
                            Age: {calculateAge(player.dob)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setRemovePlayerOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmRemove}
              disabled={selectedPlayers.length === 0 || actionLoading}
            >
              Remove Selected
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Remove Dialog */}
        <Dialog
          open={confirmRemoveOpen}
          onClose={() => !actionLoading && setConfirmRemoveOpen(false)}
          maxWidth="xs"
          PaperProps={{
            sx: {
              borderRadius: 4,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>
            <Warning color="error" sx={{ mr: 1, verticalAlign: "middle" }} />
            Confirm Removal
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to remove {selectedPlayers.length} player
              {selectedPlayers.length !== 1 ? "s" : ""} from the squad?
            </Typography>
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setConfirmRemoveOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleRemovePlayers}
              disabled={actionLoading}
              startIcon={actionLoading ? <CircularProgress size={20} /> : null}
            >
              {actionLoading ? "Removing..." : "Remove"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
}
