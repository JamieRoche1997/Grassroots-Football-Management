interface Formation {
    name: string;
    defense: number;
    midfield: number[];
    forward: number;
  }
  
  export const formations: Formation[] = [
    { name: "3-5-2", defense: 3, midfield: [5], forward: 2 },
    { name: "3-4-1-2", defense: 3, midfield: [4, 1], forward: 2 },
    { name: "4-4-2", defense: 4, midfield: [4], forward: 2 },
    { name: "4-3-3", defense: 4, midfield: [3], forward: 3 },
    { name: "3-4-3", defense: 3, midfield: [4], forward: 3 }
    // Add more formations here as needed
  ];
  
  /**
   * Generate positions for a formation based on defense, midfield, and forwards.
   */
  export function generatePositions(defense: number, midfield: number[], forward: number): string[] {
    const positions: string[] = ["GK"]; // Always include goalkeeper
    positions.push(...Array(defense).fill("CB")); // Defense as center backs (adjust if needed)
  
    midfield.forEach((midline) => {
      if (midline === 5) positions.push("LM", "CM", "CDM", "CM", "RM"); // 5 midfielders
      else if (midline === 4) positions.push("LM", "CM", "CM", "RM");    // 4 midfielders
      else if (midline === 3) positions.push("CDM", "CM", "CAM");        // 3 midfielders
      else if (midline === 1) positions.push("CAM");                     // 1 midfielder
    });
  
    positions.push(...Array(forward).fill("ST")); // Forwards as strikers (ST)
    return positions;
  }
  