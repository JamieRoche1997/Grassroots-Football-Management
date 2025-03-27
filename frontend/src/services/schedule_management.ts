import { getAuthHeaders } from "./getAuthHeaders";

const url = 'https://grassroots-gateway-2au66zeb.nw.gateway.dev';

export interface FixtureData {
    matchId: string;  
    homeTeam: string;
    awayTeam: string;
    ageGroup: string;
    division: string;
    date: string;
    createdBy?: string;
    homeTeamLineup?: { [position: string]: string };
    awayTeamLineup?: { [position: string]: string };
}

/**
 * Add a new fixture.
 */
export const addFixture = async (fixture: FixtureData, clubName: string, ageGroup: string, division: string): Promise<void> => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${url}/schedule/fixture`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ ...fixture, clubName, ageGroup, division }),
        });
        if (!response.ok) {
            throw new Error('Failed to add fixture');
        }
    } catch (error) {
        console.error('Error adding fixture:', error);
        throw error;
    }
};

/**
 * Fetch fixtures for a specific month.
 */
export const fetchFixturesByMonth = async (month: string, clubName: string, ageGroup: string, division: string): Promise<FixtureData[]> => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(
            `${url}/schedule/fixture?month=${encodeURIComponent(month)}&clubName=${encodeURIComponent(clubName)}&ageGroup=${encodeURIComponent(ageGroup)}&division=${encodeURIComponent(division)}`,
            { headers }
        );
        if (!response.ok) {
            throw new Error('Failed to fetch fixtures');
        }
        console.log('response:', response);
        return await response.json();
    } catch (error) {
        console.error('Error fetching fixtures:', error);
        throw error;
    }
};

/**
 * Fetch a specific fixture by ID.
 */
export const getFixtureById = async (matchId: string, clubName: string, ageGroup: string, division: string): Promise<FixtureData> => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(
            `${url}/schedule/fixture/${matchId}?clubName=${encodeURIComponent(clubName)}&ageGroup=${encodeURIComponent(ageGroup)}&division=${encodeURIComponent(division)}`,
            { headers }
        );
        if (!response.ok) {
            throw new Error('Failed to fetch fixture by ID');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching fixture by ID:', error);
        throw error;
    }
};

/**
 * Fetch all fixtures (no date filter).
 */
export const fetchAllFixtures = async (clubName: string, ageGroup: string, division: string): Promise<FixtureData[]> => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(
            `${url}/schedule/fixtures?clubName=${encodeURIComponent(clubName)}&ageGroup=${encodeURIComponent(ageGroup)}&division=${encodeURIComponent(division)}`,
            { headers }
        );
        if (!response.ok) {
            throw new Error('Failed to fetch all fixtures');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching all fixtures:', error);
        throw error;
    }
};

/**
 * Update fixture details.
 */
export const updateFixture = async (fixture: FixtureData, clubName: string, ageGroup: string, division: string): Promise<void> => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${url}/schedule/fixture`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ ...fixture, clubName, ageGroup, division }),
        });
        if (!response.ok) {
            throw new Error('Failed to update fixture');
        }
    } catch (error) {
        console.error('Error updating fixture:', error);
        throw error;
    }
};

/**
 * Delete a fixture.
 */
export const deleteFixture = async (matchId: string, clubName: string, ageGroup: string, division: string): Promise<void> => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(
            `${url}/schedule/fixture?matchId=${encodeURIComponent(matchId)}&clubName=${encodeURIComponent(clubName)}&ageGroup=${encodeURIComponent(ageGroup)}&division=${encodeURIComponent(division)}`,
            { method: 'DELETE', headers }
        );
        if (!response.ok) {
            throw new Error('Failed to delete fixture');
        }
    } catch (error) {
        console.error('Error deleting fixture:', error);
        throw error;
    }
};

/**
 * Training Data Interface
 */
export interface TrainingData {
    trainingId: string;
    date: string;
    location: string;
    notes?: string;
    createdBy: string;
}

/**
 * Add training session.
 */
