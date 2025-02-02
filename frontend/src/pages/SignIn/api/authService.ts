import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../../firebaseConfig'; 

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
    const response = await fetch('http://localhost:8080/signin', {
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