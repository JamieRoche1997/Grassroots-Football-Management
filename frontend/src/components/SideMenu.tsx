import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import PersonIcon from "@mui/icons-material/Person";
import MenuContent from "./MenuContent";
import OptionsMenu from "./OptionsMenu";
import ClubInfoDisplay from "./ClubInfoDisplay";
import { useAuth } from "../hooks/useAuth";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

export default function SideMenu() {
  const { user, name, loading } = useAuth();
  
  // Clean up the user's name for display
  const displayName = name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          p: 1.5,
        }}
      >
        <ClubInfoDisplay />
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MenuContent />
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        {loading ? (
          <>
            <Skeleton variant="circular" width={36} height={36} />
            <Box sx={{ mr: "auto", width: "100%" }}>
              <Skeleton width="70%" height={16} />
              <Skeleton width="50%" height={10} />
            </Box>
          </>
        ) : (
          <>
            <Avatar
              sizes="small"
              alt={displayName}
              src="/static/images/avatar/7.jpg"
              sx={{ width: 36, height: 36 }}
              imgProps={{
                onError: (e) => {
                  // Handle image load error
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '';
                }
              }}
            >
              {!user && <PersonIcon fontSize="small" />}
            </Avatar>
            <Box sx={{ mr: "auto" }}>
              <Typography
                variant="body2"
                sx={{ fontSize: 12, fontWeight: 500, lineHeight: "16px" }}
              >
                {displayName}
              </Typography>
              {userEmail && (
                <Typography
                  variant="caption"
                  sx={{ fontSize: 10, color: "text.secondary" }}
                  noWrap
                  title={userEmail}
                >
                  {userEmail}
                </Typography>
              )}
            </Box>
          </>
        )}
        <OptionsMenu />
      </Stack>
    </Drawer>
  );
}
