import * as React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import AppTheme from "../../components/shared-theme/AppTheme";
import ColorModeSelect from "../../components/shared-theme/ColorModeSelect";
import { fetchClubs, applyToJoinClub } from "../../services/team_management";
import { auth } from "../../services/firebaseConfig";
import { getProfile } from "../../services/profile";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

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

const SearchContainer = styled(Stack)(({ theme }) => ({
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

const ScrollableBox = styled(Box)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  overflowY: "auto",
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

const counties = [
  "Antrim",
  "Armagh",
  "Carlow",
  "Cavan",
  "Clare",
  "Cork",
  "Derry",
  "Donegal",
  "Down",
  "Dublin",
  "Fermanagh",
  "Galway",
  "Kerry",
  "Kildare",
  "Kilkenny",
  "Laois",
  "Leitrim",
  "Limerick",
  "Longford",
  "Louth",
  "Mayo",
  "Meath",
  "Monaghan",
  "Offaly",
  "Roscommon",
  "Sligo",
  "Tipperary",
  "Tyrone",
  "Waterford",
  "Westmeath",
  "Wexford",
  "Wicklow",
];

const ageGroups = [
  "Under 12",
  "Under 13",
  "Under 14",
  "Under 15",
  "Under 16",
  "Under 17",
  "Under 18",
  "Under 19",
  "Junior",
  "Senior",
  "Professional",
];

const divisions = Array.from(
  { length: 16 },
  (_, i) => `Division ${i === 0 ? "Premier" : i}`
);

interface Club {
  clubName: string;
  county: string;
  teams: { ageGroup: string; division: string }[];
}

export default function ClubSearch(props: { disableCustomTheme?: boolean }) {
  const [clubName, setClubName] = React.useState("");
  const [county, setCounty] = React.useState("");
  const [ageGroup, setAgeGroup] = React.useState("");
  const [division, setDivision] = React.useState("");
  const [clubs, setClubs] = React.useState<Club[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedClub, setSelectedClub] = React.useState<{clubName: string, ageGroup: string, division: string} | null>(null);
  const [searchPerformed, setSearchPerformed] = React.useState(false);
  const navigate = useNavigate();

  // Error snackbar handling
  const handleErrorClose = () => {
    setError(null);
  };

  // Success snackbar handling
  const handleSuccessClose = () => {
    setSuccess(null);
  };

  // Confirm dialog handling
  const handleConfirmOpen = (clubName: string, ageGroup: string, division: string) => {
    setSelectedClub({ clubName, ageGroup, division });
    setOpenDialog(true);
  };

  const handleConfirmClose = () => {
    setOpenDialog(false);
  };

  const handleSearch = async () => {
    // Basic validation
    if (!clubName && !county && !ageGroup && !division) {
      setError("Please enter at least one search criteria");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setClubs([]);
      setSearchPerformed(true);
      
      const results = await fetchClubs({
        clubName,
        county,
        ageGroup,
        division,
      });
      
      setClubs(results);
      if (results.length === 0) {
        // Not setting this as an error, just info for the user
        setError("No clubs found matching your criteria");
      }
    } catch (error) {
      console.error("Error during club search:", error);
      setError("Failed to search clubs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setClubName("");
    setCounty("");
    setAgeGroup("");
    setDivision("");
    setClubs([]);
    setError(null);
    setSearchPerformed(false);
  };

  const handleApply = async () => {
    if (!selectedClub) return;
    
    try {
      setLoading(true);
      setError(null);
      const user = auth.currentUser;
      
      if (!user || !user.email) {
        setError("You must be logged in to join a club");
        setLoading(false);
        return;
      }
      
      const userDetails = await getProfile(user.email);
      
      if (!userDetails || !userDetails.name) {
        setError("User profile information is incomplete. Please update your profile first.");
        setLoading(false);
        return;
      }
      
      await applyToJoinClub(
        userDetails.name,
        user.email,
        selectedClub.clubName,
        selectedClub.ageGroup,
        selectedClub.division
      );
      
      setSuccess(`Join request sent to ${selectedClub.clubName} for Age Group: ${selectedClub.ageGroup} and Division: ${selectedClub.division}`);
      handleConfirmClose();
      
      // Navigate after a short delay to allow the user to see the success message
      setTimeout(() => {
        navigate("/permissions");
      }, 2000);
      
    } catch (error) {
      console.error("Error applying to join club:", error);
      setError("Failed to apply to club. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />
      
      {/* Error Snackbar */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleErrorClose}>
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      {/* Success Snackbar */}
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleSuccessClose}>
        <Alert onClose={handleSuccessClose} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleConfirmClose}
      >
        <DialogTitle>Confirm Join Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to request to join {selectedClub?.clubName} for Age Group: {selectedClub?.ageGroup} and Division: {selectedClub?.division}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleApply} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      
      <SearchContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ textAlign: "center", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            Find a Club
          </Typography>

          {/* Search Form */}
          <ScrollableBox
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl>
              <FormLabel>Club Name</FormLabel>
              <TextField
                id="clubName"
                placeholder="Enter Club Name"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                disabled={loading}
              />
            </FormControl>

            <FormControl>
              <FormLabel>County</FormLabel>
              <Select
                value={county}
                onChange={(e: SelectChangeEvent) => setCounty(e.target.value)}
                displayEmpty
                disabled={loading}
              >
                <MenuItem value="" disabled>
                  Select County
                </MenuItem>
                {counties.map((county) => (
                  <MenuItem key={county} value={county}>
                    {county}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Age Group</FormLabel>
              <Select
                value={ageGroup}
                onChange={(e: SelectChangeEvent) => setAgeGroup(e.target.value)}
                displayEmpty
                disabled={loading}
              >
                <MenuItem value="" disabled>
                  Select Age Group
                </MenuItem>
                {ageGroups.map((group) => (
                  <MenuItem key={group} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Division</FormLabel>
              <Select
                value={division}
                onChange={(e: SelectChangeEvent) => setDivision(e.target.value)}
                displayEmpty
                disabled={loading}
              >
                <MenuItem value="" disabled>
                  Select Division
                </MenuItem>
                {divisions.map((div) => (
                  <MenuItem key={div} value={div}>
                    {div}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button 
                onClick={handleSearch} 
                fullWidth 
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Search"}
              </Button>
              <Button 
                onClick={handleReset} 
                fullWidth 
                variant="outlined"
                disabled={loading}
              >
                Reset
              </Button>
            </Box>

            {/* Club List */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            ) : searchPerformed ? (
              clubs.length > 0 ? (
                clubs.map((club) =>
                  club.teams.map((team, index) => (
                    <Box
                      key={`${club.clubName}-${team.ageGroup}-${team.division}-${index}`}
                      sx={{
                        mb: 2,
                        p: 2,
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <Typography variant="h6">{club.clubName}</Typography>
                      <Typography>County: {club.county}</Typography>
                      <Typography>Age Group: {team.ageGroup}</Typography>
                      <Typography>Division: {team.division}</Typography>
                      <Button
                        onClick={() => handleConfirmOpen(club.clubName, team.ageGroup, team.division)}
                        variant="outlined"
                        sx={{ mt: 1 }}
                        color="primary"
                        disabled={loading}
                      >
                        Request to Join
                      </Button>
                    </Box>
                  ))
                )
              ) : (
                <Box sx={{ textAlign: 'center', my: 3, p: 2, border: '1px dashed #ccc', borderRadius: '8px' }}>
                  <Typography>
                    No clubs found. Try adjusting your search criteria.
                  </Typography>
                </Box>
              )
            ) : (
              <Box sx={{ textAlign: 'center', my: 3, color: 'text.secondary' }}>
                <Typography>
                  Enter search criteria and click "Search" to find clubs.
                </Typography>
              </Box>
            )}
          </ScrollableBox>
        </Card>
      </SearchContainer>
    </AppTheme>
  );
}
