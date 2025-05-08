import { getAuthHeaders } from "./getAuthHeaders";
import { updatePlayerStats } from "./player_stats";
import { getMembershipsForTeam } from "./membership";

const ratingsUrl = "https://grassroots-gateway-2au66zeb.nw.gateway.dev";

export interface MatchResult {
  homeScore: number;
  awayScore: number;
}

export interface MatchEvent {
  type: string;
  playerEmail: string;
  minute: string;
  subbedInEmail?: string;
}

/** ========== LINEUPS ========== */
export const saveLineups = async (
  matchId: string,
  clubName: string,
  ageGroup: string,
  division: string,
  homeTeamLineup: object,
  awayTeamLineup: object
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${ratingsUrl}/fixture/lineups`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      matchId,
      clubName,
      ageGroup,
      division,
      homeTeamLineup,
      awayTeamLineup,
    }),
  });
  if (!response.ok) throw new Error("Failed to save lineups");
};

export const getLineups = async (
  matchId: string,
  clubName: string,
  ageGroup: string,
  division: string
): Promise<{ homeTeamLineup: object; awayTeamLineup: object }> => {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${ratingsUrl}/fixture/lineups?matchId=${matchId}&clubName=${clubName}&ageGroup=${ageGroup}&division=${division}`,
    { headers }
  );
  if (!response.ok) throw new Error("Failed to fetch lineups");
  return response.json();
};

export const updateLineups = async (
  matchId: string,
  clubName: string,
  ageGroup: string,
  division: string,
  homeTeamLineup?: object,
  awayTeamLineup?: object
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${ratingsUrl}/fixture/lineups`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      matchId,
      clubName,
      ageGroup,
      division,
      homeTeamLineup,
      awayTeamLineup,
    }),
  });
  if (!response.ok) throw new Error("Failed to update lineups");
};

export const deleteLineups = async (
  matchId: string,
  clubName: string,
  ageGroup: string,
  division: string
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${ratingsUrl}/fixture/lineups`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ matchId, clubName, ageGroup, division }),
  });
  if (!response.ok) throw new Error("Failed to delete lineups");
};

/** ========== EVENTS ========== */
export const addEvent = async (
  matchId: string,
  clubName: string,
  ageGroup: string,
  division: string,
  event: object
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${ratingsUrl}/fixture/events`, {
    method: "POST",
    headers,
    body: JSON.stringify({ matchId, clubName, ageGroup, division, event }),
  });
  if (!response.ok) throw new Error("Failed to add event");
};

export const getEvents = async (
  matchId: string,
  clubName: string,
  ageGroup: string,
  division: string
): Promise<MatchEvent[]> => {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${ratingsUrl}/fixture/events?matchId=${matchId}&clubName=${clubName}&ageGroup=${ageGroup}&division=${division}`,
    { headers }
  );
  if (!response.ok) throw new Error("Failed to fetch events");
  return (await response.json()) as MatchEvent[]; // Enforce correct type
};

export const updateEvent = async (
  matchId: string,
  clubName: string,
  ageGroup: string,
  division: string,
  eventId: string,
  event: object
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${ratingsUrl}/fixture/events`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      matchId,
      clubName,
      ageGroup,
      division,
      eventId,
      event,
    }),
  });
  if (!response.ok) throw new Error("Failed to update event");
};

export const deleteEvent = async (
  matchId: string,
  clubName: string,
  ageGroup: string,
  division: string,
  eventId: string
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${ratingsUrl}/fixture/events`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ matchId, clubName, ageGroup, division, eventId }),
  });
  if (!response.ok) throw new Error("Failed to delete event");
};

/** ========== RESULTS ========== */
export const saveResult = async (
  matchId: string,
  clubName: string,
  ageGroup: string,
  division: string,
  homeScore: number,
  awayScore: number
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${ratingsUrl}/fixture/results`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      matchId,
      clubName,
      ageGroup,
      division,
      homeScore,
      awayScore,
    }),
  });
  if (!response.ok) throw new Error("Failed to save result");
};

export const getResult = async (
  matchId: string,
  clubName: string,
  ageGroup: string,
  division: string
): Promise<MatchResult> => {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${ratingsUrl}/fixture/results?matchId=${matchId}&clubName=${clubName}&ageGroup=${ageGroup}&division=${division}`,
    { headers }
  );
  if (!response.ok) throw new Error("Failed to fetch result");
  return (await response.json()) as MatchResult; // Enforce correct type
};

