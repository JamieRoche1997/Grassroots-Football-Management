import { DataGrid } from '@mui/x-data-grid';
import { playerStatsColumns, playerStatsRows } from '../internals/data/gridData';

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
    />
  );
}
