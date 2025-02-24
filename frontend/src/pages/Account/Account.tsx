import Stack from '@mui/material/Stack';
import Header from '../../components/Header';
import Layout from '../../components/Layout';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useAuth } from '../../hooks/useAuth';

export default function Account() {
    const { user } = useAuth();

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
        <Box sx={{ width: '100%', maxWidth: 600 }}>
          <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>Account Settings</Typography>

          {/* Email & Password */}
          <Typography variant="body2">Email: {user?.email}</Typography>
          <Button variant="contained" fullWidth sx={{ my: 1 }}>
            Change Email
          </Button>
          <Button variant="contained" fullWidth>
            Change Password
          </Button>

          {/* Log Out of All Devices */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Session Management</Typography>
          <Button variant="outlined" color="error" fullWidth sx={{ my: 1 }}>
            Log Out from All Devices
          </Button>

          {/* Delete Account */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" color="error">
            Danger Zone
          </Typography>
          <Typography variant="body2" sx={{ color: 'gray', mb: 1 }}>
            Deleting your account will permanently remove all data.
          </Typography>
          <Button variant="contained" color="error" fullWidth>
            Delete My Account
          </Button>
        </Box>
      </Stack>
    </Layout>
  );
}
