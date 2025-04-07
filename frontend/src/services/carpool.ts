import { getAuthHeaders } from "./getAuthHeaders";

const url = "https://grassroots-gateway-2au66zeb.nw.gateway.dev";

// Define TypeScript Interfaces for Ride Data
interface Ride {
  clubName: string;
  ageGroup: string;
  division: string;
  id: string;
  matchId: string;
  driverName: string;
  driverEmail: string;
  driverPhone: string;
  seats: number;
  location: string;
  pickup: string;
  passengers: string[];
  time: string;
  matchDetails: string;
}

interface RideRequest {
  userName: string;
  ride_id: string;
}

// Offer a Ride
export const offerRide = async (
  rideData: Ride
): Promise<{ message: string; ride_id: string }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${url}/carpool/offer`, {
      method: "POST",
      headers,
      body: JSON.stringify(rideData),
    });

    if (!response.ok) throw new Error("Failed to offer ride");

    return await response.json();
  } catch (error) {
    console.error("Error offering ride:", error);
    throw error;
  }
};

// Get Available Rides
export const getRides = async (
  clubName: string,
  ageGroup: string,
  division: string
): Promise<Ride[]> => {
  try {
    const queryParams = new URLSearchParams({
      clubName,
      ageGroup,
      division,
    }).toString();

    const headers = await getAuthHeaders();
    const response = await fetch(`${url}/carpool/rides?${queryParams}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) throw new Error("Failed to fetch rides");

    return await response.json();
  } catch (error) {
    console.error("Error fetching rides:", error);
    throw error;
  }
};

// Request a Ride
export const requestRide = async (
  requestData: RideRequest,
  clubName: string,
  ageGroup: string,
  division: string
): Promise<{ message: string }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${url}/carpool/request`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...requestData, clubName, ageGroup, division }),
    });

    if (!response.ok) throw new Error("Failed to request ride");

    return await response.json();
  } catch (error) {
    console.error("Error requesting ride:", error);
    throw error;
  }
};

// Cancel a Ride
export const cancelRide = async (
  rideId: string,
  clubName: string,
  ageGroup: string,
  division: string
): Promise<{ message: string }> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${url}/carpool/cancel`, {
      method: "POST", // Use POST instead of DELETE
      headers,
      body: JSON.stringify({ rideId, clubName, ageGroup, division }), // Pass rideId in the request body
    });

    if (!response.ok)
      throw new Error(`Failed to cancel ride. Status: ${response.status}`);

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error cancelling ride:", error);
    throw error;
  }
};
