import Chip from '@mui/material/Chip';
import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';

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

// Player Stats Columns
// eslint-disable-next-line react-refresh/only-export-components
export const playerStatsColumns: GridColDef[] = [
  { field: 'playerName', headerName: 'Player Name', flex: 1.5, minWidth: 150 },
  { field: 'gamesPlayed', headerName: 'GP', headerAlign: 'center', align: 'center', flex: 1 },
  { field: 'goals', headerName: 'Goals', headerAlign: 'center', align: 'center', flex: 1 },
  { field: 'assists', headerName: 'Assists', headerAlign: 'center', align: 'center', flex: 1 },
  { field: 'yellowCards', headerName: 'YC', headerAlign: 'center', align: 'center', flex: 1 },
  { field: 'redCards', headerName: 'RC', headerAlign: 'center', align: 'center', flex: 1 },
  {
    field: 'lastFiveGames',
    headerName: 'Form',
    headerAlign: 'center', 
    align: 'center',
    flex: 1.5,
    minWidth: 100,
    renderCell: (params) =>
      renderLastFiveGames(params.value as ('W' | 'L' | 'D')[]),
  },
];

// Player Stats Rows
// eslint-disable-next-line react-refresh/only-export-components
export const playerStatsRows: GridRowsProp = [
  {
    id: 1,
    playerName: 'John Smith',
    gamesPlayed: 20,
    goals: 12,
    assists: 8,
    yellowCards: 3,
    redCards: 1,
    lastFiveGames: ['W', 'L', 'W', 'D', 'W'],
  },
  {
    id: 2,
    playerName: 'Alex Johnson',
    gamesPlayed: 18,
    goals: 10,
    assists: 6,
    yellowCards: 4,
    redCards: 0,
    lastFiveGames: ['D', 'W', 'W', 'L', 'W'],
  },
  {
    id: 3,
    playerName: 'Chris Brown',
    gamesPlayed: 15,
    goals: 8,
    assists: 5,
    yellowCards: 2,
    redCards: 1,
    lastFiveGames: ['L', 'W', 'D', 'W', 'L'],
  },
];

// Player Stats Grid Component
export default function PlayerStatsGrid() {
  return (
    <DataGrid
      rows={playerStatsRows}
      columns={playerStatsColumns}
      initialState={{
        pagination: { paginationModel: { pageSize: 10 } },
      }}
      pageSizeOptions={[10, 20, 50]}
      density="compact"
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
      }
      sx={{
        '& .MuiDataGrid-cell': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
    />
  );
}
