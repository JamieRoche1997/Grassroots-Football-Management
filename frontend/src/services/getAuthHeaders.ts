import { auth } from './firebaseConfig';

/**
 * Generates Authorization headers with the Firebase ID token.
 */
export const getAuthHeaders = async (): Promise<HeadersInit> => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const idToken = await user.getIdToken();

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
    };
};
