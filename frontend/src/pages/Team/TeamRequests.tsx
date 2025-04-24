import { useEffect, useState } from "react";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from "../../services/team_management";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import { createMembership } from "../../services/membership";
import { getProfile, updateProfile } from "../../services/profile";
import { getUser } from "../../services/authentication";
import { addPlayerFCMToken } from "../../services/notifications";

interface JoinRequest {
  id: string;
  playerEmail: string;
  clubName: string;
  ageGroup: string;
  division: string;
  status: string;
  requestedAt: string;
  name: string;
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function TeamRequests() {
  const { clubName, ageGroup, division, loading: authLoading } = useAuth();
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogProps>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
  });

  useEffect(() => {
    const fetchRequests = async () => {
      if (authLoading) return;

      if (!clubName || !ageGroup || !division) {
        setError("Club information is incomplete.");
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
        console.error("Error fetching join requests:", error);
        setError("Failed to load join requests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchRequests();
    }
  }, [clubName, ageGroup, division, authLoading]);

  const handleApprove = async (playerEmail: string) => {
    if (!clubName || !ageGroup || !division) {
      showNotification("Club information is missing", "error");
      return;
    }

    setActionLoading(playerEmail);

    try {
      const profile = await getProfile(playerEmail);
      if (!profile) {
        throw new Error("Player profile not found");
      }

      const user = await getUser(playerEmail);
      if (!user) {
        throw new Error("User information not found");
      }

      // Create membership with appropriate null/empty string handling
      await createMembership({
        email: playerEmail,
        name: profile.name || "",
        dob: profile.dob || "",
        uid: user.uid || "",
        clubName: clubName,
        ageGroup: ageGroup,
        division: division,
        role: "player",
        position: profile.position || "",
        userRegistered: true,
      });

      await updateProfile(playerEmail, { clubName, ageGroup, division });
      await approveJoinRequest(playerEmail, clubName, ageGroup, division);
      await addPlayerFCMToken(playerEmail, clubName, ageGroup, division);
      
      showNotification(`Player ${profile.name || playerEmail} approved successfully`, "success");
      setJoinRequests((prev) =>
        prev.filter((req) => req.playerEmail !== playerEmail)
      );
    } catch (error) {
      console.error("Error approving request:", error);
      showNotification(
        `Failed to approve player: ${(error as Error).message || "Unknown error"}`,
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const confirmReject = (playerEmail: string, playerName: string) => {
    setConfirmDialog({
      open: true,
      title: "Confirm Rejection",
      message: `Are you sure you want to reject ${playerName || playerEmail}?`,
      onConfirm: () => {
        handleReject(playerEmail);
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
      onCancel: () => setConfirmDialog((prev) => ({ ...prev, open: false })),
    });
  };

  const handleReject = async (playerEmail: string) => {
    if (!clubName || !ageGroup || !division) {
      showNotification("Club information is missing", "error");
      return;
    }

    setActionLoading(playerEmail);

    try {
      await rejectJoinRequest(playerEmail, clubName, ageGroup, division);
      
      const playerName = joinRequests.find(
        (req) => req.playerEmail === playerEmail
      )?.name;
      
      showNotification(`Player ${playerName || playerEmail} rejected`, "info");
      setJoinRequests((prev) =>
        prev.filter((req) => req.playerEmail !== playerEmail)
      );
    } catch (error) {
      console.error("Error rejecting request:", error);
      showNotification(
        `Failed to reject player: ${(error as Error).message || "Unknown error"}`,
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const showNotification = (message: string, severity: "success" | "error" | "info") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString || 'Invalid date';
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
          <Typography color="error" variant="h6">
            {error}
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <Box>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Player Requests
        </Typography>

        <Paper sx={{ width: "100%", overflow: "hidden", mt: 3 }}>
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
                    <TableCell>{request.name || "Unknown"}</TableCell>
                    <TableCell>{request.playerEmail}</TableCell>
                    <TableCell>{formatDate(request.requestedAt)}</TableCell>
                    <TableCell>
                      <Box>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => handleApprove(request.playerEmail)}
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === request.playerEmail ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            "Approve"
                          )}
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => confirmReject(request.playerEmail, request.name)}
                          disabled={actionLoading !== null}
                        >
                          {actionLoading === request.playerEmail ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            "Reject"
                          )}
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

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={confirmDialog.onCancel}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title">{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmDialog.onCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDialog.onConfirm} color="secondary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