export const addTraining = async (training: TrainingData, clubName: string, ageGroup: string, division: string): Promise<void> => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${url}/schedule/training`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ ...training, clubName, ageGroup, division }),
        });
        if (!response.ok) {
            throw new Error('Failed to add training');
        }
    } catch (error) {
        console.error('Error adding training:', error);
        throw error;
    }
};

/**
 * Fetch trainings for a specific month.
 */
export const fetchTrainingsByMonth = async (month: string, clubName: string, ageGroup: string, division: string): Promise<TrainingData[]> => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(
            `${url}/schedule/training?month=${encodeURIComponent(month)}&clubName=${encodeURIComponent(clubName)}&ageGroup=${encodeURIComponent(ageGroup)}&division=${encodeURIComponent(division)}`,
            { headers }
        );
        if (!response.ok) {
            throw new Error('Failed to fetch trainings');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching trainings:', error);
        throw error;
    }
};

/**
 * Fetch a specific training by ID.
 */
export const getTrainingById = async (trainingId: string, clubName: string, ageGroup: string, division: string): Promise<TrainingData> => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(
            `${url}/schedule/training/${trainingId}?clubName=${encodeURIComponent(clubName)}&ageGroup=${encodeURIComponent(ageGroup)}&division=${encodeURIComponent(division)}`,
            { headers }
        );
        if (!response.ok) {
            throw new Error('Failed to fetch training by ID');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching training by ID:', error);
        throw error;
    }
};

/**
 * Fetch all trainings (no date filter).
 */
export const fetchAllTrainings = async (clubName: string, ageGroup: string, division: string): Promise<TrainingData[]> => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(
            `${url}/schedule/trainings?clubName=${encodeURIComponent(clubName)}&ageGroup=${encodeURIComponent(ageGroup)}&division=${encodeURIComponent(division)}`,
            { headers }
        );
        if (!response.ok) {
            throw new Error('Failed to fetch all trainings');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching all trainings:', error);
        throw error;
    }
};

/**
 * Update training session.
 */
export const updateTraining = async (training: TrainingData, clubName: string, ageGroup: string, division: string): Promise<void> => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${url}/schedule/training`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ ...training, clubName, ageGroup, division }),
        });
        if (!response.ok) {
            throw new Error('Failed to update training');
        }
    } catch (error) {
        console.error('Error updating training:', error);
        throw error;
    }
};

/**
 * Delete a training session.
 */
export const deleteTraining = async (trainingId: string, clubName: string, ageGroup: string, division: string): Promise<void> => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(
            `${url}/schedule/training?trainingId=${encodeURIComponent(trainingId)}&clubName=${encodeURIComponent(clubName)}&ageGroup=${encodeURIComponent(ageGroup)}&division=${encodeURIComponent(division)}`,
            { method: 'DELETE', headers }
        );
        if (!response.ok) {
            throw new Error('Failed to delete training');
        }
    } catch (error) {
        console.error('Error deleting training:', error);
        throw error;
    }
};

export const updateFixtureAvailability = async (
    matchId: string,
    email: string,
    clubName: string,
    ageGroup: string,
    division: string,
    available: boolean
  ) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${url}/schedule/fixture/availability`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, clubName, ageGroup, division, available, matchId }),
    });
    if (!res.ok) throw new Error("Failed to update availability");
  };
  

  export const updateTrainingAvailability = async (
    trainingId: string,
    email: string,
    clubName: string,
    ageGroup: string,
    division: string,
    available: boolean
  ) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${url}/schedule/training/availability`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, clubName, ageGroup, division, available, trainingId }),
    });
    if (!res.ok) throw new Error("Failed to update availability");
  };
  
  export const fetchFixtureAvailability = async (
    matchId: string,
    clubName: string,
    ageGroup: string,
    division: string
  ) => {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams({
      matchId,
      clubName,
      ageGroup,
      division,
    }).toString();
  
    const res = await fetch(`${url}/schedule/fixture/availability?${queryParams}`, {
      method: "GET",
      headers,
    });
  
    const data = await res.json();
    return data.availability;
  };
  
  export const fetchTrainingAvailability = async (
    trainingId: string,
    clubName: string,
    ageGroup: string,
    division: string
  ) => {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams({
      trainingId,
      clubName,
      ageGroup,
      division,
    }).toString();
  
    const res = await fetch(`${url}/schedule/training/availability?${queryParams}`, {
      method: "GET",
      headers,
    });
  
    const data = await res.json();
    return data.availability;
  };
  
  