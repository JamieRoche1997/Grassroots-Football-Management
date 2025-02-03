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
import { updateUserProfile } from '../../services/user_management';

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

const ScrollableBox = styled(Box)(({ theme }) => ({
  maxHeight: 'auto',
  overflowY: 'auto',
  padding: theme.spacing(1),
  "&::-webkit-scrollbar": {
    width: "2px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.grey[400],
    borderRadius: "10px",
  },
}));

const relationships = ["Mother", "Father", "Guardian", "Other"];

export default function ParentRegistration(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();
  const [relationship, setRelationship] = React.useState('');
  const [numChildren, setNumChildren] = React.useState(1);
  const [childrenNames, setChildrenNames] = React.useState<string[]>([""]);
  const location = useLocation();
  const email = location.state?.email;

  const handleNumChildrenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const count = Math.max(1, Math.min(10, parseInt(event.target.value) || 1)); // Ensuring min 1 & max 10
    setNumChildren(count);
    setChildrenNames(Array(count).fill("")); // Adjust the child name fields dynamically
  };

  const handleChildNameChange = (index: number, value: string) => {
    const newNames = [...childrenNames];
    newNames[index] = value;
    setChildrenNames(newNames);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const userData = {
      email,
      dob: formData.get('dob') as string,
      phone: formData.get('phone') as string,
      relationship,
      children: childrenNames,
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
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <SignUpContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          <Typography component="h1" variant="h4" sx={{ textAlign: 'center' }}>
            Parent Registration
          </Typography>
          <ScrollableBox>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

              {/* Role - Fixed to Parent */}
              <FormControl required fullWidth>
                <FormLabel>Role</FormLabel>
                <TextField id="role" name="role" value="Parent" slotProps={{ input: { readOnly: true, }, }} fullWidth />
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

              {/* Relationship to Child */}
              <FormControl required fullWidth>
                <FormLabel>Relationship to Child</FormLabel>
                <Select
                  id="relationship"
                  name="relationship"
                  value={relationship}
                  onChange={(event: SelectChangeEvent) => setRelationship(event.target.value)}
                  displayEmpty
                >
                  <MenuItem value="" disabled>Select Relationship</MenuItem>
                  {relationships.map((rel) => (
                    <MenuItem key={rel} value={rel}>{rel}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Number of Children */}
              <FormControl required fullWidth>
                <FormLabel>Number of Children</FormLabel>
                <TextField
                  type="number"
                  slotProps={{
                    input: {
                      minRows: 1,
                      maxRows: 10,
                    },
                  }}
                  inputProps={{ min: 1, max: 10 }}
                  value={numChildren}
                  onChange={handleNumChildrenChange}
                />
              </FormControl>

              {/* Children's Names - Dynamic Fields */}
              {childrenNames.map((name, index) => (
                <FormControl required fullWidth key={index}>
                  <FormLabel>{`Child ${index + 1} Name`}</FormLabel>
                  <TextField
                    required
                    fullWidth
                    placeholder={`Enter Child ${index + 1} Name`}
                    value={name}
                    onChange={(e) => handleChildNameChange(index, e.target.value)}
                  />
                </FormControl>
              ))}

              {/* Emergency Contact */}
              <FormControl required fullWidth>
                <FormLabel>Emergency Contact Name</FormLabel>
                <TextField required fullWidth id="emergencyContactName" name="emergencyContactName" placeholder="Jane Doe" />
              </FormControl>

              <FormControl required fullWidth>
                <FormLabel>Emergency Contact Phone Number</FormLabel>
                <TextField required fullWidth id="emergencyContactPhone" name="emergencyContactPhone" placeholder="+353 86 123 4567" />
              </FormControl>

              <Button type="submit" fullWidth variant="contained">
                Complete Registration
              </Button>
            </Box>
          </ScrollableBox>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
