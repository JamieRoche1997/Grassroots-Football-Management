import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";
import FormHelperText from "@mui/material/FormHelperText";
import AppTheme from "../../components/shared-theme/AppTheme";
import ColorModeSelect from "../../components/shared-theme/ColorModeSelect";
import { updateProfile } from "../../services/profile";
import { createOrJoinClub } from "../../services/team_management";
import { createMembership } from "../../services/membership";
import { useAuth } from "../../hooks/useAuth";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  maxHeight: "calc(100vh - 40px)",
  overflow: "auto",
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

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: "100dvh",
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

export default function Coach(props: { disableCustomTheme?: boolean }) {
  const { uid, name } = useAuth();
  const navigate = useNavigate();
  const [county, setCounty] = React.useState("");
  const [clubName, setClubName] = React.useState("");
  const [ageGroup, setAgeGroup] = React.useState("");
  const [division, setDivision] = React.useState("");
  const location = useLocation();
  const email = location.state?.email;
  
  // New state for validation and error handling
  const [dob, setDob] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");

  // Validation functions
  const validateDob = (value: string) => {
    if (!value) return "Date of birth is required";
    
    const birthDate = new Date(value);
    const today = new Date();
    
    if (birthDate > today) return "Date of birth cannot be in the future";
    
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 100); // Assuming coaches are not older than 100
    if (birthDate < minDate) return "Please enter a valid date of birth";
    
    return "";
  };

  const validatePhone = (value: string) => {
    if (!value) return "Phone number is required";
    
    // Basic phone validation - can be made more specific for Irish numbers
    const phoneRegex = /^(\+\d{1,3}\s?)?\d{6,14}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ""))) {
      return "Please enter a valid phone number";
    }
    
    return "";
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate all fields
    const dobError = validateDob(dob);
    if (dobError) newErrors.dob = dobError;
    
    const phoneError = validatePhone(phone);
    if (phoneError) newErrors.phone = phoneError;
    
    if (!county) newErrors.county = "County is required";
    if (!clubName) newErrors.clubName = "Club name is required";
    if (!ageGroup) newErrors.ageGroup = "Age group is required";
    if (!division) newErrors.division = "Division is required";
    
    // Update error state
    setErrors(newErrors);
    
    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  // Handle individual field changes with validation
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDob(value);
    const error = validateDob(value);
    setErrors(prev => ({ ...prev, dob: error }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    const error = validatePhone(value);
    setErrors(prev => ({ ...prev, phone: error }));
  };

  const handleCountyChange = (e: SelectChangeEvent) => {
    setCounty(e.target.value);
    setErrors(prev => ({ ...prev, county: "" }));
  };

  const handleClubNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClubName(e.target.value);
    setErrors(prev => ({ ...prev, clubName: "" }));
  };

  const handleAgeGroupChange = (e: SelectChangeEvent) => {
    setAgeGroup(e.target.value);
    setErrors(prev => ({ ...prev, ageGroup: "" }));
  };

  const handleDivisionChange = (e: SelectChangeEvent) => {
    setDivision(e.target.value);
    setErrors(prev => ({ ...prev, division: "" }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    if (!email) {
      setSubmitError("User email not found. Please try signing in again.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create the club or join the existing one
      await createOrJoinClub({
        clubName: clubName,
        coachEmail: email,
        county: county,
        ageGroups: ageGroup,
        divisions: division,
      });

      // Update user profile
      await updateProfile(email, {
        dob: dob,
        phone: phone,
        county: county,
        clubName: clubName,
        ageGroup: ageGroup,
        division: division,
      });


      await createMembership({
        email: email,
        name: name || "",
        dob: dob,
        uid: uid || "",
        clubName: clubName,
        ageGroup: ageGroup,
        division: division,
        role: "coach",
        position: "",
        userRegistered: true,
      });

      navigate("/permissions");
    } catch (error) {
      console.error("Error during profile update:", error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : "An error occurred during registration. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />
      <SignUpContainer direction="column" justifyContent="center" alignItems="center">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ textAlign: "center", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            Coach Registration
          </Typography>
          
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: 2,
            }}
          >
            <FormControl fullWidth error={!!errors.dob}>
              <FormLabel>Date of Birth</FormLabel>
              <TextField
                fullWidth
                id="dob"
                name="dob"
                type="date"
                value={dob}
                onChange={handleDobChange}
                error={!!errors.dob}
              />
              {errors.dob && <FormHelperText>{errors.dob}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth error={!!errors.phone}>
              <FormLabel>Phone Number</FormLabel>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                placeholder="+353 86 220 8215"
                value={phone}
                onChange={handlePhoneChange}
                error={!!errors.phone}
              />
              {errors.phone && <FormHelperText>{errors.phone}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth error={!!errors.county}>
              <FormLabel>County</FormLabel>
              <Select
                value={county}
                onChange={handleCountyChange}
                displayEmpty
                error={!!errors.county}
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
              {errors.county && <FormHelperText>{errors.county}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth error={!!errors.clubName}>
              <FormLabel>Club Name</FormLabel>
              <TextField
                fullWidth
                id="clubName"
                name="clubName"
                placeholder="Enter Club Name"
                value={clubName}
                onChange={handleClubNameChange}
                error={!!errors.clubName}
              />
              {errors.clubName && <FormHelperText>{errors.clubName}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth error={!!errors.ageGroup}>
              <FormLabel>Age Group</FormLabel>
              <Select
                value={ageGroup}
                onChange={handleAgeGroupChange}
                displayEmpty
                error={!!errors.ageGroup}
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
              {errors.ageGroup && <FormHelperText>{errors.ageGroup}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth error={!!errors.division}>
              <FormLabel>Division</FormLabel>
              <Select
                value={division}
                onChange={handleDivisionChange}
                displayEmpty
                error={!!errors.division}
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
              {errors.division && <FormHelperText>{errors.division}</FormHelperText>}
            </FormControl>

            <Button 
              type="submit" 
              fullWidth 
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSubmitting ? "Submitting..." : "Complete Registration"}
            </Button>
          </Box>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
