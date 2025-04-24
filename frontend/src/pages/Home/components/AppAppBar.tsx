import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ColorModeIconDropdown from "../../../components/shared-theme/ColorModeIconDropdown";
import Sitemark from "./SitemarkIcon";
import { useNavigate } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)", 
  backgroundColor:
    theme.palette.mode === "light"
      ? "rgba(255, 255, 255, 0.3)"
      : "rgba(18, 18, 18, 0.3)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  padding: "8px 12px",
}));

export default function AppAppBar() {
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      // Ensure menu is closed when component is unmounted
      if (open) setOpen(false);
      if (anchorEl) setAnchorEl(null);
    };
  }, [open, anchorEl]);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleScroll = (id: string) => {
    try {
      const element = document.getElementById(id);
      const offset = 64; // Height of the app bar in pixels
      if (element) {
        const elementPosition =
          element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      } else {
        console.warn(`Element with ID "${id}" not found in the document.`);
      }
    } catch (error) {
      console.error(`Error scrolling to element "${id}":`, error);
    }
  };

  // Handle dropdown menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignUp = (role: string) => {
    try {
      navigate(`/signup?role=${role}`);
      handleMenuClose();
    } catch (error) {
      console.error("Error navigating to signup:", error);
      // Fallback if navigation fails
      window.location.href = `/signup?role=${role}`;
    }
  };

  const handleSignIn = () => {
    try {
      navigate("/signin");
    } catch (error) {
      console.error("Error navigating to signin:", error);
      // Fallback if navigation fails
      window.location.href = "/signin";
    }
  };

  const navItems = [
    { id: "features", label: "Features" },
    { id: "pricing", label: "Pricing" },
    { id: "reviews", label: "Reviews" },
    { id: "faq", label: "FAQ" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: "transparent",
        backgroundImage: "none",
        mt: "calc(var(--template-frame-height, 0px) + 28px)",
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          <Box
            sx={{ flexGrow: 2, display: "flex", alignItems: "center", px: 0 }}
          >
            <Sitemark />
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2, ml: 2 }}>
              {navItems.map((item) => (
                <Tooltip key={item.id} title={`Go to ${item.label}`} arrow>
                  <Button
                    variant="text"
                    color="info"
                    size="medium"
                    onClick={() => handleScroll(item.id)}
                    aria-label={`Go to ${item.label} section`}
                  >
                    {item.label}
                  </Button>
                </Tooltip>
              ))}
            </Box>
          </Box>

          {/* Sign In & Sign Up with Dropdown */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 1,
              alignItems: "center",
            }}
          >
            <Button
              color="primary"
              variant="text"
              size="medium"
              onClick={handleSignIn}
              aria-label="Sign in"
            >
              Sign in
            </Button>

            {/* Sign Up Button (Triggers Dropdown) */}
            <Button
              color="primary"
              variant="contained"
              size="medium"
              onClick={handleMenuOpen}
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl)}
              aria-label="Sign up options"
            >
              Sign Up
            </Button>

            {/* Dropdown Menu for Sign Up */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              MenuListProps={{
                "aria-labelledby": "sign-up-button",
                role: "menu",
              }}
            >
              {["coach", "player", "parent"].map((role) => (
                <MenuItem
                  key={role}
                  onClick={() => handleSignUp(role)}
                  role="menuitem"
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </MenuItem>
              ))}
            </Menu>

            <ColorModeIconDropdown />
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
            <ColorModeIconDropdown size="medium" />
            <IconButton 
              aria-label="Open menu" 
              onClick={toggleDrawer(true)}
              aria-expanded={open}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  top: "var(--template-frame-height, 0px)",
                },
              }}
              aria-label="Mobile navigation menu"
            >
              <Box sx={{ p: 2, backgroundColor: "background.default" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <IconButton 
                    onClick={toggleDrawer(false)}
                    aria-label="Close menu"
                  >
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>
                {navItems.map((item) => (
                  <MenuItem 
                    key={item.id}
                    onClick={() => {
                      handleScroll(item.id);
                      toggleDrawer(false)();
                    }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
                <Divider sx={{ my: 3 }} />
                <MenuItem>
                  <Button
                    color="primary"
                    variant="contained"
                    fullWidth
                    onClick={handleMenuOpen}
                    aria-haspopup="true"
                    aria-expanded={Boolean(anchorEl)}
                  >
                    Sign up
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    MenuListProps={{
                      "aria-labelledby": "mobile-sign-up-button",
                      role: "menu",
                    }}
                  >
                    {["coach", "player", "parent"].map((role) => (
                      <MenuItem
                        key={role}
                        onClick={() => {
                          handleSignUp(role);
                          toggleDrawer(false)();
                        }}
                        role="menuitem"
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </MenuItem>
                    ))}
                  </Menu>
                </MenuItem>
                <MenuItem>
                  <Button
                    color="primary"
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      handleSignIn();
                      toggleDrawer(false)();
                    }}
                    aria-label="Sign in"
                  >
                    Sign in
                  </Button>
                </MenuItem>
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}
