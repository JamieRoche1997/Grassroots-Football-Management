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
  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      setClubs([]);
      const results = await fetchClubs({
        clubName,
        county,
        ageGroup,
        division,
      });
      setClubs(results);
    } catch (error) {
      console.error("Error during club search:", error);
    }
  };

  const handleReset = () => {
    setClubName("");
    setCounty("");
    setAgeGroup("");
    setDivision("");
    setClubs([]);
  };

  const handleApply = async (
    club: string,
    ageGroup: string,
    division: string
  ) => {
    try {
      const user = auth.currentUser;
      if (user && user.email) {
        const userDetails = await getProfile(user.email);
        if (userDetails.name) {
          await applyToJoinClub(
            userDetails.name,
            user.email,
            club,
            ageGroup,
            division
          );
        } else {
          console.error("User displayName or email is null");
          return;
        }
      } else {
        console.error("No authenticated user found or email is null");
        return;
      }
      alert(
        `Join request sent to ${club} for Age Group: ${ageGroup} and Division: ${division}`
      );
      navigate("/permissions");
    } catch (error) {
      console.error("Error applying to join club:", error);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />
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
              />
            </FormControl>

            <FormControl>
              <FormLabel>County</FormLabel>
              <Select
                value={county}
                onChange={(e: SelectChangeEvent) => setCounty(e.target.value)}
                displayEmpty
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
              <Button onClick={handleSearch} fullWidth variant="contained">
                Search
              </Button>
              <Button onClick={handleReset} fullWidth variant="outlined">
                Reset
              </Button>
            </Box>

            {/* Club List */}
            {clubs.length > 0 ? (
              clubs.map((club) =>
                club.teams.map((team, index) => (
                  <Box
                    key={`${club.clubName}-${team.ageGroup}-${team.division}-${index}`}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                    }}
                  >
                    <Typography variant="h6">{club.clubName}</Typography>
                    <Typography>County: {club.county}</Typography>
                    <Typography>Age Group: {team.ageGroup}</Typography>
                    <Typography>Division: {team.division}</Typography>
                    <Button
                      onClick={() =>
                        handleApply(club.clubName, team.ageGroup, team.division)
                      }
                      variant="outlined"
                      sx={{ mt: 1 }}
                    >
                      Request to Join
                    </Button>
                  </Box>
                ))
              )
            ) : (
              <Typography>
                No clubs found. Try adjusting your search.
              </Typography>
            )}
          </ScrollableBox>
        </Card>
      </SearchContainer>
    </AppTheme>
  );
}
