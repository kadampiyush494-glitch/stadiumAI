import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { sortOptions } from './scoreOptimizer';

/**
 * Calculates current growth rate of a queue.
 * @param {number} current - Current number of people/length.
 * @param {number} previous - Previous number of people/length.
 * @param {number} timeInterval - Time between recordings in seconds.
 * @returns {number} The growth rate per second.
 */
export const calculateGrowthRate = (current, previous, timeInterval) => {
  if (timeInterval <= 0) return 0;
  return (current - previous) / timeInterval;
};

/**
 * Service to manage real-time queue data and site-wide facility optimization.
 */
export const queueService = {
  /**
   * Listen to real-time updates for all queue nodes.
   * @param {string} category - Facility category (food, restroom, gate).
   * @param {Function} callback - Success callback receiving updated list.
   * @returns {Function} Unsubscribe function.
   */
  listenToQueues: (category, callback) => {
    const q = query(
      collection(db, 'queues'),
      // Potential filter by category if needed
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter(item => !category || item.category === category);
      
      callback(data);
    });
  },

  /**
   * Predicts future wait time based on growth rate.
   * @param {Object} facility - The facility object.
   * @param {number} facility.waitTime - Current wait time in minutes.
   * @param {number} facility.currentCount - Current count of people.
   * @param {number} facility.prevCount - Previous count of people.
   * @param {number} facility.statsInterval - Interval in seconds.
   * @returns {number} Predicted wait time in minutes.
   */
  predictWaitTime: (facility) => {
    const growthRate = calculateGrowthRate(
      facility.currentCount || 0,
      facility.prevCount || 0,
      facility.statsInterval || 300
    );
    // Rough prediction: if growth is positive, wait increases by factor
    const predictionFactor = growthRate > 0 ? 1 + (growthRate * 10) : 1;
    return facility.waitTime * predictionFactor;
  },

  /**
   * Returns the best recommended facilities sorted by optimization score.
   * @param {Array<Object>} queueData - The list of facilities with their current stats.
   * @param {Object} userLocation - User's current coordinates { lat, lng }.
   * @returns {Array<Object>} Sorted list of recommendations.
   */
  getBestOptions: (queueData, userLocation) => {
    if (!queueData || !userLocation) return [];

    const optionsWithDistance = queueData.map(node => {
      // Mock distance calculation - in production use haversine formula
      const dx = (node.lat - userLocation.lat) * 111000; // lat degrees to meters approx
      const dy = (node.lng - userLocation.lng) * 111000;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return {
        ...node,
        distance,
        // Ensure waitTime is predicted
        predictedWaitTime: queueService.predictWaitTime(node)
      };
    });

    // Score computation using our optimizer
    return sortOptions(optionsWithDistance.map(o => ({
      ...o,
      waitTime: o.predictedWaitTime,
      crowdDensity: o.density || 0
    })));
  }
};
