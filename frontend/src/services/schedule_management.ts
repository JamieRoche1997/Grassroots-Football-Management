const url = 'https://grassroots-gateway-2au66zeb.nw.gateway.dev';

export interface FixtureData {
    homeTeam: string;
    awayTeam: string;
    ageGroup: string;
    division: string;
    date: string;
    createdBy: string;
}

export const addFixture = async (fixture: FixtureData): Promise<void> => {
    try {
        const response = await fetch(`${url}/schedule/add-fixture`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fixture),
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
* Fetch matches for a specific month.
*/
export interface MatchData {
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    homeScore?: number;
    awayScore?: number;
}

export const fetchMatches = async (month: string, clubName: string, ageGroup: string, division: string): Promise<MatchData[]> => {
    try {
      const response = await fetch(
        `${url}/schedule/matches?month=${encodeURIComponent(month)}&clubName=${encodeURIComponent(clubName)}&ageGroup=${encodeURIComponent(ageGroup)}&division=${encodeURIComponent(division)}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw error;
    }
  };
  

/**
* Update the result of a fixture.
*/
export const updateFixtureResult = async (matchId: string, homeScore: number, awayScore: number): Promise<void> => {
    try {
        const response = await fetch(`${url}/schedule/update-result`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matchId, homeScore, awayScore }),
        });
        if (!response.ok) {
            throw new Error('Failed to update match result');
        }
    } catch (error) {
        console.error('Error updating match result:', error);
        throw error;
    }
};

export interface TrainingData {
  trainingId: string;
  ageGroup: string;
  division: string;
  date: string;
  location: string;
  notes?: string;
  createdBy: string;
}

export const fetchTrainings = async (month: string, clubName: string, ageGroup: string, division: string): Promise<TrainingData[]> => {
  try {
    const response = await fetch(
      `${url}/schedule/trainings?month=${encodeURIComponent(month)}&clubName=${encodeURIComponent(clubName)}&ageGroup=${encodeURIComponent(ageGroup)}&division=${encodeURIComponent(division)}`
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

export const addTraining = async (training: TrainingData): Promise<void> => {
  try {
    const response = await fetch(`${url}/schedule/add-training`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(training),
    });
    if (!response.ok) {
      throw new Error('Failed to add training');
    }
  } catch (error) {
    console.error('Error adding training:', error);
    throw error;
  }
};

export interface TacticsData {
  matchId: string;
  formation: string;
  assignedPlayers: { [position: string]: string };
  strategyNotes?: string;
}

export const saveTactics = async (tactics: TacticsData): Promise<void> => {
  try {
      const response = await fetch(`${url}/schedule/save-tactics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tactics),
      });

      if (!response.ok) {
          throw new Error('Failed to save tactics');
      }
  } catch (error) {
      console.error('Error saving tactics:', error);
      throw error;
  }
};

