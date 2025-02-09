import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { fetchPlayers } from '../../services/team_management';
import { getClubInfo } from '../../services/user_management';
import { auth } from '../../services/firebaseConfig';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

// Player Interface
interface Player {
    name: string;
    dob: string;
    position: string;
    uid: string;
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
    const [players, setPlayers] = useState<Player[]>([]);
    const [clubName, setClubName] = useState<string | null>(null);
    const [ageGroup, setAgeGroup] = useState<string | null>(null);
    const [division, setDivision] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClubAndPlayers = async () => {
            try {
                const user = auth.currentUser;
                if (!user || !user.email) {
                    console.error('No authenticated user found');
                    return;
                }

                // Get club, age group, and division
                const { clubName, ageGroup, division } = await getClubInfo(user.email);
                if (!clubName || !ageGroup || !division) {
                    console.error('Club information is incomplete');
                    return;
                }

                setClubName(clubName);
                setAgeGroup(ageGroup);
                setDivision(division);

                // Fetch players
                const playersData = await fetchPlayers(clubName, ageGroup, division);
                setPlayers(playersData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching club or players:', error);
                setLoading(false);
            }
        };

        fetchClubAndPlayers();
    }, []);

    if (loading) {
        return (
            <Layout>
                <Header />
                <LoadingSpinner />
            </Layout>
        );
    }

    return (
        <Layout>
            <Header />
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 2 }}>
                    Players in {clubName} ({ageGroup}, {division})
                </Typography>
                <Grid container spacing={3}>
                    {players.map((player, index) => (
                        <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <Card
                                sx={{
                                    p: 2,
                                    cursor: 'pointer',
                                    transition: '0.3s',
                                    '&:hover': {
                                        boxShadow: 3,
                                    },
                                }}
                                onClick={() =>
                                    navigate(`/team/players/${encodeURIComponent(player.uid)}`, {
                                        state: { player }, // Pass player data through navigation state
                                    })
                                }
                            >

                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        {player.name}
                                    </Typography>
                                    <Typography variant="body1">
                                        Position: {player.position}
                                    </Typography>
                                    <Typography variant="body1">Age: {calculateAge(player.dob)}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Layout>
    );
}
