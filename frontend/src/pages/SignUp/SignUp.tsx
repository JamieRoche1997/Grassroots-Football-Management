import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";
import AppTheme from "../../components/shared-theme/AppTheme";
import ColorModeSelect from "../../components/shared-theme/ColorModeSelect";
import { GoogleIcon } from "./components/CustomIcons";
import { signUp, signUpWithGoogle } from "../../services/authentication";

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const useQuery = (): URLSearchParams => {
  return new URLSearchParams(useLocation().search);
};

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

export default function SignUp(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [generalError, setGeneralError] = React.useState("");
  const query = useQuery();
  const role = query.get("role");

  if (!role) {
    navigate("/");
    return null;
  }

  const displayRole = role[0].toUpperCase() + role.slice(1);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Reset all error states
    setEmailError(false);
    setEmailErrorMessage("");
    setPasswordError(false);
    setPasswordErrorMessage("");
    setNameError(false);
    setNameErrorMessage("");
    setGeneralError("");

    // Validate inputs
    if (!validateInputs()) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    setIsSubmitting(true);

    try {
      await signUp(email, password, name, role);
      navigate(`/signup/${role}`, { state: { email } });
    } catch (error) {
      console.error("Error during sign-up:", error);
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes("email")) {
          setEmailError(true);
          setEmailErrorMessage(error.message);
        } else if (error.message.toLowerCase().includes("password")) {
          setPasswordError(true);
          setPasswordErrorMessage(error.message);
        } else {
          setGeneralError(error.message);
        }
      } else {
        setGeneralError("An unknown error occurred during sign-up.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGeneralError("");
    setIsSubmitting(true);

    try {
      await signUpWithGoogle(role);

      // Get the email from localStorage for navigation purposes
      const email = localStorage.getItem("email");

      if (email) {
        navigate(`/signup/${role}`, { state: { email } });
      } else {
        setGeneralError("User email not found after Google Sign-Up.");
      }
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
      if (error instanceof Error) {
        setGeneralError(error.message);
      } else {
        setGeneralError("An error occurred during Google Sign-Up.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateInputs = (): boolean => {
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;
    const name = document.getElementById("name") as HTMLInputElement;

    let isValid = true;

    // Validate name
    const NAME_REGEX = /^[a-zA-Z\s]+$/;
    if (!NAME_REGEX.test(name.value.trim())) {
      setNameError(true);
      setNameErrorMessage("Name can only contain letters and spaces.");
      isValid = false;
    } else if (name.value.trim().length < 2) {
      setNameError(true);
      setNameErrorMessage("Name must be at least 2 characters.");
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage("");
    }

    // Validate email
    if (!email?.value?.trim()) {
      setEmailError(true);
      setEmailErrorMessage("Email is required.");
      isValid = false;
    } else if (!EMAIL_REGEX.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    // Validate password
    const PASSWORD_REGEX =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{}<>?/\\|~`.,;:'"+=_-]).{6,}$/;

    if (!password?.value) {
      setPasswordError(true);
      setPasswordErrorMessage("Password is required.");
      isValid = false;
    } else if (!PASSWORD_REGEX.test(password.value)) {
      setPasswordError(true);
      setPasswordErrorMessage(
        "Password must be at least 6 characters long and include a lowercase letter, an uppercase letter, a number, and a special character."
      );
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography
            component="h1"
            align="center"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            {displayRole} Sign Up
          </Typography>

          {generalError && (
            <Typography color="error" align="center" sx={{ mt: 1 }}>
              {generalError}
            </Typography>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="name">Full name</FormLabel>
              <TextField
                autoComplete="name"
                name="name"
                fullWidth
                id="name"
                placeholder="Jon Snow"
                error={nameError}
                helperText={nameErrorMessage}
                color={nameError ? "error" : "primary"}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                fullWidth
                id="email"
                placeholder="your@email.com"
                name="email"
                autoComplete="email"
                variant="outlined"
                error={emailError}
                helperText={emailErrorMessage}
                color={emailError ? "error" : "primary"}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                fullWidth
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="new-password"
                variant="outlined"
                error={passwordError}
                helperText={passwordErrorMessage}
                color={passwordError ? "error" : "primary"}
                disabled={isSubmitting}
              />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSubmitting ? "Signing up..." : "Sign up"}
            </Button>
          </Box>
          <Divider>
            <Typography sx={{ color: "text.secondary" }}>or</Typography>
          </Divider>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleSignIn}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing up..." : "Sign up with Google"}
            </Button>
            <Typography sx={{ textAlign: "center" }}>
              Already have an account?{" "}
              <Link href="/signin" variant="body2" sx={{ alignSelf: "center" }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
