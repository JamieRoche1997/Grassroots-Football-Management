import React, { useState, useCallback, useEffect } from "react";
import { Stack, Menu, Checkbox, MenuItem } from "@mui/material";
import CustomDatePicker from "./CustomDatePicker";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import NavbarBreadcrumbs from "./NavbarBreadcrumbs";
import ColorModeIconDropdown from "./shared-theme/ColorModeIconDropdown";
import MenuButton from "./MenuButton";
import {
  getAllNotifications,
  markNotificationAsRead,
} from "../services/notifications";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<
    {
      id: string;
      title: string;
      body: string;
      read: boolean;
      type?: string;
      relatedId?: string;
    }[]
  >([]);
  const open = Boolean(anchorEl);

  const { user, clubName, ageGroup, division } = useAuth();

  const fetchNotifications = useCallback(async () => {
    try {
      if (!user?.email || !clubName || !ageGroup || !division) return;

      const fetched = await getAllNotifications(
        user.email,
        clubName,
        ageGroup,
        division
      );

      setNotifications(
        fetched.map((notification) => ({
          id: notification.id,
          title:
            notification.title?.split("📅 New ")[1]?.split(" ")[0]?.trim() ||
            "Notification",
          body:
            notification.body?.match(/Date:\s*([0-9-]+)/)?.[1] ||
            notification.body ||
            "",
          read: notification.read || false,
          type: notification.type,
          relatedId: notification.relatedId,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [user?.email, clubName, ageGroup, division]);

  // Fetch notifications on initial load
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    await fetchNotifications(); // Refresh again when menu opens
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (
    id: string,
    type?: string,
    relatedId?: string
  ) => {
    try {
      if (!user?.email || !clubName || !ageGroup || !division) return;

      await markNotificationAsRead(
        user.email,
        clubName,
        ageGroup,
        division,
        id
      );

      // Update just the read flag
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      if (type === "match" && relatedId) {
        navigate(`/schedule/matches/${relatedId}`);
      } else if (type === "training" && relatedId) {
        navigate(`/schedule/training/${relatedId}`);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: "none", md: "flex" },
        width: "100%",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        maxWidth: { sm: "100%", md: "1700px" },
        pt: 1.5,
      }}
      spacing={2}
    >
      <NavbarBreadcrumbs />
      <Stack direction="row" sx={{ gap: 1 }}>
        <CustomDatePicker />
        <MenuButton
          showBadge={notifications.some((n) => !n.read)}
          aria-label="Open notifications"
          onClick={handleClick}
        >
          <NotificationsRoundedIcon />
        </MenuButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          slotProps={{
            paper: {
              sx: {
                mt: 1.5,
                maxHeight: 300,
                width: 320,
              },
            },
          }}
        >
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <MenuItem
                key={n.id}
                onClick={() =>
                  !n.read && handleNotificationClick(n.id, n.type, n.relatedId)
                }
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Checkbox checked={n.read} disabled size="small" />
                <Stack>
                  <strong>{n.title}</strong>
                  <span style={{ fontSize: "0.85rem", color: "#666" }}>
                    {n.body}
                  </span>
                </Stack>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No notifications</MenuItem>
          )}
        </Menu>
        <ColorModeIconDropdown />
      </Stack>
    </Stack>
  );
}
