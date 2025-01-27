import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { styled } from '@mui/material/styles';

import BasicPlanImg from '../../../assets/Basic.jpg';
import ProPlanImg from '../../../assets/Pro.jpg';
import EnterprisePlanImg from '../../../assets/Enterprise.jpg';

const pricingData = [
  {
    img: BasicPlanImg,
    title: 'Basic Plan',
    price: 'Free',
    description:
      'Perfect for small teams starting their journey. Includes scheduling, carpooling, and basic reporting.',
  },
  {
    img: ProPlanImg,
    title: 'Pro Plan',
    price: '€20/month',
    description:
      'Designed for growing teams. Includes all basic features plus performance tracking and coach feedback.',
  },
  {
    img: EnterprisePlanImg,
    title: 'Enterprise Plan',
    price: '€40/month',
    description:
      'For organizations managing multiple teams. Includes advanced analytics, AI chatbot, and custom integrations.',
  },
];

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  height: '100%',
  backgroundColor: (theme.vars || theme).palette.background.paper,
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

export default function Pricing() {
  return (
    <Box id="pricing" sx={{ display: 'flex', flexDirection: 'column', gap: 4, py: 8 }}>
      <div>
        <Typography variant="h4" gutterBottom>
          Pricing
        </Typography>
        <Typography>Flexible pricing plans to meet your needs.</Typography>
      </div>
      <Grid container spacing={4} columns={12}>
        {pricingData.map((plan, index) => (
          <Grid key={index} size={{ xs: 12, md: 4 }}>
            <StyledCard>
              <CardMedia
                component="img"
                alt={plan.title}
                image={plan.img}
                sx={{
                  aspectRatio: '16 / 9',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              />
              <StyledCardContent>
                <Typography variant="h6" gutterBottom>
                  {plan.title}
                </Typography>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  {plan.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {plan.description}
                </Typography>
              </StyledCardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
