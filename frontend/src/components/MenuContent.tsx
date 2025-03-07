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
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PaymentIcon from '@mui/icons-material/Payment';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import StarIcon from '@mui/icons-material/Star';
import EuroIcon from '@mui/icons-material/Euro';
import ReceiptIcon from '@mui/icons-material/Receipt';

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
      { text: 'Squad', icon: <GroupIcon />, path: '/team/squad' },
      { text: 'Lineups', icon: <SportsSoccerIcon />, path: '/team/lineups' },
      { text: 'Results', icon: <SportsScoreIcon />, path: '/team/results' },
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
    text: 'Ratings',
    icon: <StarIcon />,
    subItems: [
      { text: 'Player Ratings', icon: <AssignmentIndIcon />, path: '/ratings/players' },
    ],
  },
  {
    text: 'Carpool',
    icon: <LocalTaxiIcon />,
    subItems: [
      { text: 'Overview', icon: <HomeRoundedIcon />, path: '/carpool' },
      { text: 'Drivers', icon: <AssignmentIndIcon />, path: '/carpool/drivers' },
    ],
  },
  {
    text: 'Payments',
    icon: <PaymentIcon />,
    subItems: [
      { text: 'Overview', icon: <HomeRoundedIcon />, path: '/payments' },
      { text: 'Products', icon: <AssignmentIndIcon />, path: '/payments/products' },
      { text: 'Shop', icon: <EuroIcon />, path: '/payments/shop' },
      { text: 'Transactions', icon: <ReceiptIcon />, path: '/payments/transactions' },
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
