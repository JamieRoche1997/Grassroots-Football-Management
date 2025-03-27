import { getAuthHeaders } from "./getAuthHeaders";
const profileServiceUrl = 'https://grassroots-gateway-2au66zeb.nw.gateway.dev';

/**
 * Create a new user profile in the Profile Service.
 * @param email - User's email.
 * @param name - User's name.
 * @param role - User's role (e.g., player, coach).
 * @returns Promise<void>
 */
export const createProfile = async (email: string, name: string, role: string, userRegistered: boolean, clubName?: string, ageGroup?: string, division?: string, position?: string): Promise<Partial<{
    email: string;
    name: string;
    dob: string;
    role: string;
    createdAt: string;
    lastLogin?: string;
    userRegistered: boolean;
    clubName?: string;
    ageGroup?: string;
    division?: string;
    position?: string;
}>> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${profileServiceUrl}/profile`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, name, role, userRegistered, clubName, ageGroup, division, position }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create profile');
    }
    return response.json();
};

/**
 * Retrieve user profile information from the Profile Service.
 * @param email - The user's email.
 * @returns A promise resolving to the user profile.
 */
export const getProfile = async (email: string): Promise<Partial<{ 
    email: string;
    name: string;
    dob: string;
    role: string;
    createdAt: string;
    lastLogin?: string;
    userRegistered?: boolean;
    clubName?: string;
    ageGroup?: string;
    division?: string;
    position?: string;
}>> => {
    const response = await fetch(`${profileServiceUrl}/profile/${encodeURIComponent(email)}`);
    if (!response.ok) {
        throw new Error('Failed to fetch profile');
    }
    return response.json();
};

/**
 * Update a user's profile dynamically.
 * @param email - The user's email.
 * @param updates - Object containing fields to update.
 * @returns Promise<void>
 */
export const updateProfile = async (
    email: string,
    updates: Record<string, unknown> 
): Promise<void> => {
    console.log("Update Profile email: ", email);
    console.log("Update Profile updates: ", updates);
    const headers = await getAuthHeaders();
    const response = await fetch(`${profileServiceUrl}/profile/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
    });

    console.log("Update Profile response: ", response);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
    }
};

/**
 * Delete a user's profile from the Profile Service.
 * @param email - The user's email.
 * @returns Promise<void>
 */
export const deleteProfile = async (email: string): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${profileServiceUrl}/profile/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete profile');
    }
};
