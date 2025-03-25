import { alpha, styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import StarIcon from '@mui/icons-material/Star';
import StyleIcon from '@mui/icons-material/Style';

const GlassCard = styled(Card)(({ theme }) => ({
  height: '100%',
  width: '100%', // Add fixed width
  minHeight: 200, // Set minimum height
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: 'blur(12px)',
  border: '1px solid',
  borderColor: alpha(theme.palette.divider, 0.1),
  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  display: 'flex', // Add flex display
  flexDirection: 'column', // Column layout
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.1)',
  },
}));

const StatBadge = styled(Stack)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  borderRadius: 8,
  padding: theme.spacing(1),
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%', // Make badges equal height
  minWidth: 80,
}));

export interface PlayerStatCardProps {
  playerName: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  position?: string;
  avatar?: string;
}

export default function PlayerStatCard({
  playerName,
  goals,
  assists,
  yellowCards,
  redCards,
  position,
  avatar,
}: PlayerStatCardProps) {
  return (
    <GlassCard variant="outlined">
      <CardContent sx={{ 
        p: 3,
        flex: 1, // Make content fill available space
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Stack spacing={2} sx={{ flex: 1 }}>
          {/* Player Header - now with fixed height */}
          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center"
          >
            {avatar && (
              <img 
                src={avatar} 
                alt={playerName} 
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid',
                  borderColor: alpha('#2BD575', 0.3),
                }}
              />
            )}
            <Stack>
              <Typography 
                variant="h6" 
                fontWeight={600}
                noWrap // Prevent text wrapping
              >
                {playerName}
              </Typography>
              {position && (
                <Typography variant="caption" color="text.secondary">
                  {position}
                </Typography>
              )}
            </Stack>
          </Stack>

          {/* Stats Grid - now with equal height cells */}
          <Stack 
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1,
              flex: 1, // Take remaining space
              '& > *': { height: '100%' } // Force equal height
            }}
          >
            <StatBadge>
              <SportsSoccerIcon color="primary" />
              <Typography variant="subtitle2" fontWeight={600}>
                {goals}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Goals
              </Typography>
            </StatBadge>

            <StatBadge>
              <StarIcon color="primary" />
              <Typography variant="subtitle2" fontWeight={600}>
                {assists}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Assists
              </Typography>
            </StatBadge>

            <StatBadge sx={{ backgroundColor: alpha('#FFD700', 0.1) }}>
              <StyleIcon sx={{ color: '#FFD700' }} />
              <Typography variant="subtitle2" fontWeight={600}>
                {yellowCards}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Yellows
              </Typography>
            </StatBadge>

            <StatBadge sx={{ backgroundColor: alpha('#FF5C5C', 0.1) }}>
              <StyleIcon sx={{ color: '#FF5C5C' }} />
              <Typography variant="subtitle2" fontWeight={600}>
                {redCards}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Reds
              </Typography>
            </StatBadge>
          </Stack>
        </Stack>
      </CardContent>
    </GlassCard>
  );
}