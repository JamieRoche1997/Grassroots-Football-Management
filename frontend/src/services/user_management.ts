import { getAuth, onAuthStateChanged } from 'firebase/auth';

const url = 'https://grassroots-gateway-2au66zeb.nw.gateway.dev'

/**
 * Create a new user in Firestore.
 * @param uid - The Firebase UID of the user.
 * @param email - The user's email.
 * @param name - The user's name.
 * @param role - The user's role.
 * @returns A promise that resolves when the user is created.
 */
export const createUserInFirestore = async (
  uid: string,
  email: string,
  name: string,
  role: string,
  clubName: string = "",      
  ageGroup: string = "",      
  division: string = "",      
  userRegistered: boolean = false 
): Promise<void> => {
  try {
    const response = await fetch(`${url}/user/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid,
        email,
        name,
        role,
        clubName,
        ageGroup,
        division,
        userRegistered,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create user in Firestore");
    }
  } catch (error) {
    console.error("Error creating user in Firestore:", error);
    throw error;
  }
};


interface UserProfileData {
  [key: string]: string | number | string[] | boolean;
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

/**
 * Get the club name for a user.
 * @param email - The user's email.
 * @returns A promise resolving to the club name.
 */
export const getClubInfo = async (email: string): Promise<{ clubName: string; ageGroup: string; division: string; role: string, userRegistered: boolean }> => {
  try {
    const response = await fetch(`${url}/user/club-info?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch club info');
    }

    const data = await response.json();
    return {
      clubName: data.clubName || '',
      ageGroup: data.ageGroup || '',
      division: data.division || '',
      role: data.role || '',
      userRegistered: data.userRegistered || false,
    };
  } catch (error) {
    console.error('Error fetching club info:', error);
    throw new Error('Failed to fetch club info');
  }
};

export interface MatchEvent {
  type: 'goal' | 'assist' | 'injury' | 'yellowCard' | 'redCard';
  playerEmail: string;
  minute: string;
  description?: string;
}

export const updateUserMatchEvent = async (playerEmail: string, eventType: string): Promise<void> => {
  try {
    const response = await fetch(`${url}/user/update-match-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerEmail, type: eventType }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update ${eventType} for player`);
    }
  } catch (error) {
    console.error(`Error updating ${eventType} for player:`, error);
    throw error;
  }
};
