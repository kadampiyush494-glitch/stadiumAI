import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateGrowthRate, queueService } from './queueService';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getFirestore: vi.fn()
}));

describe('queueService', () => {
  it('calculates growth rate correctly', () => {
    // 50 current, 40 prev, 10 seconds interval = 1 person/sec
    const rate = calculateGrowthRate(50, 40, 10);
    expect(rate).toBe(1);
    
    expect(calculateGrowthRate(50, 40, 0)).toBe(0); // division by zero safety
  });

  it('predicts wait time accurately based on growth', () => {
    // Case 1: Positive growth
    const facilityInc = { waitTime: 10, currentCount: 50, prevCount: 40, statsInterval: 100 };
    // growth = 0.1
    // prediction = 10 * (1 + 0.1*10) = 20
    const predInc = queueService.predictWaitTime(facilityInc);
    expect(predInc).toBe(20);

    // Case 2: Negative growth (no increase)
    const facilityDec = { waitTime: 10, currentCount: 30, prevCount: 40, statsInterval: 100 };
    const predDec = queueService.predictWaitTime(facilityDec);
    expect(predDec).toBe(10);
  });

  it('ranks facilities correctly using getBestOptions', () => {
    const data = [
      { id: '1', name: 'Gate A', category: 'gate', waitTime: 30, density: 90, lat: 0.1, lng: 0.1 },
      { id: '2', name: 'Gate B', category: 'gate', waitTime: 5, density: 10, lat: 0.001, lng: 0.001 }
    ];
    const userLoc = { lat: 0, lng: 0 };
    
    const results = queueService.getBestOptions(data, userLoc);
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('2'); // Gate B is much closer and has shorter wait
  });

  it('returns empty array if inputs are missing', () => {
    expect(queueService.getBestOptions(null, {})).toEqual([]);
    expect(queueService.getBestOptions([], null)).toEqual([]);
  });
});
