import { useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material';
import { getJoinRequests, approveJoinRequest, rejectJoinRequest } from '../../services/team_management';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { createMembership } from '../../services/membership';
import { getProfile, updateProfile } from '../../services/profile';
import { getUser } from '../../services/authentication';
interface JoinRequest {
  id: string;
  playerEmail: string;
  clubName: string;
  ageGroup: string;
  division: string;
  status: string;
  requestedAt: string;
  name: string; // Ensure this field is included
}

export default function TeamRequests() {
  const { clubName, ageGroup, division, loading: authLoading } = useAuth();
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (authLoading) return;

      if (!clubName || !ageGroup || !division) {
        setError('Club information is incomplete.');
        setLoading(false);
        return;
      }

      try {
        const requests = await getJoinRequests(clubName, ageGroup, division);

        setJoinRequests(
          requests.map((request) => ({
            ...request,
            id: request.playerEmail,
            ageGroup,
            division,
          }))
        );
        setError(null);
      } catch (error) {
        console.error('Error fetching join requests:', error);
        setError('Failed to load join requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchRequests();
    }
  }, [clubName, ageGroup, division, authLoading]);

  const handleApprove = async (playerEmail: string) => {
    if (!clubName || !ageGroup || !division) return;

    try {

      const profile = await getProfile(playerEmail);
      const user = await getUser(playerEmail);
      const position = profile.position;

      await createMembership({
        email: playerEmail,
        name: profile.name || '', // Add appropriate value for name
        dob: profile.dob || '', // Add appropriate value for dob
        uid: user.uid || '', // Add appropriate value for uid
        clubName: clubName,
        ageGroup: ageGroup,
        division: division,
        role: 'player',
        position: position || '', // Ensure position is a string
        userRegistered: true // Set to true or false based on your logic
      });

      await updateProfile(playerEmail, { club: clubName, ageGroup, division });
      await approveJoinRequest(playerEmail, clubName, ageGroup, division);
      alert(`Player ${playerEmail} approved.`);
      setJoinRequests((prev) => prev.filter((req) => req.playerEmail !== playerEmail));
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (playerEmail: string) => {
    if (!clubName || !ageGroup || !division) return;

    try {
      await rejectJoinRequest(playerEmail, clubName, ageGroup, division);
      alert(`Player ${playerEmail} rejected.`);
      setJoinRequests((prev) => prev.filter((req) => req.playerEmail !== playerEmail));
    } catch (error) {
      console.error('Error rejecting request:', error);
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
          Player Requests for {clubName} ({ageGroup}, {division})
        </Typography>

        <Paper sx={{ width: '100%', overflow: 'hidden', mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Player Name</TableCell>
                <TableCell>Player Email</TableCell>
                <TableCell>Requested At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {joinRequests.length > 0 ? (
                joinRequests.map((request) => (
                  <TableRow key={request.playerEmail}>
                    <TableCell>{request.name}</TableCell>
                    <TableCell>{request.playerEmail}</TableCell>
                    <TableCell>{request.requestedAt}</TableCell>
                    <TableCell>
                      <Box>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => handleApprove(request.playerEmail)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => handleReject(request.playerEmail)}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography>No pending join requests.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Layout>
  );
}