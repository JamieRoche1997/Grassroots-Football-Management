import { auth } from "./firebaseConfig";

/**
 * Generates Authorization headers with the Firebase ID token.
 * @throws Error if user is not authenticated or token cannot be retrieved
 */
export const getAuthHeaders = async (): Promise<HeadersInit> => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated - please log in again");

  try {
    const idToken = await user.getIdToken();
    
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    };
  } catch (error) {
    console.error("Failed to retrieve authentication token:", error);
    throw new Error(
      "Authentication token could not be retrieved. Please log out and log in again."
    );
  }
};
