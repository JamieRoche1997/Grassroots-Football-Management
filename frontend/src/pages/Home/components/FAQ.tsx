import * as React from 'react';
import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqData = [
  {
    question: 'How do I sign up for the platform?',
    answer:
      'You can sign up by clicking on the "Sign Up" button at the top right corner of the page and filling in your details.',
  },
  {
    question: 'Is there a free trial available?',
    answer:
      'Yes, we offer a 14-day free trial with access to all features so you can explore the platform.',
  },
  {
    question: 'Can I cancel my subscription at any time?',
    answer:
      'Absolutely! You can cancel your subscription at any time in your account settings.',
  },
  {
    question: 'How secure is my data on the platform?',
    answer:
      'We take data security seriously. All your data is encrypted and securely stored in compliance with industry standards.',
  },
  {
    question: 'Does the platform support multiple teams?',
    answer:
      'Yes, our platform is designed to support multiple teams with features tailored for each team’s needs.',
  },
];

export default function FAQ() {
  return (
    <Box id="faq" sx={{ display: 'flex', flexDirection: 'column', gap: 4, py: 8 }}>
      <div style={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Frequently Asked Questions
        </Typography>
        <Typography>Find answers to the most common questions about our platform.</Typography>
      </div>
      <Box>
        {faqData.map((faq, index) => (
          <Accordion key={index}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}
