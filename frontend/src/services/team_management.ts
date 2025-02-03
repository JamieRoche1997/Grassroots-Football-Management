const url = 'https://grassroots-gateway-2au66zeb.nw.gateway.dev';

export interface ClubData {
    clubName: string;
    coachEmail: string;
    county: string;
    ageGroups: string;
    divisions: string;
}

export const createOrJoinClub = async (data: ClubData): Promise<void> => {
    try {
        const response = await fetch(`${url}/club/create-join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
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
export const fetchClubs = async (filters: { clubName?: string; county?: string; ageGroup?: string; division?: string }): Promise<any[]> => {
    try {
        const queryParams = new URLSearchParams(filters as any).toString();
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
export const applyToJoinClub = async (playerEmail: string, clubName: string): Promise<void> => {
    try {
        const response = await fetch(`${url}/club/join-request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerEmail, clubName }),
        });

        if (!response.ok) {
            throw new Error('Failed to apply to join club');
        }
    } catch (error) {
        console.error('Error applying to join club:', error);
        throw error;
    }
};
