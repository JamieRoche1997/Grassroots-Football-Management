import { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// Mock save function - replace with actual implementation
const saveSettings = async (settingsData: {
  notifications: {
    matchReminders: boolean;
    carpoolUpdates: boolean;
    directMessages: boolean;
    emailUpdates: boolean;
  };
  privacy: {
    hideOnlineStatus: boolean;
    restrictProfileView: boolean;
    disableLocation: boolean;
  };
}): Promise<void> => {
  // Simulate API call - in a real implementation, you would use settingsData here
  console.log("Saving settings:", settingsData);
  return new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
};

export default function Settings() {
  const [tabIndex, setTabIndex] = useState(0);
  const [notifications, setNotifications] = useState({
    matchReminders: true,
    carpoolUpdates: false,
    directMessages: true,
    emailUpdates: false,
  });
  const [privacy, setPrivacy] = useState({
    hideOnlineStatus: false,
    restrictProfileView: true,
    disableLocation: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<string | null>(null);
  
  // Track initial state to detect changes
  const [initialNotifications, setInitialNotifications] = useState({...notifications});
  const [initialPrivacy, setInitialPrivacy] = useState({...privacy});
  
  useEffect(() => {
    // Compare current state with initial state
    const notificationsChanged = JSON.stringify(notifications) !== JSON.stringify(initialNotifications);
    const privacyChanged = JSON.stringify(privacy) !== JSON.stringify(initialPrivacy);
    setHasChanges(notificationsChanged || privacyChanged);
  }, [notifications, privacy, initialNotifications, initialPrivacy]);
  
  const handleTabChange = (_event: React.SyntheticEvent, newIndex: number) => {
    if (hasChanges) {
      setActionToConfirm("changeTab");
      setConfirmDialogOpen(true);
    } else {
      setTabIndex(newIndex);
    }
  };

  const handleNotificationChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNotifications({
      ...notifications,
      [event.target.name]: event.target.checked,
    });
  };

  const handlePrivacyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrivacy({
      ...privacy,
      [event.target.name]: event.target.checked,
    });
  };
  
  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await saveSettings({
        notifications,
        privacy,
      });
      
      // Update initial state after successful save
      setInitialNotifications({...notifications});
      setInitialPrivacy({...privacy});
      setHasChanges(false);
      setSuccess("Settings saved successfully!");
      
      // Auto-dismiss success message
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setError("Failed to save settings. Please try again.");
      console.error("Settings save error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetSettings = () => {
    setActionToConfirm("resetSettings");
    setConfirmDialogOpen(true);
  };
  
  const performResetSettings = () => {
    setNotifications({
      matchReminders: true,
      carpoolUpdates: false,
      directMessages: true,
      emailUpdates: false,
    });
    setPrivacy({
      hideOnlineStatus: false,
      restrictProfileView: true,
      disableLocation: false,
    });
    setSuccess("Settings have been reset to defaults");
    setConfirmDialogOpen(false);
  };
  
  const handleConfirmAction = () => {
    if (actionToConfirm === "resetSettings") {
      performResetSettings();
    } else if (actionToConfirm === "changeTab") {
      setTabIndex(tabIndex === 0 ? 1 : tabIndex === 1 ? 2 : 0);
      setConfirmDialogOpen(false);
    } else if (actionToConfirm === "clearChat") {
      setSuccess("Chat history has been cleared");
      setConfirmDialogOpen(false);
    }
  };
  
  const handleClearChatHistory = () => {
    setActionToConfirm("clearChat");
    setConfirmDialogOpen(true);
  };
  
  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setActionToConfirm(null);
  };

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
          {/* Tabs for different settings sections */}
          <Tabs value={tabIndex} onChange={handleTabChange} centered>
            <Tab label="Notifications" />
            <Tab label="Privacy & Security" />
            <Tab label="Data & Account" />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ p: 3 }}>
            {tabIndex === 0 && (
              <Box>
                <Typography variant="h6">Notification Settings</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.matchReminders}
                        onChange={handleNotificationChange}
                        name="matchReminders"
                      />
                    }
                    label="Match & Training Reminders"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.carpoolUpdates}
                        onChange={handleNotificationChange}
                        name="carpoolUpdates"
                      />
                    }
                    label="Carpool Request Updates"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.directMessages}
                        onChange={handleNotificationChange}
                        name="directMessages"
                      />
                    }
                    label="Allow Direct Messages"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.emailUpdates}
                        onChange={handleNotificationChange}
                        name="emailUpdates"
                      />
                    }
                    label="Receive Email Notifications"
                  />
                </FormGroup>
                
                {hasChanges && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                      variant="outlined" 
                      onClick={handleResetSettings}
                      disabled={loading}
                    >
                      Discard Changes
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={handleSaveSettings}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : "Save Changes"}
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {tabIndex === 1 && (
              <Box>
                <Typography variant="h6">Privacy & Security</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={privacy.hideOnlineStatus}
                        onChange={handlePrivacyChange}
                        name="hideOnlineStatus"
                      />
                    }
                    label="Hide Online Status"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={privacy.restrictProfileView}
                        onChange={handlePrivacyChange}
                        name="restrictProfileView"
                      />
                    }
                    label="Restrict Profile Viewing"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={privacy.disableLocation}
                        onChange={handlePrivacyChange}
                        name="disableLocation"
                      />
                    }
                    label="Disable Location-Based Features"
                  />
                </FormGroup>
                <Divider sx={{ my: 2 }} />
                <Button variant="outlined" color="error">
                  View Login History
                </Button>
                
                {hasChanges && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                      variant="outlined" 
                      onClick={handleResetSettings}
                      disabled={loading}
                    >
                      Discard Changes
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={handleSaveSettings}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : "Save Changes"}
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {tabIndex === 2 && (
              <Box>
                <Typography variant="h6">Data & Account</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Manage your data and account settings.
                </Typography>
                <Button variant="contained" fullWidth sx={{ mb: 1 }}>
                  Download My Data
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  sx={{ mb: 1 }}
                  onClick={handleClearChatHistory}
                >
                  Clear Chat History
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  sx={{ mb: 1 }}
                  onClick={handleResetSettings}
                >
                  Reset All Settings
                </Button>
                <Button 
                  variant="outlined" 
                  color="error" 
                  fullWidth
                >
                  Log Out from All Devices
                </Button>
              </Box>
            )}
          </Box>
        </Box>
        
        {/* Success notification */}
        <Snackbar 
          open={!!success} 
          autoHideDuration={3000} 
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccess(null)} severity="success">
            {success}
          </Alert>
        </Snackbar>
        
        {/* Error notification */}
        <Snackbar 
          open={!!error} 
          autoHideDuration={5000} 
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
        
        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialogOpen}
          onClose={handleCloseConfirmDialog}
        >
          <DialogTitle>
            {actionToConfirm === "resetSettings" 
              ? "Reset Settings" 
              : actionToConfirm === "clearChat" 
                ? "Clear Chat History" 
                : "Unsaved Changes"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {actionToConfirm === "resetSettings" 
                ? "This will reset all settings to their default values. Continue?" 
                : actionToConfirm === "clearChat" 
                  ? "This will permanently delete your chat history. This action cannot be undone." 
                  : "You have unsaved changes. Do you want to proceed without saving?"}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
            <Button onClick={handleConfirmAction} color="error">
              {actionToConfirm === "resetSettings" 
                ? "Reset" 
                : actionToConfirm === "clearChat" 
                  ? "Clear" 
                  : "Proceed"}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Layout>
  );
}
