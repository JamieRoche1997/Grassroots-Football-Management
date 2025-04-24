import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { memo } from "react";

const contactData = [
  {
    icon: <EmailIcon fontSize="large" color="primary" />,
    title: "Email Us",
    description:
      "For general inquiries, reach us at support@grassrootsfootball.com.",
    link: "mailto:support@grassrootsfootball.com",
    ariaLabel: "Send email to support",
  },
  {
    icon: <PhoneIcon fontSize="large" color="primary" />,
    title: "Call Us",
    description: "Speak to our support team at +353 86 220 8215.",
    link: "tel:+353862208215",
    ariaLabel: "Call our support team",
  },
  {
    icon: <LocationOnIcon fontSize="large" color="primary" />,
    title: "Visit Us",
    description:
      "Briar Rose, 2 Mount Eaton, Carrignafoy, Cobh, Cork, Ireland, P24 W427.",
    link: "https://www.google.com/maps?q=P24+W427",
    ariaLabel: "View our location on Google Maps",
  },
];

const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  padding: theme.spacing(4),
  height: "100%",
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow: theme.shadows[4],
    backgroundColor: theme.palette.action.hover,
    cursor: "pointer",
    transform: "translateY(-5px)",
  },
  "&:focus-within": {
    boxShadow: theme.shadows[4],
    outline: `2px solid ${theme.palette.primary.main}`,
  },
}));

const ContactCard = memo(({ contact, index }: { contact: typeof contactData[0], index: number }) => {
  return (
    <Grid key={index} size={{ xs: 12, md: 4 }}>
      <a
        href={contact.link}
        style={{ textDecoration: "none", color: "inherit" }}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={contact.ariaLabel}
      >
        <StyledCard tabIndex={0}>
          {contact.icon}
          <Typography variant="h6" gutterBottom component="h3">
            {contact.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {contact.description}
          </Typography>
        </StyledCard>
      </a>
    </Grid>
  );
});

ContactCard.displayName = "ContactCard";

function Contact() {
  return (
    <Box
      id="contact"
      sx={{ display: "flex", flexDirection: "column", gap: 4, py: 8 }}
      component="section"
      aria-labelledby="contact-section-title"
    >
      <div style={{ textAlign: "center" }}>
        <Typography variant="h4" gutterBottom id="contact-section-title">
          Contact Us
        </Typography>
        <Typography variant="body1">
          Get in touch with us for more information or support.
        </Typography>
      </div>
      <Grid container spacing={4}>
        {contactData.map((contact, index) => (
          <ContactCard key={index} contact={contact} index={index} />
        ))}
      </Grid>
    </Box>
  );
}

export default memo(Contact);
