const url = 'https://grassroots-gateway-2au66zeb.nw.gateway.dev';

export interface ClubData {
  clubName: string;
  coachEmail: string;
  county: string;
  ageGroups: string | string[]; // Accept string or array during input
  divisions: string | string[]; // Accept string or array during input
}

export const createOrJoinClub = async (data: ClubData): Promise<void> => {
  try {
    // Convert to arrays if they are strings
    const formattedData = {
      ...data,
      ageGroups: Array.isArray(data.ageGroups) ? data.ageGroups : data.ageGroups.split(',').map(age => age.trim()),
      divisions: Array.isArray(data.divisions) ? data.divisions : data.divisions.split(',').map(div => div.trim()),
    };

    const response = await fetch(`${url}/club/create-join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedData),
    });

    if (!response.ok) {
      throw new Error('Failed to create or join club');
    }
  } catch (error) {
    console.error('Error creating or joining club:', error);
    throw error;
  }
};


/**
 * Fetch clubs based on search filters.
 * @param filters - The search filters for clubs.
 * @returns A list of clubs matching the search criteria.
 */
export interface Club {
  clubName: string;
  county: string;
  teams: { ageGroup: string; division: string }[];
}

export const fetchClubs = async (filters: { clubName?: string; county?: string; ageGroup?: string; division?: string }): Promise<Club[]> => {
  try {
    const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
    const response = await fetch(`${url}/club/search?${queryParams}`);

    if (!response.ok) {
      throw new Error('Failed to fetch clubs');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching clubs:', error);
    throw error;
  }
};


/**
 * Apply to join a club.
 * @param playerEmail - The player's email.
 * @param clubName - The name of the club the player wants to join.
 */
export const applyToJoinClub = async (
  name: string,
  playerEmail: string,
  clubName: string,
  ageGroup: string,
  division: string
): Promise<void> => {
  try {
    const response = await fetch(`${url}/club/join-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, playerEmail, clubName, ageGroup, division }),
    });

    if (!response.ok) {
      throw new Error('Failed to apply to join club');
    }
  } catch (error) {
    console.error('Error applying to join club:', error);
    throw error;
  }
};

export interface JoinRequest {
  name: string;
  playerEmail: string;
  clubName: string;
  status: string;
  requestedAt: string;
}

/**
 * Retrieve join requests for a club.
 * @param clubName - The name of the club.
 * @returns A list of join requests for the club.
 */
export const getJoinRequests = async (clubName: string, ageGroup: string, division: string): Promise<JoinRequest[]> => {
  const response = await fetch(`${url}/club/requests?clubName=${encodeURIComponent(clubName)}&ageGroup=${encodeURIComponent(ageGroup)}&division=${encodeURIComponent(division)}`);
  if (!response.ok) throw new Error('Failed to fetch join requests');
  return await response.json();
};

/**
 * Approve a join request.
 * @param playerEmail - The player's email.
 * @param clubName - The name of the club.
 */
export const approveJoinRequest = async (playerEmail: string, clubName: string, ageGroup: string, division: string): Promise<void> => {
  const response = await fetch(`${url}/club/requests/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerEmail, clubName, ageGroup, division }),
  });
  if (!response.ok) throw new Error('Failed to approve join request');
};

/**
 * Reject a join request.
 * @param playerEmail - The player's email.
 * @param clubName - The name of the club.
 */
export const rejectJoinRequest = async (playerEmail: string, clubName: string, ageGroup: string, division: string): Promise<void> => {
  const response = await fetch(`${url}/club/requests/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerEmail, clubName, ageGroup, division }),
  });
  if (!response.ok) throw new Error('Failed to reject join request');
};

export interface Player {
  email: string;
  name: string;
  dob: string;
  position: string;
  uid: string;
}

export const fetchPlayers = async (clubName: string, ageGroup: string, division: string): Promise<Player[]> => {
  try {
    const response = await fetch(
      `${url}/club/players?clubName=${encodeURIComponent(clubName)}&ageGroup=${encodeURIComponent(ageGroup)}&division=${encodeURIComponent(division)}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch players');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
};

/**
 * Remove players from the club's players list.
 * @param clubName - The club name.
 * @param ageGroup - The age group.
 * @param division - The division.
 * @param playerEmails - Array of player emails to remove.
 */
export const removePlayersFromClub = async (
  clubName: string,
  ageGroup: string,
  division: string,
  playerEmails: string[]
): Promise<void> => {
  try {
    const response = await fetch(`${url}/club/players/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clubName, ageGroup, division, playerEmails }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove players from the club.');
    }

    console.log(`Successfully removed players: ${playerEmails.join(', ')}`);
  } catch (error) {
    console.error('Error removing players:', error);
    throw error;
  }
};
