import { getAuthHeaders } from "./getAuthHeaders";

const playerStatsUrl = "https://grassroots-gateway-2au66zeb.nw.gateway.dev";

export interface PlayerStats {
    playerEmail: string;
    playerName: string;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    gamesPlayed: number;
}

/** ========== UPDATE PLAYER STATS ========== */
/**
 * Updates player stats when a new event (goal, assist, yellow card, red card, or game played) occurs.
 */
export const updatePlayerStats = async (
    clubName: string,
    ageGroup: string,
    division: string,
    playerEmail: string,
    playerName: string,
    eventType: "goal" | "assist" | "yellowCard" | "redCard" | "gamesPlayed"
): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${playerStatsUrl}/stats/update`, {
        method: "POST",
        headers,
        body: JSON.stringify({ clubName, ageGroup, division, playerEmail, playerName, eventType }),
    });

    if (!response.ok) {
        throw new Error("Failed to update player stats");
    }
};

/** ========== GET PLAYER STATS (BY EMAIL) ========== */
/**
 * Fetches player statistics for a given player using their email.
 */
export const getPlayerStats = async (
    clubName: string,
    ageGroup: string,
    division: string,
    playerEmail: string
): Promise<PlayerStats> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
        `${playerStatsUrl}/stats/get?clubName=${clubName}&ageGroup=${ageGroup}&division=${division}&playerEmail=${playerEmail}`,
        { headers }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch player stats");
    }

    return (await response.json()) as PlayerStats;
};

/** ========== SEARCH PLAYER STATS (BY NAME) ========== */
/**
 * Searches for players based on a partial or full match of their name.
 */
export const searchPlayersByName = async (
    clubName: string,
    ageGroup: string,
    division: string,
    playerName: string
): Promise<PlayerStats[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
        `${playerStatsUrl}/stats/search?clubName=${clubName}&ageGroup=${ageGroup}&division=${division}&playerName=${playerName}`,
        { headers }
    );

    if (!response.ok) {
        throw new Error("Failed to search for players");
    }

    return (await response.json()) as PlayerStats[];
};

/** ========== LIST ALL PLAYER STATS ========== */
/**
 * Lists all player stats for a club, age group, and division.
 * Also returns the top performers in each category (e.g., top scorer, most yellow cards).
 */
export const listAllPlayerStats = async (
    clubName: string,
    ageGroup: string,
    division: string
): Promise<{
    leaderboard: {
        topScorer?: PlayerStats;
        mostAssists?: PlayerStats;
        mostYellowCards?: PlayerStats;
        mostRedCards?: PlayerStats;
    };
    allPlayers: PlayerStats[];
}> => {
    const headers = await getAuthHeaders();
    const response = await fetch(
        `${playerStatsUrl}/stats/list?clubName=${clubName}&ageGroup=${ageGroup}&division=${division}`,
        { headers }
    );

    if (!response.ok) {
        throw new Error("Failed to list all player stats");
    }

    return await response.json();
};
