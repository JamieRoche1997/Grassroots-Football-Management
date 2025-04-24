import { useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail, deleteUser } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { logoutUser } from "../../services/authentication";
import Stack from "@mui/material/Stack";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

export default function Account() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setError("Failed to log out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) {
      setError("No email address found for current user.");
      return;
    }
    
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setMessage("Password reset email sent successfully!");
      setError(null);
    } catch (error: unknown) {
      const firebaseError = error as FirebaseError;
      setError(firebaseError.code ? `${firebaseError.code}: ${firebaseError.message}` : "Failed to send password reset email");
      setMessage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) {
      setError("No user currently signed in.");
      return;
    }
    
    setLoading(true);
    try {
      await deleteUser(auth.currentUser);
      setMessage("Your account has been successfully deleted.");
      setError(null);
      setDeleteDialogOpen(false);
      setTimeout(() => {
        navigate("/"); // Redirect to homepage after deletion
      }, 2000);
    } catch (error: unknown) {
      console.error("Error deleting account:", error);
      const firebaseError = error as FirebaseError;
      if (firebaseError.code === "auth/requires-recent-login") {
        setError("For security reasons, please log in again before deleting your account.");
      } else {
        setError(firebaseError.message || "Failed to delete account. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  // Clear messages after 5 seconds
  const clearMessages = () => {
    if (message || error) {
      setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 5000);
    }
  };
  
  // Call clearMessages whenever message or error changes
  useState(() => {
    clearMessages();
  });

  return (
    <Layout>
      <Stack
        spacing={2}
        sx={{
          alignItems: "center",
          pb: 5,
          mt: { xs: 8, md: 0 },
        }}
      >
        <Header />
        <Box sx={{ width: "100%", maxWidth: 600 }}>
          <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
            Account Settings
          </Typography>

          {/* Email & Password */}
          <Typography variant="body2">Email: {user?.email || "No email found"}</Typography>

          <Button 
            onClick={handleResetPassword} 
            variant="contained" 
            fullWidth
            disabled={loading || !user?.email}
            sx={{ mt: 1 }}
          >
            {loading ? <CircularProgress size={24} /> : "Change Password"}
          </Button>
          
          {message && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Log Out of All Devices */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Session Management</Typography>
          <Button
            onClick={handleLogout}
            variant="outlined"
            color="error"
            fullWidth
            disabled={loading}
            sx={{ my: 1 }}
          >
            {loading ? <CircularProgress size={24} /> : "Log Out from All Devices"}
          </Button>

          {/* Delete Account */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" color="error">
            Danger Zone
          </Typography>
          <Typography variant="body2" sx={{ color: "gray", mb: 1 }}>
            Deleting your account will permanently remove all data.
          </Typography>
          <Button
            onClick={openDeleteDialog}
            variant="contained"
            color="error"
            fullWidth
            disabled={loading}
          >
            Delete My Account
          </Button>

          {/* Delete Account Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={closeDeleteDialog}
            aria-labelledby="delete-dialog-title"
          >
            <DialogTitle id="delete-dialog-title">
              Confirm Account Deletion
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDeleteDialog} color="primary">
                Cancel
              </Button>
              <Button onClick={handleDeleteAccount} color="error" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Delete Account"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Stack>
    </Layout>
  );
}
