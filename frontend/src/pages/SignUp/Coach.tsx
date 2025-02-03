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
import { createOrJoinClub } from '../../services/team_management';

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

const counties = [
    "Antrim", "Armagh", "Carlow", "Cavan", "Clare", "Cork", "Derry", "Donegal",
    "Down", "Dublin", "Fermanagh", "Galway", "Kerry", "Kildare", "Kilkenny",
    "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath",
    "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Tyrone",
    "Waterford", "Westmeath", "Wexford", "Wicklow"
];

const ageGroups = [
    "Under 12", "Under 13", "Under 14", "Under 15", "Under 16",
    "Under 17", "Under 18", "Under 19", "Junior", "Senior", "Professional"
];

const divisions = Array.from({ length: 16 }, (_, i) => `Division ${i === 0 ? 'Premier' : i}`);

export default function Coach(props: { disableCustomTheme?: boolean }) {
    const navigate = useNavigate();
    const [county, setCounty] = React.useState('');
    const [clubName, setClubName] = React.useState('');
    const [ageGroup, setAgeGroup] = React.useState('');
    const [division, setDivision] = React.useState('');
    const location = useLocation();
    const email = location.state?.email;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const userData = {
            email: email || '',
            dob: formData.get('dob') as string,
            phone: formData.get('phone') as string,
            county: county,
            clubName: clubName,
            ageGroup: ageGroup,
            division: division,
        };

        if (!userData.email) {
            console.error('User email not found in localStorage.');
            return;
        }

        try {
            // Step 1: Update user profile
            await updateUserProfile(userData);

            // Step 2: Create the club or join the existing one
            await createOrJoinClub({
                clubName: clubName,
                coachEmail: email || '',
                county: county,
                ageGroups: ageGroup,
                divisions: division
            });

            navigate('/dashboard');
        } catch (error) {
            console.error('Error during profile update:', error);
        }
    };

    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
            <SignUpContainer direction="column" justifyContent="space-between">
                <Card variant="outlined">
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{ textAlign: 'center', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
                    >
                        Coach Registration
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl required fullWidth>
                            <FormLabel>Date of Birth</FormLabel>
                            <TextField required fullWidth id="dob" name="dob" type="date" />
                        </FormControl>

                        <FormControl required fullWidth>
                            <FormLabel>Phone Number</FormLabel>
                            <TextField required fullWidth id="phone" name="phone" placeholder="+353 86 220 8215" />
                        </FormControl>

                        <FormControl required fullWidth>
                            <FormLabel>County</FormLabel>
                            <Select value={county} onChange={(e: SelectChangeEvent) => setCounty(e.target.value)} displayEmpty>
                                <MenuItem value="" disabled>Select County</MenuItem>
                                {counties.map((county) => (
                                    <MenuItem key={county} value={county}>{county}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl required fullWidth>
                            <FormLabel>Club Name</FormLabel>
                            <TextField
                                required
                                fullWidth
                                id="clubName"
                                name="clubName"
                                placeholder="Enter Club Name"
                                value={clubName}
                                onChange={(e) => setClubName(e.target.value)}
                            />
                        </FormControl>

                        <FormControl required fullWidth>
                            <FormLabel>Age Group</FormLabel>
                            <Select value={ageGroup} onChange={(e: SelectChangeEvent) => setAgeGroup(e.target.value)} displayEmpty>
                                <MenuItem value="" disabled>Select Age Group</MenuItem>
                                {ageGroups.map((group) => (
                                    <MenuItem key={group} value={group}>{group}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl required fullWidth>
                            <FormLabel>Division</FormLabel>
                            <Select value={division} onChange={(e: SelectChangeEvent) => setDivision(e.target.value)} displayEmpty>
                                <MenuItem value="" disabled>Select Division</MenuItem>
                                {divisions.map((div) => (
                                    <MenuItem key={div} value={div}>{div}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button type="submit" fullWidth variant="contained">Complete Registration</Button>
                    </Box>
                </Card>
            </SignUpContainer>
        </AppTheme>
    );
}
