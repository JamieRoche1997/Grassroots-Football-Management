import MuiAvatar from '@mui/material/Avatar';
import MuiListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { useAuth } from '../hooks/useAuth';

const Avatar = styled(MuiAvatar)(() => ({
  width: 40,
  height: 40,
  fontSize: '1.2rem',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textTransform: 'uppercase',
}));

const ListItemAvatar = styled(MuiListItemAvatar)({
  minWidth: 0,
  marginRight: 12,
});

export default function ClubInfoDisplay() {
  const { clubName, ageGroup, division } = useAuth();

  // Extract initials from the club name
  const getClubInitials = (name: string | null) => {
    if (!name) return 'N/A';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: 250,
        padding: '8px',
        borderRadius: '8px',
        border: `1px solid #ddd`,
        backgroundColor: 'background.paper',
      }}
    >
      <ListItemAvatar>
        <Avatar alt={clubName || undefined}>{getClubInitials(clubName)}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={clubName || 'No Club Assigned'}
        secondary={
          <>
            {ageGroup || 'N/A'} <br /> {division || 'N/A'}
          </>
        }
        slotProps={{
          primary: { sx: { fontWeight: 'bold', fontSize: '1rem' } },
          secondary: { sx: { fontSize: '0.85rem', color: 'text.secondary' } },
        }}
      />
    </Box>
  );
}
