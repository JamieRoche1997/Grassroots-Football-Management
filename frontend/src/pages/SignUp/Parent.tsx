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
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";
import AppTheme from "../../components/shared-theme/AppTheme";
import ColorModeSelect from "../../components/shared-theme/ColorModeSelect";
import { updateProfile } from "../../services/profile";
import FormHelperText from "@mui/material/FormHelperText";
import Snackbar from "@mui/material/Snackbar";
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

const ScrollableBox = styled(Box)(({ theme }) => ({
  maxHeight: "60vh",
  overflowY: "auto",
  padding: theme.spacing(1),
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.grey[400],
    borderRadius: "10px",
  },
}));

const relationships = ["Mother", "Father", "Guardian", "Other"];

// Validation helpers
const isValidPhone = (phone: string) => {
  // Basic phone validation - adjust as needed for your requirements
  const phoneRegex = /^\+?[0-9\s]{10,15}$/;
  return phoneRegex.test(phone);
};

const isValidDate = (date: string) => {
  if (!date) return false;
  const today = new Date();
  const inputDate = new Date(date);
  return inputDate instanceof Date && !isNaN(inputDate.getTime()) && inputDate < today;
};

export default function ParentRegistration(props: {
  disableCustomTheme?: boolean;
}) {
  const navigate = useNavigate();
  const [relationship, setRelationship] = React.useState("");
  const [numChildren, setNumChildren] = React.useState(1);
  const [childrenNames, setChildrenNames] = React.useState<string[]>([""]);
  const location = useLocation();
  const email = location.state?.email;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Validation state
  const [errors, setErrors] = React.useState<{
    dob?: string;
    phone?: string;
    relationship?: string;
    children?: string[];
    emergencyContactName?: string;
    emergencyContactPhone?: string;
  }>({
    children: [""],
  });
  
  // Global error handling
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [showError, setShowError] = React.useState(false);

  const handleNumChildrenChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const count = Math.max(1, Math.min(10, parseInt(event.target.value) || 1)); // Ensuring min 1 & max 10
    setNumChildren(count);
    const newNames = Array(count).fill("");
    setChildrenNames(newNames); // Adjust the child name fields dynamically
    setErrors({ ...errors, children: Array(count).fill("") });
  };

  const handleChildNameChange = (index: number, value: string) => {
    const newNames = [...childrenNames];
    newNames[index] = value;
    setChildrenNames(newNames);
    
    // Validate child name
    const newErrors = { ...errors };
    if (!newErrors.children) newErrors.children = Array(childrenNames.length).fill("");
    newErrors.children[index] = value.trim() ? "" : "Child name is required";
    setErrors(newErrors);
  };

  const validateForm = (formData: FormData): boolean => {
    const newErrors: {
      dob?: string;
      phone?: string;
      relationship?: string;
      children?: string[];
      emergencyContactName?: string;
      emergencyContactPhone?: string;
    } = {};
    let isValid = true;
    
    // Validate date of birth
    const dob = formData.get("dob") as string;
    if (!isValidDate(dob)) {
      newErrors.dob = "Please enter a valid date of birth";
      isValid = false;
    }
    
    // Validate phone
    const phone = formData.get("phone") as string;
    if (!isValidPhone(phone)) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }
    
    // Validate relationship
    if (!relationship) {
      newErrors.relationship = "Please select a relationship";
      isValid = false;
    }
    
    // Validate children names
    const childErrors: string[] = Array(childrenNames.length).fill("");
    let hasChildError = false;
    childrenNames.forEach((name, index) => {
      if (!name.trim()) {
        childErrors[index] = "Child name is required";
        hasChildError = true;
        isValid = false;
      }
    });
    
    if (hasChildError) {
      newErrors.children = childErrors;
    }
    
    // Validate emergency contact
    const emergencyName = formData.get("emergencyContactName") as string;
    if (!emergencyName.trim()) {
      newErrors.emergencyContactName = "Emergency contact name is required";
      isValid = false;
    }
    
    const emergencyPhone = formData.get("emergencyContactPhone") as string;
    if (!isValidPhone(emergencyPhone)) {
      newErrors.emergencyContactPhone = "Please enter a valid emergency contact phone number";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    // Validate form before submission
    if (!validateForm(formData)) {
      setSubmitError("Please correct the errors before submitting");
      setShowError(true);
      return;
    }

    setIsSubmitting(true);

    const userData = {
      email,
      dob: formData.get("dob") as string,
      phone: formData.get("phone") as string,
      relationship,
      children: childrenNames,
      emergencyContactName: formData.get("emergencyContactName") as string,
      emergencyContactPhone: formData.get("emergencyContactPhone") as string,
    };

    try {
      await updateProfile(userData.email, {
        dob: userData.dob,
        phone: userData.phone,
        relationship: userData.relationship,
        children: userData.children,
        emergencyContactName: userData.emergencyContactName,
        emergencyContactPhone: userData.emergencyContactPhone,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating user profile:", error);
      setSubmitError("Failed to update profile. Please try again.");
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />
      <SignUpContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          <Typography component="h1" variant="h4" sx={{ textAlign: "center" }}>
            Parent Registration
          </Typography>
          <ScrollableBox>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              {/* Role - Fixed to Parent */}
              <FormControl fullWidth>
                <FormLabel>Role</FormLabel>
                <TextField
                  id="role"
                  name="role"
                  value="Parent"
                  slotProps={{ input: { readOnly: true } }}
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
                  helperText={errors.dob}
                  onChange={() => setErrors({...errors, dob: undefined})}
                />
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
                  helperText={errors.phone}
                  onChange={() => setErrors({...errors, phone: undefined})}
                />
              </FormControl>

              {/* Relationship to Child */}
              <FormControl fullWidth error={!!errors.relationship}>
                <FormLabel>Relationship to Child</FormLabel>
                <Select
                  id="relationship"
                  name="relationship"
                  value={relationship}
                  onChange={(event: SelectChangeEvent) => {
                    setRelationship(event.target.value);
                    setErrors({...errors, relationship: undefined});
                  }}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select Relationship
                  </MenuItem>
                  {relationships.map((rel) => (
                    <MenuItem key={rel} value={rel}>
                      {rel}
                    </MenuItem>
                  ))}
                </Select>
                {errors.relationship && (
                  <FormHelperText>{errors.relationship}</FormHelperText>
                )}
              </FormControl>

              {/* Number of Children */}
              <FormControl fullWidth>
                <FormLabel>Number of Children</FormLabel>
                <TextField
                  type="number"
                  slotProps={{
                    input: {
                      minRows: 1,
                      maxRows: 10,
                    },
                  }}
                  inputProps={{ min: 1, max: 10 }}
                  value={numChildren}
                  onChange={handleNumChildrenChange}
                />
              </FormControl>

              {/* Children's Names - Dynamic Fields */}
              {childrenNames.map((name, index) => (
                <FormControl fullWidth key={index} error={!!(errors.children && errors.children[index])}>
                  <FormLabel>{`Child ${index + 1} Name`}</FormLabel>
                  <TextField
                    fullWidth
                    placeholder={`Enter Child ${index + 1} Name`}
                    value={name}
                    onChange={(e) =>
                      handleChildNameChange(index, e.target.value)
                    }
                    error={!!(errors.children && errors.children[index])}
                    helperText={errors.children && errors.children[index]}
                  />
                </FormControl>
              ))}

              {/* Emergency Contact */}
              <FormControl fullWidth error={!!errors.emergencyContactName}>
                <FormLabel>Emergency Contact Name</FormLabel>
                <TextField
                  fullWidth
                  id="emergencyContactName"
                  name="emergencyContactName"
                  placeholder="Jane Doe"
                  error={!!errors.emergencyContactName}
                  helperText={errors.emergencyContactName}
                  onChange={() => setErrors({...errors, emergencyContactName: undefined})}
                />
              </FormControl>

              <FormControl fullWidth error={!!errors.emergencyContactPhone}>
                <FormLabel>Emergency Contact Phone Number</FormLabel>
                <TextField
                  fullWidth
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  placeholder="+353 86 123 4567"
                  error={!!errors.emergencyContactPhone}
                  helperText={errors.emergencyContactPhone}
                  onChange={() => setErrors({...errors, emergencyContactPhone: undefined})}
                />
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
          </ScrollableBox>
        </Card>
      </SignUpContainer>
      
      {/* Error Snackbar */}
      <Snackbar open={showError} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {submitError}
        </Alert>
      </Snackbar>
    </AppTheme>
  );
}
