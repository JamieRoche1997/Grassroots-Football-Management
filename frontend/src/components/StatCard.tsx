import { alpha, styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export type StatCardProps = {
  title: string;
  value: string;
  interval: string;
  trend?: "up" | "down" | "neutral"; // New prop for trend indicator
  icon?: React.ReactNode; // Optional icon
};

const GlassCard = styled(Card)(({ theme }) => ({
  height: "100%",
  flexGrow: 1,
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: "blur(12px)",
  border: "1px solid",
  borderColor: alpha(theme.palette.divider, 0.1),
  borderRadius: 12, // More rounded corners
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.1)",
  },
}));

export default function StatCard({ title, value, interval }: StatCardProps) {
  return (
    <GlassCard variant="outlined">
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            component="h2"
            variant="subtitle2"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {title}
          </Typography>
        </Stack>

        <Stack mt={2} gap={1}>
          <Typography variant="h3" component="p" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            {interval}
          </Typography>
        </Stack>
      </CardContent>
    </GlassCard>
  );
}
