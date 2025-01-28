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

export default function AdditionalInfo() {
    const navigate = useNavigate();
    const [role, setRole] = React.useState('');

    const handleRoleChange = (event: SelectChangeEvent) => {
        setRole(event.target.value);
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
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{ textAlign: 'center', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
                    >
                        Additional Information
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                        <FormControl required fullWidth>
                            <FormLabel htmlFor="role">Role</FormLabel>
                            <Select
                                id="role"
                                name="role"
                                value={role}
                                onChange={handleRoleChange}
                                displayEmpty
                            >
                                <MenuItem value="" disabled>
                                    Select your role
                                </MenuItem>
                                <MenuItem value="Coach">Coach</MenuItem>
                                <MenuItem value="Player">Player</MenuItem>
                                <MenuItem value="Parent">Parent</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor="club">Associated Club</FormLabel>
                            <TextField required fullWidth id="club" name="club" placeholder="Cobh Ramblers" />
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor="dob">Date of Birth</FormLabel>
                            <TextField required fullWidth id="dob" name="dob" type="date" />
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor="phone">Phone Number</FormLabel>
                            <TextField required fullWidth id="phone" name="phone" placeholder="+353 86 220 8215" />
                        </FormControl>
                        <Button type="submit" fullWidth variant="contained">
                            Complete Sign Up
                        </Button>
                    </Box>
                </Card>
            </SignUpContainer>
        </AppTheme>
    );
}
