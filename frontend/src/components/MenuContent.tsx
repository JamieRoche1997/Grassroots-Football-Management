import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Stack,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RateReviewIcon from '@mui/icons-material/RateReview';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PaymentIcon from '@mui/icons-material/Payment';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

// Define menu items dynamically
const menuItems = [
  {
    text: 'Dashboard',
    icon: <HomeRoundedIcon />,
    path: '/dashboard',
  },
  {
    text: 'Team',
    icon: <PeopleRoundedIcon />,
    subItems: [
      { text: 'Overview', icon: <HomeRoundedIcon />, path: '/team' },
      { text: 'Player Requests', icon: <AssignmentIndIcon />, path: '/team/requests' },
      { text: 'Players', icon: <GroupIcon />, path: '/team/players' },
      { text: 'Tactics', icon: <SportsSoccerIcon />, path: '/team/tactics' },
    ],
  },
  {
    text: 'Schedule',
    icon: <CalendarMonthIcon />,
    subItems: [
      { text: 'Overview', icon: <HomeRoundedIcon />, path: '/schedule' },
      { text: 'Matches', icon: <AssignmentIndIcon />, path: '/schedule/matches' },
      { text: 'Training', icon: <GroupIcon />, path: '/schedule/training' },
    ],
  },
  {
    text: 'Feedback',
    icon: <RateReviewIcon />,
    subItems: [
      { text: 'Overview', icon: <HomeRoundedIcon />, path: '/feedback' },
      { text: 'Player Ratings', icon: <AssignmentIndIcon />, path: '/feedback/ratings' },
      { text: 'Match Ratings', icon: <GroupIcon />, path: '/feedback/match-ratings' },
    ],
  },
  {
    text: 'Carpool',
    icon: <LocalTaxiIcon />,
    subItems: [
      { text: 'Overview', icon: <HomeRoundedIcon />, path: '/carpool' },
      { text: 'Drivers', icon: <AssignmentIndIcon />, path: '/carpool/drivers' },
      { text: 'Passengers', icon: <GroupIcon />, path: '/carpool/passengers' },
    ],
  },
  {
    text: 'Payments',
    icon: <PaymentIcon />,
    subItems: [
      { text: 'Overview', icon: <HomeRoundedIcon />, path: '/payments' },
      { text: 'Invoices', icon: <AssignmentIndIcon />, path: '/payments/invoices' },
      { text: 'Transactions', icon: <GroupIcon />, path: '/payments/transactions' },
    ],
  },
  {
    text: 'Statistics',
    icon: <AnalyticsRoundedIcon />,
    subItems: [
      { text: 'Overview', icon: <HomeRoundedIcon />, path: '/statistics' },
      { text: 'Player Stats', icon: <AssignmentIndIcon />, path: '/statistics/player-stats' },
      { text: 'Match Stats', icon: <GroupIcon />, path: '/statistics/match-stats' },
    ],
  },
];

export default function MenuContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSections, setOpenSections] = React.useState<{ [key: string]: boolean }>({});

  // Expand nested lists if the current path matches a sub-item
  React.useEffect(() => {
    const expandedSections: { [key: string]: boolean } = {};

    menuItems.forEach((item) => {
      if (item.subItems?.some((subItem) => location.pathname.startsWith(subItem.path))) {
        expandedSections[item.text] = true; // Expand the section with matching sub-items
      }
    });
    setOpenSections(expandedSections);
  }, [location.pathname]);

  const handleToggle = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const listItemButtonStyles = {
    px: 2,
    py: 1.5,
    borderRadius: 1,
    minHeight: 48,
    '&.Mui-selected': {
      bgcolor: 'rgba(25, 118, 210, 0.12)',
      color: 'primary.main',
      fontWeight: 'bold',
    },
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem disablePadding>
              <ListItemButton
                sx={listItemButtonStyles}
                onClick={() => (item.subItems ? handleToggle(item.text) : navigate(item.path!))}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {item.subItems && (openSections[item.text] ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>
            {item.subItems && (
              <Collapse in={openSections[item.text]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map((subItem, subIndex) => (
                    <ListItemButton
                      key={subIndex}
                      sx={listItemButtonStyles}
                      onClick={() => navigate(subItem.path)}
                      selected={location.pathname === subItem.path}
                    >
                      <ListItemIcon>{subItem.icon}</ListItemIcon>
                      <ListItemText primary={subItem.text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Stack>
  );
}
