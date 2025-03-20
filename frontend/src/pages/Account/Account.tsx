import { useNavigate } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail, deleteUser } from "firebase/auth";
import { logoutUser } from '../../services/authentication';
import Stack from '@mui/material/Stack';
import Header from '../../components/Header';
import Layout from '../../components/Layout';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

export default function Account() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleResetPassword = async () => {
    if (user?.email) {
      sendPasswordResetEmail(auth, user.email)
        .then(() => {
          setMessage("Password reset email sent successfully!");
          setError(null);
        })
        .catch((error) => {
          setError(error.code + ": " + error.message);
          setMessage(null);
        });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (!auth.currentUser) {
        setError("No user currently signed in.");
        return;
      }

      await deleteUser(auth.currentUser);
      setMessage("Your account has been successfully deleted.");
      setTimeout(() => {
        navigate('/'); // Redirect to homepage after deletion
      }, 2000);
    } catch (error) {
      console.error("Error deleting account:", error);
      setError("Failed to delete account. Please re-authenticate and try again.");
    }
  };

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

          <Button onClick={handleResetPassword} variant="contained" fullWidth>
            Change Password
          </Button>
          {message && <Typography color="success.main" sx={{ mt: 2 }}>{message}</Typography>}
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

          {/* Log Out of All Devices */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Session Management</Typography>
          <Button onClick={handleLogout} variant="outlined" color="error" fullWidth sx={{ my: 1 }}>
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
          <Button onClick={handleDeleteAccount} variant="contained" color="error" fullWidth>
            Delete My Account
          </Button>
        </Box>
      </Stack>
    </Layout>
  );
}
