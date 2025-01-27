import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import { styled } from '@mui/material/styles';

const testimonialsData = [
  {
    name: 'John Doe',
    title: 'Team Manager',
    feedback:
      'This platform has revolutionized the way we manage our team. The scheduling and performance tracking features are outstanding!',
    avatar: 'https://picsum.photos/100/100?random=1',
    rating: 5,
  },
  {
    name: 'Sarah Johnson',
    title: 'Coach',
    feedback:
      'The feedback and performance tools have made a huge difference in how I train my players. Highly recommend!',
    avatar: 'https://picsum.photos/100/100?random=2',
    rating: 4.5,
  },
  {
    name: 'Michael Brown',
    title: 'Parent',
    feedback:
      'Carpooling and payment collection are so convenient. I don’t know how we managed before using this platform!',
    avatar: 'https://picsum.photos/100/100?random=3',
    rating: 5,
  },
];

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center', 
  textAlign: 'center',
  padding: theme.spacing(4),
  height: '100%',
  backgroundColor: (theme.vars || theme).palette.background.paper,
  boxShadow: theme.shadows[1],
  '&:hover': {
    boxShadow: theme.shadows[4],
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer',
  },
}));

export default function Testimonials() {
  return (
    <Box id="reviews" sx={{ display: 'flex', flexDirection: 'column', gap: 4, py: 8 }}>
      <div>
        <Typography variant="h4" gutterBottom>
          What Our Customers Say
        </Typography>
        <Typography>Hear from our happy customers and their experiences.</Typography>
      </div>
      <Grid container spacing={4}>
        {testimonialsData.map((testimonial, index) => (
          <Grid key={index} size={{ xs: 12, md: 4 }}>
            <StyledCard>
              <Avatar
                src={testimonial.avatar}
                alt={testimonial.name}
                sx={{
                  width: 80,
                  height: 80,
                  boxShadow: 1, 
                }}
              />
              <Typography variant="h6" gutterBottom>
                {testimonial.name}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {testimonial.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {testimonial.feedback}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Rating value={testimonial.rating} precision={0.5} readOnly size="large" />
              </Box>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
