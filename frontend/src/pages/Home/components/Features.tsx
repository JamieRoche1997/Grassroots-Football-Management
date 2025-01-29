import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { styled } from '@mui/material/styles';
import ScheduleImg from '../../../assets/Scheduling.jpg';
import Carpool from '../../../assets/Carpool.jpg';
import Payments from '../../../assets/Payments.jpg';
import Management from '../../../assets/Management.jpg';
import Performance from '../../../assets/Performance.jpg';
import AIBot from '../../../assets/AIBot.jpg';

const featuresData = [
    {
        img: ScheduleImg,
        tag: 'Scheduling',
        title: 'Smart scheduling tools for your team',
        description:
            'Manage matches, training sessions, and team availability effortlessly with our scheduling tools.',
    },
    {
        img: Carpool,
        tag: 'Carpooling',
        title: 'Organize carpools for team transportation',
        description:
            'Simplify transportation logistics with tools to coordinate carpools and track availability.',
    },
    {
        img: Payments,
        tag: 'Payment Collection',
        title: 'Streamline payment collection',
        description:
            'Collect membership fees, match expenses, and other payments securely through the platform.',
    },
    {
        img: Management,
        tag: 'Management',
        title: 'Comprehensive team management tools',
        description:
            'Manage team rosters, track player statistics, and handle administrative tasks efficiently.',
    },
    {
        img: Performance,
        tag: 'Performance Tracking',
        title: 'Track player performance and improvement',
        description:
            'Monitor player performance with detailed analytics and performance metrics to identify strengths and areas for improvement.',
    },
    {
        img: AIBot,
        tag: 'AI Chatbot',
        title: 'AI-powered assistant for team queries',
        description:
            'Utilize our AI chatbot for answering questions, providing insights, and streamlining team communication.',
    },
];

const StyledCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    height: '100%',
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
        backgroundColor: 'transparent',
        cursor: 'pointer',
    },
    '&:focus-visible': {
        outline: '3px solid',
        outlineColor: 'hsla(210, 98%, 48%, 0.5)',
        outlineOffset: '2px',
    },
}));

const StyledCardContent = styled(CardContent)({
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: 16,
    flexGrow: 1,
    '&:last-child': {
        paddingBottom: 16,
    },
});

const StyledTypography = styled(Typography)({
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
});

export default function Features() {
    const [filteredData, setFilteredData] = React.useState(featuresData);

    const handleFilter = (tag: string) => {
        if (tag === 'All features') {
            setFilteredData(featuresData);
        } else {
            setFilteredData(featuresData.filter((feature) => feature.tag === tag));
        }
    };

    return (
        <Box id="features" sx={{ display: 'flex', flexDirection: 'column', gap: 4, py: 8 }}>
            <div>
                <Typography variant="h4" gutterBottom>
                    Features
                </Typography>
                <Typography>Discover the key features that make our platform stand out.</Typography>
            </div>
            <Box
                sx={{
                    display: 'inline-flex',
                    flexDirection: 'row',
                    gap: 3,
                    overflow: 'auto',
                }}
            >
                <Chip onClick={() => handleFilter('All features')} size="medium" label="All features" />
                <Chip onClick={() => handleFilter('Scheduling')} size="medium" label="Scheduling" />
                <Chip onClick={() => handleFilter('Carpooling')} size="medium" label="Carpooling" />
                <Chip onClick={() => handleFilter('Payment Collection')} size="medium" label="Payment Collection" />
                <Chip onClick={() => handleFilter('Management')} size="medium" label="Management" />
                <Chip onClick={() => handleFilter('Performance Tracking')} size="medium" label="Performance Tracking" />
                <Chip onClick={() => handleFilter('AI Chatbot')} size="medium" label="AI Chatbot" />
            </Box>
            <Grid container spacing={4} columns={12}>
                {filteredData.map((feature, index) => (
                    <Grid key={index} size={{ xs: 12, md: 6 }}>
                        <StyledCard>
                            <CardMedia
                                component="img"
                                alt={feature.title}
                                image={feature.img}
                                sx={{
                                    aspectRatio: '16 / 9',
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                }}
                            />
                            <StyledCardContent>
                                <Typography gutterBottom variant="caption" component="div">
                                    {feature.tag}
                                </Typography>
                                <Typography gutterBottom variant="h6" component="div">
                                    {feature.title}
                                </Typography>
                                <StyledTypography variant="body2" color="text.secondary" gutterBottom>
                                    {feature.description}
                                </StyledTypography>
                            </StyledCardContent>
                        </StyledCard>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
