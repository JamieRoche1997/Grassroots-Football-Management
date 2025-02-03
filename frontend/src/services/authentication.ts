import { signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { checkUserExists, createUserInFirestore } from './user_management';

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
    // Step 1: Check if the user already exists
    const userExists = await checkUserExists(email);
    if (userExists) {
      throw new Error('A user with this email already exists. Please sign in.');
    }

    // Step 2: Create the user in Firebase Authentication
    const authResponse = await fetch(`${url}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json();
      throw new Error(errorData.error || 'Failed to register user in Firebase Authentication');
    }

    const authData = await authResponse.json();
    const firebaseUid = authData.firebase_uid;

    // Step 3: Create the user in Firestore
    await createUserInFirestore(firebaseUid, email, name, role);

    // Step 4: Log the user in after successful sign-up
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Sign-up error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Sign-up error');
    }
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
      // Step 3: Create a new user in Firestore
      await createUserInFirestore(user.uid, user.email, user.displayName || 'Google User', role);
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
    await signInWithPopup(auth, googleProvider);

    // Step 2: Log the user in after successful sign-up or sign-in
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