export const updateResult = async (
  matchId: string,
  clubName: string,
  ageGroup: string,
  division: string,
  homeScore?: number,
  awayScore?: number
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${ratingsUrl}/fixture/results`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      matchId,
      clubName,
      ageGroup,
      division,
      homeScore,
      awayScore,
    }),
  });
  if (!response.ok) throw new Error("Failed to update result");
};

export const deleteResult = async (
  matchId: string,
  clubName: string,
  ageGroup: string,
  division: string
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${ratingsUrl}/fixture/results`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ matchId, clubName, ageGroup, division }),
  });
  if (!response.ok) throw new Error("Failed to delete result");
};

/** ========== RATINGS ========== */
export interface PlayerRating {
  playerEmail: string;
  overallPerformance: number;
  [key: string]: string | number | boolean; // Still flexible for extras if needed
}

/**
 * Submit Player Rating
 * Creates or overwrites player rating for a specific match.
 */
export const submitPlayerRating = async (
  matchId: string,
  clubName: string,
  ageGroup: string,
  division: string,
  ratingData: PlayerRating
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${ratingsUrl}/fixture/player`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      matchId,
      clubName,
      ageGroup,
      division,
      ...ratingData,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to submit player rating: ${errorText}`);
  }
};

/**
 * Fetch Player Ratings for a Match
 */
export const fetchPlayerRatings = async (
  matchId: string,
  clubName: string,
  ageGroup: string,
  division: string
): Promise<PlayerRating[]> => {
  const query = new URLSearchParams({
    matchId,
    clubName,
    ageGroup,
    division,
  }).toString();

  const headers = await getAuthHeaders();

  const response = await fetch(`${ratingsUrl}/fixture/player?${query}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch player ratings");
  }

  return await response.json();
};

/**
 * Update Player Rating
 * Updates individual fields within an existing player rating.
 */
export const updatePlayerRating = async (
  matchId: string,
  clubName: string,
  ageGroup: string,
  division: string,
  updatedFields: PlayerRating
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${ratingsUrl}/fixture/player`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      matchId,
      clubName,
      ageGroup,
      division,
      ...updatedFields,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update player rating: ${errorText}`);
  }
};

/**
 * Delete Player Rating
 * Removes a player rating from a match.
 */
export const deletePlayerRating = async (
  matchId: string,
  clubName: string,
  ageGroup: string,
  division: string,
  playerEmail: string
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${ratingsUrl}/fixture/player`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({
      matchId,
      clubName,
      ageGroup,
      division,
      playerEmail,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete player rating: ${errorText}`);
  }
};

/** ========== PLAYER PARTICIPATION ========== */
export const recordPlayerParticipation = async (
  clubName: string,
  ageGroup: string,
  division: string,
  lineup: {[position: string]: string},
  isHomeGame: boolean
): Promise<void> => {
  try {
    // Get all team members to get names
    const memberships = await getMembershipsForTeam(clubName, ageGroup, division);
    const playerMap = memberships.reduce((map: {[email: string]: string}, player: {email: string, name: string}) => {
      if (player.email && player.name) {
        map[player.email] = player.name;
      }
      return map;
    }, {});
    
    // Process each player in the lineup
    const playersPromises = Object.values(lineup).map(async (playerEmail) => {
      if (!playerEmail) return;
      
      const playerName = playerMap[playerEmail] || playerEmail;
      
      // Update games played stat for each player in the lineup
      await updatePlayerStats(
        clubName,
        ageGroup,
        division,
        playerEmail,
        playerName,
        "gamesPlayed",
        isHomeGame
      );
    });
    
    await Promise.all(playersPromises);
  } catch (error) {
    console.error("Error recording player participation:", error);
    throw new Error("Failed to record player participation");
  }
};
