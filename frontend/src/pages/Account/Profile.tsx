import Stack from '@mui/material/Stack';
import Header from '../../components/Header';
import Layout from '../../components/Layout';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import { useAuth } from '../../hooks/useAuth';

export default function Profile() {
    const { user, clubName, ageGroup, division } = useAuth();

  return (
    <Layout>
      <Stack
        spacing={2}
        sx={{
          alignItems: 'center',
          pb: 5,
          mt: { xs: 8, md: 0 },
        }}
      >
        <Header />
        <Box sx={{ width: '100%', maxWidth: 600, textAlign: 'center' }}>
          {/* Profile Avatar and Name */}
          <Avatar sx={{ width: 100, height: 100, margin: 'auto' }} />
          <Typography variant="h5" sx={{ mt: 1 }}>{user?.displayName}</Typography>
          <Typography variant="body1" color="text.secondary">Enter Bio Here</Typography>

          {/* Team Affiliation */}
          <Typography variant="h6" sx={{ mt: 2 }}>Team: {clubName}</Typography>
            <Typography variant="body2">Age Group: {ageGroup}</Typography>
            <Typography variant="body2">Division: {division}</Typography>

          {/* Player Stats */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Performance Stats</Typography>
          <Typography variant="body2">Matches Played: </Typography>
          <Typography variant="body2">Goals: </Typography>
          <Typography variant="body2">Assists: </Typography>

          {/* Recent Activity */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Recent Activity</Typography>
          <List>
            {/* Enter Recent Activity Here */}
          </List>
        </Box>
      </Stack>
    </Layout>
  );
}
