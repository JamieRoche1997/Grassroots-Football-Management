import { requestNotificationPermission } from "./firebaseConfig";
import { updateUser, getUser } from "./authentication";
import { getAuthHeaders } from "./getAuthHeaders";

const url = 'https://grassroots-gateway-2au66zeb.nw.gateway.dev';

export const handleAllowNotifications = async (email: string) => {
  const token = await requestNotificationPermission();
  if (email) {
    await updateUser(email, { fcmToken: token ?? undefined });
    return { success: true };
  } else {
    throw new Error("Email is null or undefined");
  }
};

/**
 * Add player's fcmToken to the club.
 */
export const addPlayerFCMToken = async (
  email: string,
  clubName: string,
  ageGroup: string,
  division: string
): Promise<void> => {
  const headers = await getAuthHeaders();
  const user = await getUser(email);
  const fcmToken = user.fcmToken;

  const response = await fetch(`${url}/add-fcm-token`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, clubName, ageGroup, division, fcmToken }),
  });

  if (!response.ok) throw new Error('Failed to add player FCM token');
};

/**
 * Get unread notifications for a user.
 */
export const getUnreadNotifications = async (
  email: string,
  clubName: string,
  ageGroup: string,
  division: string
): Promise<{ id: string; title: string; body: string; read: boolean }[]> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${url}/notifications/unread`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, clubName, ageGroup, division }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to fetch notifications');
  }

  const data = await response.json();
  return data.notifications;
};

/**
 * Mark a single notification as read.
 */
export const markNotificationAsRead = async (
  email: string,
  clubName: string,
  ageGroup: string,
  division: string,
  notificationId: string
): Promise<void> => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${url}/notifications/mark-read`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, clubName, ageGroup, division, notificationId }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to mark notification as read');
  }
};


/**
 * Fetch all notifications (read and unread) for a player.
 */
export const getAllNotifications = async (
  email: string,
  clubName: string,
  ageGroup: string,
  division: string
): Promise<
  {
    id: string;
    title: string;
    body: string;
    read: boolean;
    timestamp: string;
    relatedId?: string;
    type?: string;
  }[]
> => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${url}/notifications/all`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, clubName, ageGroup, division }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch notifications');
  }

  const data = await response.json();
  return data.notifications;
};
