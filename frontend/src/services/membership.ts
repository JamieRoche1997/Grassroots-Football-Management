import { getAuthHeaders } from "./getAuthHeaders";

const membershipServiceUrl =
  "https://grassroots-gateway-2au66zeb.nw.gateway.dev";

export const getMembershipInfo = async (
  clubName: string,
  ageGroup: string,
  division: string,
  email: string
) => {
  const queryParams = new URLSearchParams({
    clubName,
    ageGroup,
    division,
    email,
  }).toString();

  const headers = await getAuthHeaders();

  const response = await fetch(
    `${membershipServiceUrl}/membership?${queryParams}`,
    { headers }
  );

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch membership");
  }

  return response.json();
};

export const getMembershipsForTeam = async (
  clubName: string,
  ageGroup: string,
  division: string
) => {
  const queryParams = new URLSearchParams({
    clubName,
    ageGroup,
    division,
  }).toString();

  const headers = await getAuthHeaders();

  const response = await fetch(
    `${membershipServiceUrl}/membership/team?${queryParams}`,
    { headers }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch memberships");
  }

  return response.json();
};

export const createMembership = async (membership: {
  email: string;
  name: string;
  dob: string;
  uid: string;
  clubName: string;
  ageGroup: string;
  division: string;
  role: string;
  position: string;
  userRegistered: boolean;
}) => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${membershipServiceUrl}/membership`, {
    method: "POST",
    headers,
    body: JSON.stringify(membership),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create membership");
  }
};

export const updateMembership = async (membership: {
  clubName: string;
  ageGroup: string;
  division: string;
  email: string;
  name?: string;
  dob?: string;
  uid?: string;
  position?: string;
  role?: string;
  userRegistered?: boolean;
}) => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${membershipServiceUrl}/membership`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(membership),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update membership");
  }
};

export const deleteMembership = async (
  clubName: string,
  ageGroup: string,
  division: string,
  email: string
) => {
  const queryParams = new URLSearchParams({
    clubName,
    ageGroup,
    division,
    email,
  }).toString();
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${membershipServiceUrl}/membership?${queryParams}`,
    {
      method: "DELETE",
      headers,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete membership");
  }
};
