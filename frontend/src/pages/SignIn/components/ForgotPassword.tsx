import * as React from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import OutlinedInput from "@mui/material/OutlinedInput";
import { Typography } from "@mui/material";
import { useState } from "react";
import FormHelperText from "@mui/material/FormHelperText";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword({
  open,
  handleClose,
}: ForgotPasswordProps) {
  const [email, setEmail] = useState<string>(""); 
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const auth = getAuth();

  // Reset state when dialog opens or closes
  React.useEffect(() => {
    if (!open) {
      // Clear form when dialog closes
      setEmail("");
      setMessage(null);
      setError(null);
      setEmailError(null);
    }
  }, [open]);

  const validateEmail = (): boolean => {
    // Email regex pattern for validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!email) {
      setEmailError("Please enter your email.");
      return false;
    } else if (!emailPattern.test(email)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    
    setEmailError(null);
    return true;
  };

  const getReadableErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/invalid-email":
        return "The email address is not valid.";
      case "auth/missing-email":
        return "Please enter an email address.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent successfully!");
      // Clear email field after successful submission
      setEmail("");
    } catch (error: FirebaseError | unknown) {
      const errorCode = error instanceof FirebaseError ? error.code : "unknown-error";
      setError(getReadableErrorMessage(errorCode));
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: "form",
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          handleResetPassword();
        },
        sx: { backgroundImage: "none" },
      }}
    >
      <DialogTitle>Reset password</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
      >
        <DialogContentText>
          Enter your account&apos;s email address, and we&apos;ll send you a
          link to reset your password.
        </DialogContentText>
        <Box sx={{ width: "100%" }}>
          <OutlinedInput
            autoFocus
            margin="dense"
            id="email"
            name="email"
            placeholder="Email address"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(null); // Clear error when user types
            }}
            error={!!emailError}
            disabled={isLoading}
          />
          {emailError && (
            <FormHelperText error>{emailError}</FormHelperText>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleClose} disabled={isLoading}>Cancel</Button>
        <Button 
          variant="contained" 
          type="submit" 
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isLoading ? "Sending..." : "Continue"}
        </Button>
      </DialogActions>
      {message && (
        <Typography color="success.main" sx={{ px: 3, pb: 3, textAlign: "center" }}>
          {message}
        </Typography>
      )}
      {error && (
        <Typography color="error" sx={{ px: 3, pb: 3, textAlign: "center" }}>
          {error}
        </Typography>
      )}
    </Dialog>
  );
}
