import { auth } from "./firebaseConfig";
import { getAuthHeaders } from "./getAuthHeaders";

const BASE_URL = "https://grassroots-gateway-2au66zeb.nw.gateway.dev";
const AI_REQUEST_TIMEOUT = 30000; // 30 seconds timeout

/**
 * Send a message to the AI Assistant.
 * Grabs the current user's Firebase ID token and email,
 * then calls the Flask /query-ai endpoint.
 */
export const sendMessageToAI = async (
  message: string,
  clubName: string,
  ageGroup: string,
  division: string
): Promise<string> => {
  // Input validation
  if (!message || message.trim() === "") {
    throw new Error("Message cannot be empty");
  }
  
  if (!clubName || !ageGroup || !division) {
    throw new Error("Club information is required");
  }
  
  const currentUser = auth.currentUser;
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Ensure it's two digits like '03'
  const currentMonth = `${year}-${month}`;

  if (!currentUser) {
    throw new Error("User is not authenticated");
  }

  const idToken = await currentUser.getIdToken();
  const userEmail = currentUser.email;
  if (!userEmail) {
    throw new Error("User email is missing");
  }

  const headers = await getAuthHeaders();
  
  try {
    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), AI_REQUEST_TIMEOUT);
    });

    // Create the fetch promise
    const fetchPromise = fetch(`${BASE_URL}/query-ai`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message,
        token: idToken,
        email: userEmail,
        month: currentMonth,
        clubName: clubName,
        ageGroup: ageGroup,
        division: division,
      }),
    });

    // Race the fetch against the timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        errorBody.error ||
          `Failed to communicate with AI assistant (status: ${response.status} ${response.statusText})`
      );
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Error communicating with AI assistant:", error);
    if (error instanceof Error && error.message === "Request timed out") {
      throw new Error("AI assistant took too long to respond. Please try again later.");
    }
    throw error;
  }
};
