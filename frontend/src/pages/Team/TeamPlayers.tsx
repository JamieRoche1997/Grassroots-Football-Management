import { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Avatar, Box, Card, CardContent, Typography, Button, Grid2 as Grid, Select, MenuItem, FormControl, InputLabel,
    Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, List, ListItem, ListItemText, ListItemIcon, TextField
} from '@mui/material';
import { fetchPlayers, removePlayersFromClub } from '../../services/team_management';
import { updateUserProfile, createUserInFirestore, checkUserExists } from '../../services/user_management';
import { v4 as uuidv4 } from 'uuid';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Player Interface
interface Player {
    email: string;
    name: string;
    dob: string;
    position: string;
    uid: string;
    image?: string; // Optional profile picture
}

// Function to calculate age from dob
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
    const { clubName, ageGroup, division, loading: authLoading } = useAuth();
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<string | null>('All');
    const [sortOption, setSortOption] = useState<string>('name');
    const [addPlayerOpen, setAddPlayerOpen] = useState(false);
    const [newPlayer, setNewPlayer] = useState({ name: '', email: '', position: '' });
    const [removePlayerOpen, setRemovePlayerOpen] = useState(false);
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const navigate = useNavigate();

    // Fetch players and club info
    const fetchClubAndPlayers = useCallback(async () => {
        if (authLoading) return;

        try {
            setLoading(true);
            if (!clubName || !ageGroup || !division) {
                setError('Club information is incomplete.');
                setLoading(false);
                return;
            }

            // Fetch players
            const playersData = await fetchPlayers(clubName, ageGroup, division);
            setPlayers(playersData);
            setError(null);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load players. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [authLoading, clubName, ageGroup, division]);

    useEffect(() => {
        if (!authLoading) {
            fetchClubAndPlayers();
        }
    }, [fetchClubAndPlayers, authLoading]);

    // Handle sorting logic
    const sortedPlayers = useMemo(() => {
        return [...players].sort((a, b) => {
            if (sortOption === 'name') return a.name.localeCompare(b.name);
            if (sortOption === 'age') return calculateAge(a.dob) - calculateAge(b.dob);
            return 0;
        });
    }, [players, sortOption]);

    // Filter players based on selected position
    const filteredPlayers = useMemo(() => {
        if (selectedFilter === 'All' || !selectedFilter) return sortedPlayers;
        return sortedPlayers.filter(player => player.position.toLowerCase() === selectedFilter.toLowerCase());
    }, [sortedPlayers, selectedFilter]);

    // Handle selecting players for removal 
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

            const uid = uuidv4(); // Generate a UID for the new player
            await createUserInFirestore(uid, newPlayer.email, newPlayer.name, 'player', clubName, ageGroup, division, false);

            alert('Player added successfully!');
            setAddPlayerOpen(false);
            setNewPlayer({ name: '', email: '', position: '' });

            // Refresh players list
            fetchClubAndPlayers();
        } catch (error) {
            console.error('Error adding player:', error);
            alert('Failed to add player. Please try again.');
        }
    };

    // Handle removing players (Placeholder API Call)
    const handleRemovePlayers = async () => {
        if (selectedPlayers.length === 0) {
            alert('Select players to remove.');
            return;
        }

        try {
            console.log('Removing players:', selectedPlayers);

            await removePlayersFromClub(clubName!, ageGroup!, division!, selectedPlayers);

            // Now update each player's profile in Firestore to remove club info
            await Promise.all(
                selectedPlayers.map(async (playerEmail) => {
                    await updateUserProfile({
                        email: playerEmail,
                        clubName: '',
                        ageGroup: '',
                        division: '',
                    });
                })
            );

            alert(`Successfully removed players: ${selectedPlayers.join(', ')}`);

            // Refresh the players list after removal
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
                <LoadingSpinner />
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <Header />
                <Box>
                    <Typography color="error" variant="h6">{error}</Typography>
                </Box>
            </Layout>
        );
    }

    return (
        <Layout>
            <Header />
            <Box>
                <Typography variant="h4" sx={{ mb: 2 }}>
                    Players in {clubName} ({ageGroup}, {division})
                </Typography>

                <Button variant="contained" color="primary" sx={{ width: 200, mb: 3, mr: 2 }} onClick={() => setAddPlayerOpen(true)}>
                    ➕ Add Player
                </Button>

                {/* Add Player Modal */}
                <Dialog open={addPlayerOpen} onClose={() => setAddPlayerOpen(false)}>
                    <DialogTitle>Add Player</DialogTitle>
                    <DialogContent>
                        <TextField
                            placeholder="Player Name"
                            fullWidth
                            value={newPlayer.name}
                            onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                            sx={{ mt: 2, mb: 2 }}
                        />
                        <TextField
                            placeholder="Player Email"
                            fullWidth
                            type="email"
                            value={newPlayer.email}
                            onChange={(e) => setNewPlayer({ ...newPlayer, email: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            placeholder="Position"
                            fullWidth
                            value={newPlayer.position}
                            onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAddPlayerOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddPlayer} variant="contained">Add Player</Button>
                    </DialogActions>
                </Dialog>


                <Button variant="contained" color="primary" sx={{ width: 200, mb: 3, mr: 2 }} onClick={() => setRemovePlayerOpen(true)}>
                    ❌ Remove Players
                </Button>

                {/* Remove Player Modal */}
                <Dialog open={removePlayerOpen} onClose={() => setRemovePlayerOpen(false)}>
                    <DialogTitle>Select Players to Remove</DialogTitle>
                    <DialogContent>
                        <List>
                            {players.map((player) => (
                                <ListItem key={player.email} component="div" onClick={() => togglePlayerSelection(player.email)}>
                                    <ListItemIcon>
                                        <Checkbox checked={selectedPlayers.includes(player.email)} />
                                    </ListItemIcon>
                                    <ListItemText primary={player.name} />
                                </ListItem>
                            ))}
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setRemovePlayerOpen(false)}>Cancel</Button>
                        <Button onClick={handleRemovePlayers} variant="contained">Confirm Remove</Button>
                    </DialogActions>
                </Dialog>

                {/* Position Filter Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    {['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward'].map((position) => (
                        <Button
                            key={position}
                            variant={selectedFilter === position ? "contained" : "outlined"}
                            color="primary"
                            onClick={() => setSelectedFilter(position)}
                        >
                            {position}
                        </Button>
                    ))}
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel id="sort-label">Sort by</InputLabel>
                        <Select
                            labelId="sort-label"
                            id="sort-select"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                        >
                            <MenuItem value="name">Name</MenuItem>
                            <MenuItem value="age">Age</MenuItem>
                        </Select>
                    </FormControl>

                </Box>

                {/* Players Grid */}
                <Grid container spacing={3}>
                    {filteredPlayers.length === 0 ? (
                        <Typography variant="h6" color="textSecondary">
                            No players match the selected filters.
                        </Typography>
                    ) : (
                        filteredPlayers.map((player, index) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                                <Card
                                    sx={{
                                        p: 2,
                                        cursor: 'pointer',
                                        transition: '0.3s',
                                        '&:hover': { transform: 'scale(1.05)', boxShadow: 3 },
                                    }}
                                    onClick={() =>
                                        navigate(`/team/players/${encodeURIComponent(player.uid)}`, {
                                            state: { player },
                                        })
                                    }
                                >
                                    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography variant="h6">{player.name}</Typography>
                                            <Typography variant="body2">
                                                Position: {player.position}
                                            </Typography>
                                            <Typography variant="body2">
                                                Age: {calculateAge(player.dob)}
                                            </Typography>
                                        </Box>

                                        {/* Player Image or Initials */}
                                        {player.image ? (
                                            <Avatar
                                                src={player.image}
                                                sx={{ width: 60, height: 60, ml: 2 }}
                                                alt={player.name}
                                            />
                                        ) : (
                                            <Avatar
                                                sx={{
                                                    width: 60,
                                                    height: 60,
                                                    fontSize: 20,
                                                    fontWeight: 'bold',
                                                    color: "#fff",
                                                    ml: 2
                                                }}
                                            >
                                                {player.name
                                                    .split(' ')
                                                    .map(word => word[0])
                                                    .join('')
                                                    .toUpperCase()}
                                            </Avatar>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            </Box>
        </Layout>
    );
}
