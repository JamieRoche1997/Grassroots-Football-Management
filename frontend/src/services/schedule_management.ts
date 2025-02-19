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
    events?: MatchEvent[];
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
  
  export interface MatchEvent {
    type: 'goal' | 'assist' | 'injury' | 'yellowCard' | 'redCard' | 'substitution';
    playerEmail: string; 
    minute: string;
    subbedInEmail?: string; 
  }
  
  

/**
* Update the result of a fixture.
*/
export const updateFixtureResult = async (matchId: string, homeScore: number, awayScore: number, events: MatchEvent[]): Promise<void> => {
  try {
      const response = await fetch(`${url}/schedule/update-result`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matchId, homeScore, awayScore, events }),
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

export interface MatchData {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  formation: string;
  strategyNotes?: string;
  homeTeamLineup?: { [position: string]: string };
  awayTeamLineup?: { [position: string]: string };
}


export const saveMatchData = async (matchData: MatchData): Promise<void> => {
  try {
    const response = await fetch(`${url}/schedule/save-match-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save match data: ${errorText}`);
    }

    console.log('Match data saved successfully!');
  } catch (error) {
    console.error('Error saving match data:', error);
    throw error;
  }
};

