import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const faqData = [
  {
    question: "How can I register my team on the platform?",
    answer:
      "You can register your team by creating an account, navigating to the 'Teams' section, and clicking on 'Add New Team'. You'll need to provide basic team information, age group, and league details.",
  },
  {
    question: "Can I track player attendance and performance?",
    answer:
      "Yes, our platform offers comprehensive player tracking features. You can record attendance at training sessions and matches, track individual performance metrics, and generate development reports.",
  },
  {
    question: "How do I schedule matches and training sessions?",
    answer:
      "In the 'Calendar' section, you can add new training sessions or matches, set recurring events, assign venues, and send automatic notifications to players and parents.",
  },
  {
    question: "How does the carpooling feature work?",
    answer:
      "The carpooling feature allows team members to coordinate transportation to matches and training. Drivers can offer rides with specific departure locations, times, and available seats, while others can request spots in available vehicles.",
  },
  {
    question: "Can I manage team finances through the platform?",
    answer:
      "Yes, coaches can track membership fees, match fees, and other expenses through the payments section. The platform includes products management, a shop for players and parents, and transaction tracking.",
  },
  {
    question: "What formations can I use for team lineups?",
    answer:
      "Our platform supports multiple formations including 4-4-2, 4-3-3, 4-2-3-1, 5-4-1, and several others. You can select a formation and assign players to specific positions when creating lineups for matches.",
  },
];

export default function FAQ() {
  return (
    <Box
      id="faq"
      sx={{ display: "flex", flexDirection: "column", gap: 4, py: 8 }}
    >
      <div style={{ textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Frequently Asked Questions
        </Typography>
        <Typography>
          Find answers to the most common questions about our platform.
        </Typography>
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
