import { useEffect, useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getClubName } from '../../services/user_management';
import { getJoinRequests, approveJoinRequest, rejectJoinRequest } from '../../services/team_management';
import { auth } from '../../services/firebaseConfig';
import Layout from '../../components/Layout';
import Header from '../../components/Header';

interface JoinRequest {
  id: string;
  playerEmail: string;
  clubName: string;
  status: string;
  requestedAt: string;
}

export default function TeamRequests() {
  const [clubName, setClubName] = useState<string | null>(null);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);

  useEffect(() => {
    const fetchClubNameAndRequests = async () => {
      try {
        const user = auth.currentUser;
        if (!user || !user.email) {
          console.error('No authenticated user found');
          return;
        }

        const club = await getClubName(user.email);
        setClubName(club);

        // Step 2: Fetch join requests if the clubName is available
        if (club) {
          await fetchJoinRequests(club);
        }
      } catch (error) {
        console.error('Error fetching club name or join requests:', error);
      }
    };

    fetchClubNameAndRequests();
  }, []);

  const fetchJoinRequests = async (club: string) => {
    try {
      const requests = await getJoinRequests(club);
      setJoinRequests(
        requests.map((request, index) => ({
          ...request,
          id: index.toString(), // Ensure each row has a unique ID for DataGrid
        }))
      );
    } catch (error) {
      console.error('Error fetching join requests:', error);
    }
  };

  const handleApprove = async (playerEmail: string) => {
    try {
      await approveJoinRequest(playerEmail, clubName!);
      alert(`Player ${playerEmail} approved.`);
      fetchJoinRequests(clubName!); // Refresh requests
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (playerEmail: string) => {
    try {
      await rejectJoinRequest(playerEmail, clubName!);
      alert(`Player ${playerEmail} rejected.`);
      fetchJoinRequests(clubName!); // Refresh requests
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
      minWidth: 200
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

  if (!clubName) {
    return <Typography>Loading club information...</Typography>;
  }

  return (
    <Layout>
      <Header />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Player Requests for {clubName}</Typography>

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
