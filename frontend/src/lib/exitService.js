import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Scoring logic for exit gates.
 * Lower score is better.
 * Formula: Score = gateDistance + gateCrowdLevel + (1 / capacity)
 */
export const scoreGate = (gate, userLocation) => {
  // Distance in meters (mocked)
  const dist = Math.sqrt(
    Math.pow(gate.lat - userLocation.lat, 2) + 
    Math.pow(gate.lng - userLocation.lng, 2)
  ) * 111000;
  
  const crowdFactor = gate.crowdLevel || 0; // 0-100
  const capacityFactor = gate.capacity > 0 ? (1 / gate.capacity) * 1000 : 100;

  return dist + (crowdFactor * 2) + capacityFactor;
};

/**
 * Staggered Exit Algorithm.
 * Divides sections into cohorts to prevent bottle-necks.
 */
export const getStaggeredTimeOffset = (section) => {
  const sectionNum = parseInt(section, 10);
  if (isNaN(sectionNum)) return 0;
  
  // Group sections into cohorts (e.g., 0-100, 101-200, etc.)
  // Every 5 sections get a 5-minute stagger window
  const cohort = Math.floor(sectionNum / 10);
  return cohort * 5; // 0 min, 5 min, 10 min, etc.
};

export const exitService = {
  /**
   * Generates a personalized exit plan.
   */
  generateExitPlan: (userSeat, gates, matchEndTime) => {
    if (!userSeat || !gates || gates.length === 0) return null;

    const userLoc = { lat: userSeat.lat, lng: userSeat.lng };
    const scoredGates = gates.map(g => ({
      ...g,
      finalScore: scoreGate(g, userLoc)
    })).sort((a, b) => a.finalScore - b.finalScore);

    const recommendedGate = scoredGates[0];
    const alternates = scoredGates.slice(1, 3);

    // Calculate staggered leave time
    const offsetMinutes = getStaggeredTimeOffset(userSeat.section);
    const baseLeaveTime = new Date(matchEndTime);
    baseLeaveTime.setMinutes(baseLeaveTime.getMinutes() - 10); // Default 10 min before FT
    
    const suggestedLeaveTime = new Date(baseLeaveTime.getTime() - (offsetMinutes * 60000));
    
    return {
      recommendedGate,
      suggestedLeaveTime,
      alternativeGates: alternates,
      estimatedClearTime: 12 + (recommendedGate.crowdLevel / 10) // Approx clear time in mins
    };
  },

  /**
   * Simulation for 50k attendees to test staggered distribution.
   */
  simulateMassExit: (attendeeCount = 50000) => {
    const sections = 500;
    const distribution = {};

    for (let i = 0; i < attendeeCount; i++) {
       const section = Math.floor(Math.random() * sections);
       const offset = getStaggeredTimeOffset(section);
       distribution[offset] = (distribution[offset] || 0) + 1;
    }
    return distribution;
  }
};
