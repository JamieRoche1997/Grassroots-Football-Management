import { auth } from './firebaseConfig';

const BASE_URL = 'https://grassroots-gateway-2au66zeb.nw.gateway.dev'; 

/**
 * Send a message to the AI Assistant.
 * Grabs the current user's Firebase ID token and email,
 * then calls the Flask /query-ai endpoint.
 */
export const sendMessageToAI = async (message: string, clubName: string, ageGroup: string, division: string): Promise<string> => {
    const currentUser = auth.currentUser;
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Ensure it's two digits like '03'
    const currentMonth = `${year}-${month}`;

  if (!currentUser) {
    throw new Error('User is not authenticated');
  }

  const idToken = await currentUser.getIdToken();
  const userEmail = currentUser.email;
  if (!userEmail) {
    throw new Error('User email is missing');
  }

  const response = await fetch(`${BASE_URL}/query-ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.error || `Failed to communicate with AI assistant (status: ${response.status})`);
  }

  const data = await response.json();
  return data.reply; 
};
