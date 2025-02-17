const ratingsUrl = 'https://grassroots-gateway-2au66zeb.nw.gateway.dev';

interface PlayerRating {
    playerEmail: string;
    skill: number;
    teamwork: number;
    attitude: number;
}

interface FetchPlayerRatingsResponse {
    ratings: PlayerRating[];
}

export const fetchPlayerRatings = async (
    clubName: string,
    ageGroup: string,
    division: string
): Promise<FetchPlayerRatingsResponse> => {
    try {
        const response = await fetch(
            `${ratingsUrl}/player/get-ratings?clubName=${encodeURIComponent(clubName)}&ageGroup=${encodeURIComponent(ageGroup)}&division=${encodeURIComponent(division)}`
        );

        console.log("Raw Response:", response);

        if (!response.ok) {
            throw new Error(`Failed to fetch player ratings, status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Parsed Response Data:", data);

        return data; // Ensure response is returned properly
    } catch (error) {
        console.error("Error fetching player ratings:", error);
        throw error;
    }
};


interface Rating {
    overallPerformance: number;
    passingAccuracy: number;
    shootingAccuracy: number;
    defensiveWorkRate: number;
    attackingContributions: number;
    teamwork: number;
    skill: number;
    attitude: number;
}

export const submitPlayerRating = async (playerEmail: string, playerName: string, clubName: string, ageGroup: string, division: string, matchId: string, ratedBy: string, rating: Rating): Promise<void> => {
    try {
        console.log("Submitting rating:", {
            playerEmail,
            playerName,
            clubName,
            ageGroup,
            division,
            matchId,
            ratedBy,
            ...rating,
        });

        const response = await fetch(`${ratingsUrl}/player/submit-rating`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                playerEmail,
                playerName,
                clubName,
                ageGroup,
                division,
                matchId,
                ratedBy,
                ...rating,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to submit player rating");
        }
    } catch (error) {
        console.error("Error submitting player rating:", error);
        throw error;
    }
};
