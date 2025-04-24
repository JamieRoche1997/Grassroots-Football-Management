import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";
import AppTheme from "../../components/shared-theme/AppTheme";
import ColorModeSelect from "../../components/shared-theme/ColorModeSelect";
import { getProfile, updateProfile } from "../../services/profile";
import { updateMembership } from "../../services/membership";
import Alert from "@mui/material/Alert";

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
  maxHeight: "90vh",
  overflowY: "auto",
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
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

const positions = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

export default function PlayerRegistration(props: {
  disableCustomTheme?: boolean;
}) {
  const navigate = useNavigate();
  const [position, setPosition] = React.useState("");
  const location = useLocation();
  const email = location.state?.email;
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");

  const validateForm = (formData: FormData) => {
    const newErrors: Record<string, string> = {};
    
    // DOB validation
    const dob = formData.get("dob") as string;
    if (!dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const dobDate = new Date(dob);
      const today = new Date();
      if (dobDate > today) {
        newErrors.dob = "Date of birth cannot be in the future";
      }
      
      // Check if player is too old (e.g., over 40) or too young (e.g., under 5)
      const age = today.getFullYear() - dobDate.getFullYear();
      if (age > 40) {
        newErrors.dob = "Age seems too high for youth football";
      } else if (age < 5) {
        newErrors.dob = "Player must be at least 5 years old";
      }
    }
    
    // Phone validation
    const phone = formData.get("phone") as string;
    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^(\+\d{1,3}\s?)?\d{6,14}$/.test(phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    // Position validation
    if (!position) {
      newErrors.position = "Please select a position";
    }
    
    // Emergency contact validation
    const emergencyName = formData.get("emergencyContactName") as string;
    if (!emergencyName) {
      newErrors.emergencyContactName = "Emergency contact name is required";
    }
    
    const emergencyPhone = formData.get("emergencyContactPhone") as string;
    if (!emergencyPhone) {
      newErrors.emergencyContactPhone = "Emergency contact phone is required";
    } else if (!/^(\+\d{1,3}\s?)?\d{6,14}$/.test(emergencyPhone.replace(/\s/g, ""))) {
      newErrors.emergencyContactPhone = "Please enter a valid phone number";
    }
    
    return newErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    
    const formData = new FormData(event.currentTarget);
    const newErrors = validateForm(formData);
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setSubmitting(true);

    const userData = {
      email,
      dob: formData.get("dob") as string,
      phone: formData.get("phone") as string,
      position,
      emergencyContactName: formData.get("emergencyContactName") as string,
      emergencyContactPhone: formData.get("emergencyContactPhone") as string,
    };

    try {
      // Update user profile
      await updateProfile(email, {
        dob: userData.dob,
        phone: userData.phone,
        emergencyContactName: userData.emergencyContactName,
        emergencyContactPhone: userData.emergencyContactPhone,
        position: userData.position,
      });

      // Check if the user already has a club assigned
      const membershipInfo = await getProfile(email);

      if (
        membershipInfo.clubName &&
        membershipInfo.ageGroup &&
        membershipInfo.division
      ) {
        // If user already belongs to a club, skip club search
        await updateMembership({
          email,
          clubName: membershipInfo.clubName,
          ageGroup: membershipInfo.ageGroup,
          division: membershipInfo.division,
          dob: membershipInfo.dob,
        });
        navigate("/permissions");
      } else {
        // If no club assigned, go to club search
        navigate("/club-search");
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      setSubmitError("Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />
      <SignUpContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          <Typography component="h1" variant="h4" sx={{ textAlign: "center" }}>
            Player Registration
          </Typography>
          {submitError && <Alert severity="error">{submitError}</Alert>}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {/* Role - Fixed to Player */}
            <FormControl fullWidth>
              <FormLabel>Role</FormLabel>
              <TextField
                id="role"
                name="role"
                value="Player"
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
                fullWidth
              />
            </FormControl>

            {/* Date of Birth */}
            <FormControl fullWidth error={!!errors.dob}>
              <FormLabel htmlFor="dob">Date of Birth</FormLabel>
              <TextField 
                fullWidth 
                id="dob" 
                name="dob" 
                type="date" 
                error={!!errors.dob} 
              />
              {errors.dob && <FormHelperText>{errors.dob}</FormHelperText>}
            </FormControl>

            {/* Phone Number */}
            <FormControl fullWidth error={!!errors.phone}>
              <FormLabel htmlFor="phone">Phone Number</FormLabel>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                placeholder="+353 86 220 8215"
                error={!!errors.phone}
              />
              {errors.phone && <FormHelperText>{errors.phone}</FormHelperText>}
            </FormControl>

            {/* Preferred Position */}
            <FormControl fullWidth error={!!errors.position}>
              <FormLabel>Preferred Position</FormLabel>
              <Select
                id="position"
                name="position"
                value={position}
                onChange={(event: SelectChangeEvent) =>
                  setPosition(event.target.value)
                }
                displayEmpty
                error={!!errors.position}
              >
                <MenuItem value="" disabled>
                  Select Position
                </MenuItem>
                {positions.map((pos) => (
                  <MenuItem key={pos} value={pos}>
                    {pos}
                  </MenuItem>
                ))}
              </Select>
              {errors.position && <FormHelperText>{errors.position}</FormHelperText>}
            </FormControl>

            {/* Emergency Contact */}
            <FormControl fullWidth error={!!errors.emergencyContactName}>
              <FormLabel>Emergency Contact Name</FormLabel>
              <TextField
                fullWidth
                id="emergencyContactName"
                name="emergencyContactName"
                placeholder="John Doe"
                error={!!errors.emergencyContactName}
              />
              {errors.emergencyContactName && <FormHelperText>{errors.emergencyContactName}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth error={!!errors.emergencyContactPhone}>
              <FormLabel>Emergency Contact Phone Number</FormLabel>
              <TextField
                fullWidth
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                placeholder="+353 86 123 4567"
                error={!!errors.emergencyContactPhone}
              />
              {errors.emergencyContactPhone && <FormHelperText>{errors.emergencyContactPhone}</FormHelperText>}
            </FormControl>

            <Button 
              type="submit" 
              fullWidth 
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {submitting ? "Submitting..." : "Complete Registration"}
            </Button>
          </Box>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
