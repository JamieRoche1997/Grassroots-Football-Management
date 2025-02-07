import { useEffect, useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getClubInfo } from '../../services/user_management';
import { getJoinRequests, approveJoinRequest, rejectJoinRequest } from '../../services/team_management';
import { auth } from '../../services/firebaseConfig';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';

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
  const [clubName, setClubName] = useState<string | null>(null);
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [division, setDivision] = useState<string | null>(null);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);

  useEffect(() => {
    const fetchClubInfoAndRequests = async () => {
      try {
        const user = auth.currentUser;
        if (!user || !user.email) {
          console.error('No authenticated user found');
          return;
        }

        // Destructure the response correctly
        const { clubName, ageGroup, division } = await getClubInfo(user.email);

        if (!clubName || !ageGroup || !division) {
          console.error('Club information is incomplete');
          return;
        }

        setClubName(clubName);
        setAgeGroup(ageGroup);
        setDivision(division);

        // Fetch join requests for the club, age group, and division
        await fetchJoinRequests(clubName, ageGroup, division);
      } catch (error) {
        console.error('Error fetching club information or join requests:', error);
      }
    };

    fetchClubInfoAndRequests();
  }, []);


  const fetchJoinRequests = async (club: string, ageGroup: string, division: string) => {
    try {
      const requests = await getJoinRequests(club, ageGroup, division);
      setJoinRequests(
        requests.map((request, index) => ({
          ...request,
          id: index.toString(), // Ensure each row has a unique ID for DataGrid
          ageGroup,
          division,
        }))
      );
    } catch (error) {
      console.error('Error fetching join requests:', error);
    }
  };

  const handleApprove = async (playerEmail: string) => {
    if (!clubName || !ageGroup || !division) return;

    try {
      await approveJoinRequest(playerEmail, clubName, ageGroup, division);
      alert(`Player ${playerEmail} approved.`);
      fetchJoinRequests(clubName, ageGroup, division); // Refresh requests
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (playerEmail: string) => {
    if (!clubName || !ageGroup || !division) return;

    try {
      await rejectJoinRequest(playerEmail, clubName, ageGroup, division);
      alert(`Player ${playerEmail} rejected.`);
      fetchJoinRequests(clubName, ageGroup, division); // Refresh requests
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

  if (!clubName || !ageGroup || !division) {
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
