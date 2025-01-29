import * as React from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function ParentRegistration() {
  const navigate = useNavigate();
  const [relationship, setRelationship] = React.useState('');
  const [numChildren, setNumChildren] = React.useState(1);
  const [childrenNames, setChildrenNames] = React.useState<string[]>([""]);

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate('/dashboard');
  };

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
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
                <TextField id="role" name="role" value="Parent" slotProps={{input: {readOnly: true,},}} fullWidth />
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
