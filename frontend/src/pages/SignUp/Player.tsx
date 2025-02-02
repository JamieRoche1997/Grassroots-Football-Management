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
import { updateUserProfile } from './api/updateUser';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow: theme.shadows[2],
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: '100vh',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
}));

const positions = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

export default function PlayerRegistration() {
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
      await updateUserProfile(userData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
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
