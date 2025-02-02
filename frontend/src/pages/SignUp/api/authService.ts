import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../../firebaseConfig';

export const signUp = async (
  email: string,
  password: string,
  name: string,
  role: string
): Promise<void> => {
  try {
    // Step 1: Send user details to the backend
    const response = await fetch('http://localhost:8080/signup', {
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