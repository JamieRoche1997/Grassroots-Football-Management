import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const contactData = [
  {
    icon: <EmailIcon fontSize="large" color="primary" />,
    title: 'Email Us',
    description: 'For general inquiries, reach us at support@grassrootsfootball.com.',
  },
  {
    icon: <PhoneIcon fontSize="large" color="primary" />,
    title: 'Call Us',
    description: 'Speak to our support team at +353 86 220 8215.',
  },
  {
    icon: <LocationOnIcon fontSize="large" color="primary" />,
    title: 'Visit Us',
    description: 'Briar Rose, Mount Eaton, Cobh, Cork, Ireland.',
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

export default function Contact() {
  return (
    <Box id="contact" sx={{ display: 'flex', flexDirection: 'column', gap: 4, py: 8 }}>
      <div style={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="body1">
          Get in touch with us for more information or support.
        </Typography>
      </div>
      <Grid container spacing={4}>
        {contactData.map((contact, index) => (
          <Grid key={index} size={{ xs: 12, md: 4 }}>
            <StyledCard>
              {contact.icon}
              <Typography variant="h6" gutterBottom>
                {contact.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {contact.description}
              </Typography>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
