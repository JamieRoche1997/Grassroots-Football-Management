import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface LoadingSpinnerProps {
  size?: number;
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning" | "inherit";
  fullScreen?: boolean;
  overlay?: boolean;
  text?: string;
  thickness?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color = "primary",
  fullScreen = true,
  overlay = false,
  text,
  thickness = 3.6,
}) => {
  const content = (
    <>
      <CircularProgress size={size} color={color} thickness={thickness} />
      {text && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, textAlign: "center" }}
        >
          {text}
        </Typography>
      )}
    </>
  );

  if (overlay) {
    return (
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: fullScreen ? "100vh" : "100%",
      }}
    >
      {content}
    </Box>
  );
};

export default LoadingSpinner;
