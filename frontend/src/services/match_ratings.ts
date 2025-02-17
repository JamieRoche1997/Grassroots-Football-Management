const ratingsUrl = 'https://grassroots-gateway-2au66zeb.nw.gateway.dev';

interface MatchRating {
    matchId: string;
    overallQuality: number;
    refereeingPerformance: number;
    homeTeamPerformance: number;
    awayTeamPerformance: number;
    sportsmanship: number;
    crowdAtmosphere: number;
}

interface FetchMatchRatingsResponse {
    ratings: MatchRating[];
}

export const fetchMatchRatings = async (
    clubName: string,
    ageGroup: string,
    division: string
): Promise<FetchMatchRatingsResponse> => {
    try {
        const response = await fetch(
            `${ratingsUrl}/match/get-ratings?clubName=${encodeURIComponent(clubName)}&ageGroup=${encodeURIComponent(ageGroup)}&division=${encodeURIComponent(division)}`
        );

        console.log("Raw Response:", response);

        if (!response.ok) {
            throw new Error(`Failed to fetch match ratings, status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Parsed Response Data:", data);

        return data; // Ensure response is returned properly
    } catch (error) {
        console.error("Error fetching match ratings:", error);
        throw error;
    }
};


export const submitMatchRating = async (
    clubName: string,
    ageGroup: string,
    division: string,
    ratedBy: string,
    rating: MatchRating
): Promise<void> => {
    try {

        const response = await fetch(`${ratingsUrl}/match/submit-rating`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                clubName,
                ageGroup,
                division,
                ratedBy,
                ...rating,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to submit match rating");
        }
    } catch (error) {
        console.error("Error submitting match rating:", error);
        throw error;
    }
};
