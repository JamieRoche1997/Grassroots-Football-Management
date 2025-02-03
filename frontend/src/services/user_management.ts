import { getAuth, onAuthStateChanged } from 'firebase/auth';

const url = 'https://grassroots-gateway-2au66zeb.nw.gateway.dev'

export interface UserProfileData {
  [key: string]: string | number | string[];
}

export const updateUserProfile = async (data: UserProfileData): Promise<void> => {
  const auth = getAuth();

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${url}/user/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`Failed to update user profile: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }
    } else {
      console.error('No user is signed in.');
      // Handle the case where no user is signed in.
    }
  });
};

/**
 * Check if a user with the given email already exists.
 * @param email - The user's email to check.
 * @returns A promise resolving to a boolean indicating whether the user exists.
 */
export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch(`${url}/user/check?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      throw new Error('Error checking user existence');
    }

    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw new Error('Failed to check user existence');
  }
};
