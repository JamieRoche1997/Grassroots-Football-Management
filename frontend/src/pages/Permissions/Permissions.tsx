import { useNavigate } from "react-router-dom";
import { handleAllowNotifications } from "../../services/notifications";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import AppTheme from "../../components/shared-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import ColorModeSelect from "../../components/shared-theme/ColorModeSelect";
import { useAuth } from "../../hooks/useAuth";
import { getProfile } from "../../services/profile";
import { addPlayerFCMToken } from "../../services/notifications";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const PermissionsContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function PermissionsPage(props: {
  disableCustomTheme?: boolean;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async () => {
    try {
      if (user?.email) {
        await handleAllowNotifications(user.email);
        const membershipInfo = await getProfile(user?.email);

        if (
          membershipInfo.clubName &&
          membershipInfo.ageGroup &&
          membershipInfo.division
        ) {
          await addPlayerFCMToken(
            user.email,
            membershipInfo.clubName,
            membershipInfo.ageGroup,
            membershipInfo.division
          );
        } else {
          console.error("User email is not available");
        }
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Error", error);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />
      <PermissionsContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          <Typography component="h1" variant="h4" sx={{ textAlign: "center" }}>
            Enable Push Notifications
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography>
              Get notified when training is scheduled, matches are updated, or
              changes happen in your team.
            </Typography>
            <Button variant="contained" onClick={handleSubmit} fullWidth>
              Enable Notifications
            </Button>
            <Button
              variant="text"
              onClick={() => navigate("/dashboard")}
              fullWidth
            >
              Skip for Now
            </Button>
          </Box>
        </Card>
      </PermissionsContainer>
    </AppTheme>
  );
}
