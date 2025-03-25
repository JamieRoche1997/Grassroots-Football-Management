import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import {
    Avatar, Box, Card, CardContent, Typography, Button, Grid2 as Grid, Select, MenuItem, FormControl,
    Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, List, ListItem, ListItemText,
    ListItemIcon, TextField, Stack, Chip, useTheme, styled, alpha, InputLabel
} from '@mui/material';
import {
    FilterList,
    SportsSoccer,
    Add,
    Delete,
    Person,
    Group,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { checkUserExists, createUserPre } from '../../services/authentication';
import { createProfile } from '../../services/profile';
import { createMembership, getMembershipsForTeam, deleteMembership } from '../../services/membership';
import { updateProfile } from '../../services/profile';

// Styled Components
const PlayerCard = styled(Card)(({ theme }) => ({
    borderRadius: 12,
    transition: 'all 0.3s ease',
    boxShadow: theme.shadows[2],
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[6],
        backgroundColor: alpha(theme.palette.primary.main, 0.05)
    }
}));

const PositionChip = styled(Chip)(({ theme }) => ({
    fontWeight: 600,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main
}));

const FilterButton = styled(Button)(({ theme }) => ({
    borderRadius: 20,
    textTransform: 'none',
    padding: '6px 16px',
    transition: 'all 0.2s',
    '&.MuiButton-contained': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText
    }
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
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export default function TeamPlayers() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { clubName, ageGroup, division, loading: authLoading, role } = useAuth();
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<string>('All');
    const [sortOption, setSortOption] = useState('name');
    const [addPlayerOpen, setAddPlayerOpen] = useState(false);
    const [newPlayer, setNewPlayer] = useState({ name: '', email: '', position: '', dob: '', uid: '' });
    const [removePlayerOpen, setRemovePlayerOpen] = useState(false);
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const uid = Math.random().toString(36).substr(2, 9);

    const isCoach = role === "coach";

    const fetchClubAndPlayers = useCallback(async () => {
        if (authLoading) return;

        try {
            setLoading(true);
            if (!clubName || !ageGroup || !division) {
                setError('Club information is incomplete.');
                setLoading(false);
                return;
            }

            const playersData = await getMembershipsForTeam(clubName, ageGroup, division);
            setPlayers(playersData);
            setError(null);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load players. Please try again later.');
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
            if (sortOption === 'name') return a.name.localeCompare(b.name);
            if (sortOption === 'age') return calculateAge(a.dob) - calculateAge(b.dob);
            return 0;
        });
    }, [players, sortOption]);

    const filteredPlayers = useMemo(() => {
        if (selectedFilter === 'All') return sortedPlayers;
        return sortedPlayers.filter(player => player.position.toLowerCase() === selectedFilter.toLowerCase());
    }, [sortedPlayers, selectedFilter]);

    const togglePlayerSelection = (playerEmail: string) => {
        setSelectedPlayers((prev) =>
            prev.includes(playerEmail) ? prev.filter((email) => email !== playerEmail) : [...prev, playerEmail]
        );
    };

    const handleAddPlayer = async () => {
        if (!clubName || !ageGroup || !division || !newPlayer.name || !newPlayer.email || !newPlayer.position) {
            alert('Please fill in all fields.');
            return;
        }

        try {
            const userExists = await checkUserExists(newPlayer.email);
            if (userExists) {
                alert('A user with this email already exists. Please ask them to sign in.');
                return;
            }

            await createUserPre(newPlayer.email, uid, 'player');
            await createProfile(
                newPlayer.email,
                newPlayer.name,
                'player',
                false,
                clubName,
                ageGroup,
                division,
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
                role: 'player',
                userRegistered: false,
            });

            alert('Player added successfully!');
            setAddPlayerOpen(false);
            setNewPlayer({ name: '', email: '', position: '', dob: '', uid: '' });
            fetchClubAndPlayers();
        } catch (error) {
            console.error('Error adding player:', error);
            alert('Failed to add player. Please try again.');
        }
    };

    const handleRemovePlayers = async () => {
        if (selectedPlayers.length === 0) {
            alert('Select players to remove.');
            return;
        }

        try {
            await Promise.all(
                selectedPlayers.map(async (playerEmail) => {
                    if (clubName && ageGroup && division) {
                        await deleteMembership(clubName, ageGroup, division, playerEmail);
                        await updateProfile(playerEmail, {
                            clubName: "",
                            ageGroup: "",
                            division: ""
                        });
                    }
                })
            );

            alert(`Successfully removed players: ${selectedPlayers.join(', ')}`);
            fetchClubAndPlayers();
            setRemovePlayerOpen(false);
            setSelectedPlayers([]);
        } catch (error) {
            console.error('Error removing players:', error);
            alert('Error removing players. Please try again.');
        }
    };

    if (authLoading || loading) {
        return (
            <Layout>
                <Header />
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
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
                    <Typography color="error" variant="h6">{error}</Typography>
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
                maxWidth: 1400,
                mx: 'auto'
            }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Group sx={{
                            fontSize: 40,
                            color: 'primary.main',
                            p: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            borderRadius: '50%'
                        }} />
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
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                <FilterList color="action" sx={{ mr: 1 }} />
                                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                    Filter:
                                </Typography>
                            </Box>

                            {['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'].map((position) => (
                                <FilterButton
                                    key={position}
                                    onClick={() => setSelectedFilter(position)}
                                    variant={selectedFilter === position ? "contained" : "outlined"}
                                >
                                    {position}
                                </FilterButton>
                            ))}

                            <FormControl size="small" sx={{ minWidth: 120, ml: 'auto' }}>
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
                            <Box sx={{
                                textAlign: 'center',
                                py: 6,
                                border: `1px dashed ${theme.palette.divider}`,
                                borderRadius: 2
                            }}>
                                <SportsSoccer color="disabled" sx={{ fontSize: 60, mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    No players found
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {selectedFilter === 'All' ?
                                        'No players in the squad yet' :
                                        `No ${selectedFilter.toLowerCase()}s in the squad`}
                                </Typography>
                            </Box>
                        </Grid>
                    ) : (
                        filteredPlayers.map((player) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={player.email}>
                                <PlayerCard
                                    onClick={() => handlePlayerClick(player.uid, player.email)}
                                    sx={{ cursor: 'pointer', height: '100%' }}    >
                                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                        <Avatar
                                            src={player.image}
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                mx: 'auto',
                                                mb: 2,
                                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                                                color: theme.palette.primary.main,
                                                fontSize: 32
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
                    onClose={() => setAddPlayerOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 4,
                        },
                    }}
                >
                    <DialogTitle sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        fontWeight: 600
                    }}>
                        <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Add New Player
                    </DialogTitle>
                    <DialogContent sx={{ p: 3 }}>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <TextField
                                label="Full Name"
                                fullWidth
                                value={newPlayer.name}
                                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                            />
                            <TextField
                                label="Email"
                                fullWidth
                                type="email"
                                value={newPlayer.email}
                                onChange={(e) => setNewPlayer({ ...newPlayer, email: e.target.value })}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Position</InputLabel>
                                <Select
                                    value={newPlayer.position}
                                    onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                                    label="Position"
                                >
                                    <MenuItem value="Goalkeeper">Goalkeeper</MenuItem>
                                    <MenuItem value="Defender">Defender</MenuItem>
                                    <MenuItem value="Midfielder">Midfielder</MenuItem>
                                    <MenuItem value="Forward">Forward</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setAddPlayerOpen(false)}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={handleAddPlayer}
                            disabled={!newPlayer.name || !newPlayer.email || !newPlayer.position}
                        >
                            Add Player
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Remove Player Dialog */}
                <Dialog
                    open={removePlayerOpen}
                    onClose={() => setRemovePlayerOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 4,
                        },
                    }}
                >
                    <DialogTitle sx={{
                        bgcolor: 'error.main',
                        color: 'error.contrastText',
                        fontWeight: 600
                    }}>
                        <Delete sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Remove Players
                    </DialogTitle>
                    <DialogContent sx={{ p: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Select players to remove from the squad:
                        </Typography>
                        <List dense>
                            {players.map((player) => (
                                <ListItem
                                    key={player.email}
                                    sx={{
                                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.1) }
                                    }}
                                >
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={selectedPlayers.includes(player.email)}
                                            onChange={() => togglePlayerSelection(player.email)}
                                            color="error"
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={player.name}
                                        secondary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PositionChip
                                                    label={player.position}
                                                    size="small"
                                                />
                                                <Typography variant="caption">
                                                    Age: {calculateAge(player.dob)}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setRemovePlayerOpen(false)}>Cancel</Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleRemovePlayers}
                            disabled={selectedPlayers.length === 0}
                        >
                            Remove Selected
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Layout>
    );
}