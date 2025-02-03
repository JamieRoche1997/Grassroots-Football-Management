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
