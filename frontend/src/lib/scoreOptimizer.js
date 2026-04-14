/**
 * Optimization constants for weighting scores.
 */
const WEIGHTS = {
  DISTANCE: 0.3,
  CROWD_DENSITY: 0.4,
  WAIT_TIME: 0.3
};

/**
 * Normalizes a value between 0 and 1 given a max threshold.
 * @param {number} value - The actual value.
 * @param {number} max - The maximum threshold for normalization.
 * @returns {number} Normalized value (0 to 1).
 */
const normalize = (value, max) => Math.min(value / max, 1);

/**
 * Computes a recommendation score for a facility. Lower score is better.
 * Score = (distance * 0.3) + (crowdDensity * 0.4) + (waitTime * 0.3)
 * 
 * @param {Object} params - The parameters for score calculation.
 * @param {number} params.distance - Distance in units (e.g., meters).
 * @param {number} params.crowdDensity - Density from 0 to 100.
 * @param {number} params.waitTime - Wait time in minutes.
 * @returns {number} The computed score.
 */
export const computeScore = ({ distance, crowdDensity, waitTime }) => {
  // Normalize values to 0-1 range for balanced weighting
  // Max thresholds: distance 1000m, density 100, wait 60m
  const nDistance = normalize(distance, 1000);
  const nDensity = normalize(crowdDensity, 100);
  const nWait = normalize(waitTime, 60);

  return (nDistance * WEIGHTS.DISTANCE) + 
         (nDensity * WEIGHTS.CROWD_DENSITY) + 
         (nWait * WEIGHTS.WAIT_TIME);
};

/**
 * Sorts facilities by their computed score in ascending order.
 * 
 * @param {Array<Object>} options - List of facility options.
 * @returns {Array<Object>} Sorted list of facilities with 'score' property attached.
 */
export const sortOptions = (options) => {
  return options
    .map(opt => ({ 
      ...opt, 
      score: computeScore(opt) 
    }))
    .sort((a, b) => a.score - b.score);
};
