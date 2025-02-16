import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme } from "@mui/material/styles";
import { fetchMatches } from "../../../services/schedule_management";
import { useAuth } from "../../../hooks/useAuth";
import { format } from "date-fns";

export default function PageViewsBarChart() {
  const theme = useTheme();
  const { clubName, ageGroup, division } = useAuth();
  const colorPalette = [
    theme.palette.primary.dark,
    theme.palette.primary.main,
    theme.palette.primary.light,
  ];

  interface ChartData {
    months: string[];
    wins: number[];
    losses: number[];
    draws: number[];
    totalWins: number;
    winRateChange: number;
  }

  const [chartData, setChartData] = useState<ChartData>({
    months: [],
    wins: [],
    losses: [],
    draws: [],
    totalWins: 0,
    winRateChange: 0, // Change percentage
  });

  useEffect(() => {
    const fetchMatchResults = async () => {
      if (!clubName || !ageGroup || !division) return;
  
      try {
        const currentDate = new Date();
        const pastSixMonths = [...Array(6)].map((_, i) => {
          const date = new Date();
          date.setMonth(currentDate.getMonth() - i);
          return date.toISOString().slice(0, 7); // Format: "YYYY-MM"
        });
  
        console.log("Fetching matches for months:", pastSixMonths);
  
        interface Match {
          date: string;
          homeTeam: string;
          awayTeam: string;
          homeScore?: number;
          awayScore?: number;
        }

        let allMatches: Match[] = [];
        for (const month of pastSixMonths) {
          const matches = await fetchMatches(month, clubName, ageGroup, division);
          allMatches = [...allMatches, ...matches]; // Merge all matches
        }
  
        console.log("Fetched Matches:", allMatches);
  
        if (!allMatches || allMatches.length === 0) {
          console.warn("No matches found for the last 6 months.");
          return;
        }
  
        // Initialize results structure
        const resultsByMonth: { [month: string]: { wins: number; losses: number; draws: number } } = {};
  
        allMatches.forEach((match) => {
          if (match.homeScore === undefined || match.awayScore === undefined) {
            console.warn("Skipping match with missing score:", match);
            return;
          }
  
          // Parse date properly
          const matchDate = new Date(match.date);
          if (isNaN(matchDate.getTime())) {
            console.error("Invalid date format:", match.date);
            return;
          }
  
          const monthKey = format(matchDate, "MMM"); // Get "Feb", "Mar", etc.
  
          if (!resultsByMonth[monthKey]) {
            resultsByMonth[monthKey] = { wins: 0, losses: 0, draws: 0 };
          }
  
          const isHomeTeam = match.homeTeam === clubName;
          const isAwayTeam = match.awayTeam === clubName;
  
          if (isHomeTeam || isAwayTeam) {
            const teamScore = isHomeTeam ? match.homeScore : match.awayScore;
            const opponentScore = isHomeTeam ? match.awayScore : match.homeScore;
  
            if (teamScore > opponentScore) {
              resultsByMonth[monthKey].wins++;
            } else if (teamScore < opponentScore) {
              resultsByMonth[monthKey].losses++;
            } else {
              resultsByMonth[monthKey].draws++;
            }
          }
        });
  
        console.log("Results By Month:", resultsByMonth);
        setChartData({
          months: Object.keys(resultsByMonth),
          wins: Object.values(resultsByMonth).map((m) => m.wins),
          losses: Object.values(resultsByMonth).map((m) => m.losses),
          draws: Object.values(resultsByMonth).map((m) => m.draws),
          totalWins: Object.values(resultsByMonth).reduce((acc, val) => acc + val.wins, 0),
          winRateChange: 0, // Placeholder
        });
      } catch (error) {
        console.error("Error fetching match results:", error);
      }
    };
  
    fetchMatchResults();
  }, [clubName, ageGroup, division]);  

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Wins
        </Typography>
        <Stack sx={{ justifyContent: "space-between" }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: "center", sm: "flex-start" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              {chartData.totalWins}
            </Typography>
            <Chip
              size="small"
              color={chartData.winRateChange >= 0 ? "success" : "error"}
              label={`${chartData.winRateChange}%`}
            />
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Results
          </Typography>
        </Stack>
        <BarChart
          borderRadius={8}
          colors={colorPalette}
          xAxis={[
            {
              scaleType: "band",
              data: chartData.months,
            },
          ]}
          series={[
            { id: "wins", label: "Wins", data: chartData.wins },
            { id: "losses", label: "Losses", data: chartData.losses },
            { id: "draws", label: "Draws", data: chartData.draws },
          ]}
          height={250}
          margin={{ left: 50, right: 0, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          slotProps={{
            legend: {
              hidden: true,
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
