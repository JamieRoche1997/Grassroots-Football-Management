import { signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { createProfile, getProfile, updateProfile } from './profile';
import { updateMembership } from './membership';
import { getAuthHeaders } from './getAuthHeaders';

const url = 'https://grassroots-gateway-2au66zeb.nw.gateway.dev'
const googleProvider = new GoogleAuthProvider();

/**
 * Sign up a user with email, password, name, and role.
 * @param email - The user's email.
 * @param password - The user's password.
 * @param name - The user's name.
 * @param role - The user's role.
 */
export const signUp = async (
    email: string,
    password: string,
    name: string,
    role: string
): Promise<void> => {
    try {
        // Step 1: Check if the user exists
        const userExists = await checkUserExists(email);
        console.log("User exists: ", userExists);
        if (userExists) {
            // Fetch user document to check if they were pre-created by a coach
            const userData = await getProfile(email);
            console.log("Membership data: ", userData);

            if (!userData) {
                throw new Error('Failed to fetch user data.');
            }

            if (userData.userRegistered) {
                throw new Error('A user with this email already exists. Please sign in.');
            } else {

                // Step 2: Create the user in Firebase Authentication 
                const authResponse = await fetch(`${url}/auth/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, name, role }),
                });

                console.log("Auth Create response: ", authResponse);

                if (!authResponse.ok) {
                    const errorData = await authResponse.json();
                    throw new Error(errorData.error || 'Failed to register user in Firebase Authentication');
                }

                const authData = await authResponse.json();
                const uid = authData.uid;
                const clubName = userData.clubName || '';
                const ageGroup = userData.ageGroup || '';
                const division = userData.division || '';

                // Log the user in after successful sign-up
                await signInWithEmailAndPassword(auth, email, password);

                // Step 3: Update Firestore document to mark as registered
                await updateUser(email, { uid: uid });
                console.log("User updated");
                await updateProfile(email, { userRegistered: true });
                console.log("Membership updated");
                await updateMembership({
                    email,
                    uid: uid,
                    clubName: clubName,
                    ageGroup: ageGroup,
                    division: division,
                    dob: userData.dob || '',
                });

                return;
            }
        } else {

            console.log("User does not exist");
            // If user does NOT exist, create a new account normally
            const authResponse = await fetch(`${url}/auth/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, role }),
            });

            console.log("Auth Create response: ", authResponse);

            // Log the user in after successful sign-up
            await signInWithEmailAndPassword(auth, email, password);

            if (!authResponse.ok) {
                const errorData = await authResponse.json();
                throw new Error(errorData.error || 'Failed to register user in Firebase Authentication');
            }

            const authData = await authResponse.json();
            await createUser(email, authData.uid, role);
            console.log("Profile created");

            // Create the user in Firestore
            await createProfile(email, name, role, true);
        }
    } catch (error) {
        console.error('Sign-up error:', error);
        throw error instanceof Error ? new Error(error.message) : new Error('Sign-up error');
    }
};


/**
 * Sign up with Google.
 * @param role - The user's role.
 */
export const signUpWithGoogle = async (
    role: string
): Promise<void> => {
    try {
        // Step 1: Sign up with Google using Firebase client SDK
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        if (!user.email || !user.uid) {
            throw new Error('Google account did not provide necessary information.');
        }

        // Step 2: Check if the user already exists in Firestore
        const userExists = await checkUserExists(user.email);
        if (!userExists) {
            // Create the user in Firestore
            await createUser(user.email, user.uid, role);
            await createProfile(user.email, user.displayName || '', role, true);

        }

        localStorage.setItem('email', user.email);

    } catch (error) {
        console.error('Google Sign-Up error:', error);
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error('Google Sign-Up error');
        }
    }
};


/**
 * Sign in with Google.
 * @param role - The user's role.
 */
export const signInWithGoogle = async (): Promise<void> => {
    try {
        // Step 1: Sign in with Google using Firebase client SDK
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        if (user.email) {
            await updateProfile(user.email, { lastLogin: new Date().toISOString() });
        } else {
            throw new Error('Failed to retrieve user email from Google sign-in');
        }

    } catch (error) {
        console.error('Google Sign-In error:', error);
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error('Google Sign-In error');
        }
    }
};

/**
 * Sign in a user with email and password.
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns A promise that resolves to the user's ID token.
 */
export const signIn = async (email: string, password: string): Promise<string> => {
    try {
        // Step 1: Sign in the user with Firebase client SDK
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Step 2: Get the user's ID token
        const idToken = await user.getIdToken();
        return idToken;
    } catch (error) {
        console.error('Sign-in error:', error);
        throw error;
    }
};

interface VerifyIdTokenResponse {
    // Define the expected structure of the response
    success: boolean;
    message?: string;
    // Add other fields as necessary
}

export const verifyIdToken = async (idToken: string): Promise<VerifyIdTokenResponse> => {
    try {
        const response = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Sign-in failed');
        }

        const verifiedData = await response.json();

        // Update lastLogin in Profile Service
        await updateProfile(verifiedData.email, { lastLogin: new Date().toISOString() });

        return verifiedData;
    } catch (error) {
        console.error('Error verifying ID token:', error);
        throw error;
    }
};


/**
 * Log out the user from Firebase.
 * @returns A promise that resolves when the user is logged out.
 */
export const logoutUser = async (): Promise<void> => {
    try {
        const user = auth.currentUser;

        if (user) {
            // Sign out from Firebase
            await signOut(auth);
        } else {
            console.warn('No user is currently signed in.');
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
};

export const checkUserExists = async (email: string): Promise<boolean> => {
    const response = await fetch(`${url}/auth/${encodeURIComponent(email)}`);

    if (response.status === 404) {
        return false;
    } else if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`checkUserExists failed for ${email}:`, errorData.error || 'Unknown error');
        throw new Error(errorData.error || 'Failed to check user existence');
    }

    return true;
};


export const updateUser = async (email: string, updates: Partial<{
    uid: string;
}>): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${url}/auth/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
    }
};

export const createUser = async (email: string, uid: string, role: string): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${url}/user`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, uid, role }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
    }
};

export const getUser = async (email: string): Promise<Partial<{ 
    email: string;
    uid: string;
}>> => {
    const response = await fetch(`${url}/auth/${encodeURIComponent(email)}`);
    if (!response.ok) {
        throw new Error('Failed to fetch user');
    }
    return response.json();
};