import { GridRowsProp, GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';

// Utility to render the "Last 5 Games" column
function renderLastFiveGames(games: ('W' | 'L' | 'D')[]) {
  const colors: { [key: string]: 'success' | 'error' | 'warning' } = {
    W: 'success',
    L: 'error',
    D: 'warning',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%', // Ensure it takes full width of the cell
        height: '100%', // Ensure it takes full height of the cell
      }}
    >
      {games.map((result, index) => (
        <Chip key={index} label={result} color={colors[result]} size="small" />
      ))}
    </div>
  );
}

// League Table Columns
export const leagueTableColumns: GridColDef[] = [
  { field: 'clubName', headerName: 'Club Name', flex: 1.5, minWidth: 50 },
  {
    field: 'gamesPlayed',
    headerName: 'GP',
    headerAlign: 'center',
    align: 'center',
    flex: 1,
    minWidth: 20,
  },
  {
    field: 'wins',
    headerName: 'W',
    headerAlign: 'center',
    align: 'center',
    flex: 1,
    minWidth: 20,
  },
  {
    field: 'draws',
    headerName: 'D',
    headerAlign: 'center',
    align: 'center',
    flex: 1,
    minWidth: 20,
  },
  {
    field: 'losses',
    headerName: 'L',
    headerAlign: 'center',
    align: 'center',
    flex: 1,
    minWidth: 20,
  },
  {
    field: 'goalsScored',
    headerName: 'GF',
    headerAlign: 'center',
    align: 'center',
    flex: 1,
    minWidth: 20,
  },
  {
    field: 'goalsConceded',
    headerName: 'GA',
    headerAlign: 'center',
    align: 'center',
    flex: 1,
    minWidth: 20,
  },
  {
    field: 'goalDifference',
    headerName: 'GD',
    headerAlign: 'center',
    align: 'center',
    flex: 1,
    minWidth: 20,
  },
  {
    field: 'points',
    headerName: 'Pts',
    headerAlign: 'center',
    align: 'center',
    flex: 1,
    minWidth: 20,
  },
  {
    field: 'lastFiveGames',
    headerName: 'Form',
    headerAlign: 'center',
    align: 'center',
    flex: 1.5,
    minWidth: 100,
    renderCell: (params) => renderLastFiveGames(params.value as ('W' | 'L' | 'D')[]),
  },
];

// League Table Rows
export const leagueTableRows: GridRowsProp = [
  {
    id: 1,
    clubName: 'Shamrock Rovers',
    gamesPlayed: 20,
    wins: 15,
    draws: 3,
    losses: 2,
    goalsScored: 40,
    goalsConceded: 18,
    goalDifference: 22,
    points: 48,
    lastFiveGames: ['W', 'W', 'L', 'D', 'W'],
  },
  {
    id: 2,
    clubName: 'Bohemians',
    gamesPlayed: 20,
    wins: 13,
    draws: 4,
    losses: 3,
    goalsScored: 38,
    goalsConceded: 20,
    goalDifference: 18,
    points: 43,
    lastFiveGames: ['W', 'D', 'W', 'W', 'L'],
  },
  {
    id: 3,
    clubName: 'Derry City',
    gamesPlayed: 20,
    wins: 12,
    draws: 5,
    losses: 3,
    goalsScored: 36,
    goalsConceded: 22,
    goalDifference: 14,
    points: 41,
    lastFiveGames: ['W', 'W', 'D', 'L', 'W'],
  },
  {
    id: 4,
    clubName: 'Cork City',
    gamesPlayed: 20,
    wins: 10,
    draws: 6,
    losses: 4,
    goalsScored: 32,
    goalsConceded: 25,
    goalDifference: 7,
    points: 36,
    lastFiveGames: ['D', 'L', 'W', 'W', 'D'],
  },
  {
    id: 5,
    clubName: 'Sligo Rovers',
    gamesPlayed: 20,
    wins: 8,
    draws: 7,
    losses: 5,
    goalsScored: 28,
    goalsConceded: 26,
    goalDifference: 2,
    points: 31,
    lastFiveGames: ['W', 'L', 'D', 'W', 'L'],
  },
  {
    id: 6,
    clubName: 'Galway United',
    gamesPlayed: 20,
    wins: 8,
    draws: 6,
    losses: 6,
    goalsScored: 30,
    goalsConceded: 29,
    goalDifference: 1,
    points: 30,
    lastFiveGames: ['L', 'W', 'D', 'L', 'W'],
  },
  {
    id: 7,
    clubName: 'Finn Harps',
    gamesPlayed: 20,
    wins: 6,
    draws: 5,
    losses: 9,
    goalsScored: 25,
    goalsConceded: 33,
    goalDifference: -8,
    points: 23,
    lastFiveGames: ['L', 'D', 'W', 'L', 'L'],
  },
  {
    id: 8,
    clubName: 'Waterford FC',
    gamesPlayed: 20,
    wins: 5,
    draws: 6,
    losses: 9,
    goalsScored: 24,
    goalsConceded: 34,
    goalDifference: -10,
    points: 21,
    lastFiveGames: ['L', 'L', 'D', 'W', 'D'],
  },
  {
    id: 9,
    clubName: 'Longford Town',
    gamesPlayed: 20,
    wins: 4,
    draws: 5,
    losses: 11,
    goalsScored: 18,
    goalsConceded: 35,
    goalDifference: -17,
    points: 17,
    lastFiveGames: ['D', 'L', 'L', 'D', 'L'],
  },
  {
    id: 10,
    clubName: 'Cobh Ramblers',
    gamesPlayed: 20,
    wins: 3,
    draws: 3,
    losses: 14,
    goalsScored: 15,
    goalsConceded: 42,
    goalDifference: -27,
    points: 12,
    lastFiveGames: ['L', 'L', 'D', 'L', 'L'],
  },
];
