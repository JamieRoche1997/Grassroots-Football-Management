import { useNavigate, useLocation } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RateReviewIcon from '@mui/icons-material/RateReview';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PaymentIcon from '@mui/icons-material/Payment';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';

const mainListItems = [
  { text: 'Home', icon: <HomeRoundedIcon />, path: '/dashboard' },
  { text: 'Players', icon: <PeopleRoundedIcon />, path: '/players' },
  { text: 'Schedule', icon: <CalendarMonthIcon />, path: '/schedule' },
  { text: 'Feedback', icon: <RateReviewIcon />, path: '/feedback' },
  { text: 'Carpool', icon: <LocalTaxiIcon />, path: '/carpool' },
  { text: 'Payments', icon: <PaymentIcon />, path: '/payments' },
  { text: 'Team Statistics', icon: <AnalyticsRoundedIcon />, path: '/team' },
  { text: 'Player Statistics', icon: <DirectionsRunIcon />, path: '/player' },
];

const secondaryListItems = [
  { text: 'Settings', icon: <SettingsRoundedIcon />, path: '/settings' },
  { text: 'Help', icon: <HelpRoundedIcon />, path: '/help' },
];

export default function MenuContent() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      {/* Main List */}
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path} // Highlight the selected menu item
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Secondary List */}
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path} // Highlight the selected menu item
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
