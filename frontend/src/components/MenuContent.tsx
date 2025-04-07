import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Stack,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import PaymentIcon from "@mui/icons-material/Payment";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import StarIcon from "@mui/icons-material/Star";
import EuroIcon from "@mui/icons-material/Euro";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useAuth } from "../hooks/useAuth"; // Import useAuth to get the user role

// Define menu items dynamically
const allMenuItems = [
  {
    text: "Dashboard",
    icon: <HomeRoundedIcon />,
    path: "/dashboard",
    roles: ["coach", "player", "parent"], // All roles can access
  },
  {
    text: "Team",
    icon: <PeopleRoundedIcon />,
    roles: ["coach", "player", "parent"], // All can access the team, but sub-items are restricted
    subItems: [
      {
        text: "player Requests",
        icon: <AssignmentIndIcon />,
        path: "/team/requests",
        roles: ["coach"],
      },
      {
        text: "Squad",
        icon: <GroupIcon />,
        path: "/team/squad",
        roles: ["coach", "player", "parent"],
      },
      {
        text: "Lineups",
        icon: <SportsSoccerIcon />,
        path: "/team/lineups",
        roles: ["coach"],
      },
      {
        text: "Results",
        icon: <SportsScoreIcon />,
        path: "/team/results",
        roles: ["coach", "player", "parent"],
      },
    ],
  },
  {
    text: "Schedule",
    icon: <CalendarMonthIcon />,
    roles: ["coach", "player", "parent"],
    subItems: [
      {
        text: "Overview",
        icon: <HomeRoundedIcon />,
        path: "/schedule",
        roles: ["coach", "player", "parent"],
      },
      {
        text: "Matches",
        icon: <AssignmentIndIcon />,
        path: "/schedule/matches",
        roles: ["coach", "player", "parent"],
      },
      {
        text: "Training",
        icon: <GroupIcon />,
        path: "/schedule/training",
        roles: ["coach", "player", "parent"],
      },
    ],
  },
  {
    text: "Ratings",
    icon: <StarIcon />,
    roles: ["coach", "player", "parent"],
    subItems: [
      {
        text: "player Ratings",
        icon: <AssignmentIndIcon />,
        path: "/ratings/players",
        roles: ["coach", "player", "parent"],
      },
    ],
  },
  {
    text: "Carpool",
    icon: <LocalTaxiIcon />,
    roles: ["coach", "player", "parent"],
    subItems: [
      {
        text: "Overview",
        icon: <HomeRoundedIcon />,
        path: "/carpool",
        roles: ["coach", "player", "parent"],
      },
      {
        text: "Drivers",
        icon: <AssignmentIndIcon />,
        path: "/carpool/drivers",
        roles: ["coach", "player", "parent"],
      },
    ],
  },
  {
    text: "Payments",
    icon: <PaymentIcon />,
    roles: ["coach", "player", "parent"], // Only coaches can access Payments
    subItems: [
      {
        text: "Overview",
        icon: <HomeRoundedIcon />,
        path: "/payments",
        roles: ["coach"],
      },
      {
        text: "Products",
        icon: <AssignmentIndIcon />,
        path: "/payments/products",
        roles: ["coach"],
      },
      {
        text: "Shop",
        icon: <EuroIcon />,
        path: "/payments/shop",
        roles: ["coach", "player", "parent"],
      },
      {
        text: "Transactions",
        icon: <ReceiptIcon />,
        path: "/payments/transactions",
        roles: ["coach"],
      },
    ],
  },
];

export default function MenuContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const [openSections, setOpenSections] = React.useState<{
    [key: string]: boolean;
  }>({});

  // Capitalize words function
  const capitalizeWords = (text: string) => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalise first letter of each word
  };

  // Function to filter menu items based on user role
  const getFilteredMenuItems = () => {
    if (!role) return [];
    return allMenuItems
      .filter((item) => item.roles.includes(role)) // Filter top-level items
      .map((item) => ({
        ...item,
        subItems: item.subItems?.filter((subItem) =>
          subItem.roles.includes(role)
        ), // Filter sub-items
      }));
  };

  const filteredMenuItems = getFilteredMenuItems();

  React.useEffect(() => {
    const expandedSections: { [key: string]: boolean } = {};
    filteredMenuItems.forEach((item) => {
      if (
        item.subItems?.some((subItem) =>
          location.pathname.startsWith(subItem.path)
        )
      ) {
        expandedSections[item.text] = true; // Expand the section with matching sub-items
      }
    });
    setOpenSections(expandedSections);
  }, [location.pathname, role]);

  const handleToggle = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {filteredMenuItems.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem disablePadding>
              <ListItemButton
                sx={{ px: 2, py: 1.5, borderRadius: 1, minHeight: 48 }}
                onClick={() =>
                  item.subItems ? handleToggle(item.text) : navigate(item.path!)
                }
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={capitalizeWords(item.text)} />{" "}
                {/* Ensure capitalization */}
                {item.subItems &&
                  (openSections[item.text] ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>
            {item.subItems && (
              <Collapse
                in={openSections[item.text]}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {item.subItems.map((subItem, subIndex) => (
                    <ListItemButton
                      key={subIndex}
                      onClick={() => navigate(subItem.path)}
                      selected={location.pathname === subItem.path}
                    >
                      <ListItemIcon>{subItem.icon}</ListItemIcon>
                      <ListItemText
                        primary={capitalizeWords(subItem.text)}
                      />{" "}
                      {/* Ensure capitalization */}
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
