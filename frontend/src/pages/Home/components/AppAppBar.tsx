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

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleScroll = (id: string) => {
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
    navigate(`/signup?role=${role}`);
    handleMenuClose();
  };

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
              <Button
                variant="text"
                color="info"
                size="medium"
                onClick={() => handleScroll("features")}
              >
                Features
              </Button>
              <Button
                variant="text"
                color="info"
                size="medium"
                onClick={() => handleScroll("pricing")}
              >
                Pricing
              </Button>
              <Button
                variant="text"
                color="info"
                size="medium"
                onClick={() => handleScroll("reviews")}
              >
                Reviews
              </Button>
              <Button
                variant="text"
                color="info"
                size="medium"
                onClick={() => handleScroll("faq")}
              >
                FAQ
              </Button>
              <Button
                variant="text"
                color="info"
                size="medium"
                onClick={() => handleScroll("contact")}
                sx={{ minWidth: 0 }}
              >
                Contact
              </Button>
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
              onClick={() => navigate("/signin")}
            >
              Sign in
            </Button>

            {/* Sign Up Button (Triggers Dropdown) */}
            <Button
              color="primary"
              variant="contained"
              size="medium"
              onClick={handleMenuOpen}
            >
              Sign Up
            </Button>

            {/* Dropdown Menu for Sign Up */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem
                onClick={() => {
                  handleSignUp("coach");
                  handleMenuClose();
                }}
              >
                Coach
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleSignUp("player");
                  handleMenuClose();
                }}
              >
                Player
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleSignUp("parent");
                  handleMenuClose();
                }}
              >
                Parent
              </MenuItem>
            </Menu>

            <ColorModeIconDropdown />
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
            <ColorModeIconDropdown size="medium" />
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
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
            >
              <Box sx={{ p: 2, backgroundColor: "background.default" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>
                <MenuItem>Features</MenuItem>
                <MenuItem>Pricing</MenuItem>
                <MenuItem>Reviews</MenuItem>
                <MenuItem>FAQ</MenuItem>
                <MenuItem>Contact</MenuItem>
                <Divider sx={{ my: 3 }} />
                <MenuItem>
                  <Button
                    color="primary"
                    variant="contained"
                    fullWidth
                    onClick={handleMenuOpen}
                  >
                    Sign up
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem
                      onClick={() => {
                        handleSignUp("coach");
                        handleMenuClose();
                      }}
                    >
                      Coach
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleSignUp("player");
                        handleMenuClose();
                      }}
                    >
                      Player
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleSignUp("parent");
                        handleMenuClose();
                      }}
                    >
                      Parent
                    </MenuItem>
                  </Menu>
                </MenuItem>
                <MenuItem>
                  <Button
                    color="primary"
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate("/signin")}
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
