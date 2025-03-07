import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../../components/shared-theme/AppTheme';
import ColorModeSelect from '../../components/shared-theme/ColorModeSelect';
import { getProfile, updateProfile } from '../../services/profile';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

const positions = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

export default function PlayerRegistration(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const [position, setPosition] = React.useState('');
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const userData = {
      email,
      dob: formData.get('dob') as string,
      phone: formData.get('phone') as string,
      position,
      emergencyContactName: formData.get('emergencyContactName') as string,
      emergencyContactPhone: formData.get('emergencyContactPhone') as string,
    };

    try {
      // Update user profile
      await updateProfile(email, {
        dob: userData.dob,
        phone: userData.phone,
        emergencyContactName: userData.emergencyContactName,
        emergencyContactPhone: userData.emergencyContactPhone,
        position: userData.position,
      });

      // Check if the user already has a club assigned
      const membershipInfo = await getProfile(email);

      if (membershipInfo.clubName && membershipInfo.ageGroup && membershipInfo.division) {
        // If user already belongs to a club, skip club search
        navigate('/dashboard');
      } else {
        // If no club assigned, go to club search
        navigate('/club-search');
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };


  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <SignUpContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          <Typography component="h1" variant="h4" sx={{ textAlign: 'center' }}>
            Player Registration
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Role - Fixed to Player */}
            <FormControl required fullWidth>
              <FormLabel>Role</FormLabel>
              <TextField
                id="role"
                name="role"
                value="Player"
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
                fullWidth
              />
            </FormControl>

            {/* Date of Birth */}
            <FormControl required fullWidth>
              <FormLabel htmlFor="dob">Date of Birth</FormLabel>
              <TextField required fullWidth id="dob" name="dob" type="date" />
            </FormControl>

            {/* Phone Number */}
            <FormControl required fullWidth>
              <FormLabel htmlFor="phone">Phone Number</FormLabel>
              <TextField required fullWidth id="phone" name="phone" placeholder="+353 86 220 8215" />
            </FormControl>

            {/* Preferred Position */}
            <FormControl required fullWidth>
              <FormLabel>Preferred Position</FormLabel>
              <Select
                id="position"
                name="position"
                value={position}
                onChange={(event: SelectChangeEvent) => setPosition(event.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>Select Position</MenuItem>
                {positions.map((pos) => (
                  <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Emergency Contact */}
            <FormControl required fullWidth>
              <FormLabel>Emergency Contact Name</FormLabel>
              <TextField required fullWidth id="emergencyContactName" name="emergencyContactName" placeholder="John Doe" />
            </FormControl>

            <FormControl required fullWidth>
              <FormLabel>Emergency Contact Phone Number</FormLabel>
              <TextField required fullWidth id="emergencyContactPhone" name="emergencyContactPhone" placeholder="+353 86 123 4567" />
            </FormControl>

            <Button type="submit" fullWidth variant="contained">
              Complete Registration
            </Button>
          </Box>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
