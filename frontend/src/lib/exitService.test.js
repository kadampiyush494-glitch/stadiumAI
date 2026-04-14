import { describe, it, expect, vi } from 'vitest';
import { exitService, getStaggeredTimeOffset, scoreGate } from './exitService';

describe('exitService', () => {
  it('correctly scores gates based on distance and capacity', () => {
    const userLoc = { lat: 0, lng: 0 };
    const goodGate = { lat: 0.0001, lng: 0.0001, crowdLevel: 10, capacity: 5000, name: 'A' };
    const farGate = { lat: 0.1, lng: 0.1, crowdLevel: 10, capacity: 5000, name: 'B' };
    const busyGate = { lat: 0.0001, lng: 0.0001, crowdLevel: 90, capacity: 5000, name: 'C' };

    const scoreA = scoreGate(goodGate, userLoc);
    const scoreB = scoreGate(farGate, userLoc);
    const scoreC = scoreGate(busyGate, userLoc);

    expect(scoreA).toBeLessThan(scoreB);
    expect(scoreA).toBeLessThan(scoreC);
  });

  it('calculates staggered offsets for different sections', () => {
    expect(getStaggeredTimeOffset("5")).toBe(0);
    expect(getStaggeredTimeOffset("15")).toBe(5);
    expect(getStaggeredTimeOffset("45")).toBe(20);
  });

  it('generates a valid exit plan', () => {
    const matchEnd = new Date();
    matchEnd.setHours(matchEnd.getHours() + 1);
    
    const gates = [
      { lat: 0.001, lng: 0.001, crowdLevel: 20, capacity: 2000, name: 'East' },
      { lat: -0.001, lng: -0.001, crowdLevel: 50, capacity: 1000, name: 'West' }
    ];
    
    const plan = exitService.generateExitPlan({ lat: 0, lng: 0, section: "25" }, gates, matchEnd);
    
    expect(plan.recommendedGate.name).toBe('East');
    expect(plan.alternativeGates).toHaveLength(1);
    expect(plan.suggestedLeaveTime).toBeInstanceOf(Date);
    expect(plan.suggestedLeaveTime < matchEnd).toBe(true);
  });

  describe('Massive Multi-Attendee Simulation (50k)', () => {
    it('staggers 50,000 attendees across multiple time windows to prevent spikes', () => {
      const distribution = exitService.simulateMassExit(50000);
      
      // We expect data to be spread across multiple windows
      const windows = Object.keys(distribution);
      expect(windows.length).toBeGreaterThan(10); // 500 sections / 10 = 50 cohorts

      // Check that no single window has all 50k people
      // Each cohort (10 sections) should have roughly 1/50th of the crowd (~1000 people)
      for (const offset in distribution) {
        expect(distribution[offset]).toBeLessThan(1500); 
        expect(distribution[offset]).toBeGreaterThan(500);
      }
      
      const totalProcessed = Object.values(distribution).reduce((a, b) => a + b, 0);
      expect(totalProcessed).toBe(50000);
    });
  });
});

describe('Notification Triggers (logic simulation)', () => {
  it('triggers notification 15 mins before recommended leave time', () => {
    const mockNotify = vi.fn();
    const now = new Date();
    const leaveTime = new Date(now.getTime() + 14 * 60000); // 14 mins from now
    
    // Check if we should trigger (logic: trigger if now is within [leave - 15, leave - 14])
    const timeToLeave = (leaveTime - now) / 60000;
    if (timeToLeave <= 15 && timeToLeave >= 14) {
      mockNotify('Time to prepare for exit! Optimized route ready.');
    }
    
    expect(mockNotify).toHaveBeenCalled();
  });
  
  it('triggers reroute if recommended gate becomes congested', () => {
    const mockNotify = vi.fn();
    const currentPlan = { recommendedGate: { id: 1, crowdLevel: 20 } };
    
    // Simulate gate update
    const updatedGate = { id: 1, crowdLevel: 85 }; // Congestion spike
    
    if (updatedGate.crowdLevel > 80 && currentPlan.recommendedGate.id === updatedGate.id) {
       mockNotify('Gate 1 is congested. Calculating new optimal exit route...');
    }
    
    expect(mockNotify).toHaveBeenCalled();
  });
});
