import { signInWithEmailAndPassword } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from './firebaseConfig'; 

const url = 'https://grassroots-gateway-2au66zeb.nw.gateway.dev'

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
    const response = await fetch(`${url}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Sign-in failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw error;
  }
};

/**
 * Sign up a user with email, password, name and role.
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
    // Step 1: Send user details to the backend
    const response = await fetch(`${url}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role }),
    });

    if (!response.ok) {
      throw new Error('Failed to register user');
    }

    // Step 2: Log the user in after successful sign-up
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Sign-up error:', error);
    throw new Error('Sign-up failed. Please try again.');
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
