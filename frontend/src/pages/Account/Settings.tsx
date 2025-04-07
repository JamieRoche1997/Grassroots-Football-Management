import { useState } from "react";
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

  const handleTabChange = (_event: React.SyntheticEvent, newIndex: number) => {
    setTabIndex(newIndex);
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
                >
                  Clear Chat History
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Reset All Settings
                </Button>
                <Button variant="outlined" color="error" fullWidth>
                  Log Out from All Devices
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Stack>
    </Layout>
  );
}
