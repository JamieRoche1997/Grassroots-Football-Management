import { getAuth, onAuthStateChanged } from 'firebase/auth';

export interface UserProfileData {
  [key: string]: string | number | string[];
}

export const updateUserProfile = async (data: UserProfileData): Promise<void> => {
  const auth = getAuth();

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const token = await user.getIdToken();
        const response = await fetch('http://localhost:8081/user/update', {
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
