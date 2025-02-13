import { useEffect, useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getJoinRequests, approveJoinRequest, rejectJoinRequest } from '../../services/team_management';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

interface JoinRequest {
  id: string;
  playerEmail: string;
  clubName: string;
  ageGroup: string;
  division: string;
  status: string;
  requestedAt: string;
}

export default function TeamRequests() {
  const { clubName, ageGroup, division, loading: authLoading } = useAuth(); 
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch join requests when auth context is ready
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
          requests.map((request, index) => ({
            ...request,
            id: index.toString(), 
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

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Player Name', flex: 1, minWidth: 200 },
    { field: 'playerEmail', headerName: 'Player Email', flex: 1, minWidth: 200 },
    {
      field: 'requestedAt',
      headerName: 'Requested At',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => handleApprove(params.row.playerEmail)}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={() => handleReject(params.row.playerEmail)}
          >
            Reject
          </Button>
        </Box>
      ),
    },
  ];

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

        <Box sx={{ height: 400, width: '100%', mt: 3 }}>
          {joinRequests.length > 0 ? (
            <DataGrid
              rows={joinRequests}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10, 20]}
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-root': {
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 1,
                },
                '& .MuiDataGrid-cell': {
                  fontSize: '0.875rem',
                },
              }}
            />
          ) : (
            <Typography>No pending join requests.</Typography>
          )}
        </Box>
      </Box>
    </Layout>
  );
}
