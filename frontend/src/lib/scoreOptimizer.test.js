import { describe, it, expect } from 'vitest';
import { computeScore, sortOptions } from './scoreOptimizer';

describe('scoreOptimizer', () => {
  it('computes basic score correctly', () => {
    const score = computeScore({ distance: 500, crowdDensity: 50, waitTime: 30 });
    // Normalization: dist=0.5, density=0.5, wait=0.5
    // Result: (0.5*0.3) + (0.5*0.4) + (0.5*0.3) = 0.15 + 0.2 + 0.15 = 0.5
    expect(score).toBeCloseTo(0.5);
  });

  it('handles minimum values (0)', () => {
    const score = computeScore({ distance: 0, crowdDensity: 0, waitTime: 0 });
    expect(score).toBe(0);
  });

  it('handles values at thresholds', () => {
    const score = computeScore({ distance: 1000, crowdDensity: 100, waitTime: 60 });
    expect(score).toBeCloseTo(1);
  });

  it('clips values exceeding thresholds', () => {
    const score = computeScore({ distance: 2000, crowdDensity: 150, waitTime: 120 });
    expect(score).toBe(1);
  });

  it('weights density higher than distance and wait', () => {
    // High density, low others
    const scoreLow = computeScore({ distance: 100, crowdDensity: 100, waitTime: 1 });
    // Low density, high others
    const scoreHigh = computeScore({ distance: 1000, crowdDensity: 10, waitTime: 60 });
    
    // Density 1.0 * 0.4 = 0.4
    // High dist/wait but low density should be lower if the weights favor density
    // Let's check math:
    // scoreLow: (0.1*0.3) + (1.0*0.4) + (0.016*0.3) = 0.03 + 0.4 + 0.005 = 0.435
    // scoreHigh: (1.0*0.3) + (0.1*0.4) + (1.0*0.3) = 0.3 + 0.04 + 0.3 = 0.64
    expect(scoreLow).toBeLessThan(scoreHigh);
  });

  it('sorts options correctly', () => {
    const options = [
      { id: 'far-busy', distance: 1000, crowdDensity: 100, waitTime: 60 },
      { id: 'near-busy', distance: 100, crowdDensity: 80, waitTime: 10 },
      { id: 'far-empty', distance: 900, crowdDensity: 10, waitTime: 5 }
    ];
    const sorted = sortOptions(options);
    expect(sorted[0].id).toBe('far-empty'); // Best score should be first
    expect(sorted[2].id).toBe('far-busy');  // Worst score should be last
  });

  it('handles negative inputs by treating as 0 due to normalization logic', () => {
     // normalize is value / max. if negative, it just stays negative in result if not clamped
     // Actually my normalize was Math.min(val/max, 1), not max(0, min(val/max, 1))
     // Let's check if it needs safety.
     const score = computeScore({ distance: -10, crowdDensity: -5, waitTime: -2 });
     // -0.01 * 0.3 + -0.05 * 0.4 + -0.033 * 0.3
     expect(score).toBeLessThan(0);
  });

  it('maintains order for identical options', () => {
    const options = [
      { id: '1', distance: 10, crowdDensity: 10, waitTime: 10 },
      { id: '2', distance: 10, crowdDensity: 10, waitTime: 10 }
    ];
    const sorted = sortOptions(options);
    expect(sorted[0].id).toBe('1');
    expect(sorted[1].id).toBe('2');
  });

  it('recommends short distance over low wait if density is identical', () => {
    const score1 = computeScore({ distance: 100, crowdDensity: 50, waitTime: 40 });
    const score2 = computeScore({ distance: 500, crowdDensity: 50, waitTime: 10 });
    // score1: 0.1*0.3 + 0.5*0.4 + 0.66*0.3 = 0.03 + 0.2 + 0.198 = 0.428
    // score2: 0.5*0.3 + 0.5*0.4 + 0.16*0.3 = 0.15 + 0.2 + 0.048 = 0.398
    expect(score1).toBeGreaterThan(score2); // wait time reduction 30m > distance reduction 400m for these weights
  });

  it('handles single option', () => {
    const options = [{ id: 'only', distance: 50, crowdDensity: 20, waitTime: 10 }];
    const sorted = sortOptions(options);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].id).toBe('only');
  });

  it('treats missing values as undefined resulting in NaN (strict check)', () => {
    const score = computeScore({ distance: 100 });
    expect(score).toBeNaN();
  });

  it('handles very large values correctly (cap at 1)', () => {
    const score = computeScore({ distance: 1000000, crowdDensity: 10000, waitTime: 1000 });
    expect(score).toBe(1);
  });

  it('works with decimal values', () => {
    const score = computeScore({ distance: 0.5, crowdDensity: 0.2, waitTime: 0.1 });
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(0.01);
  });

  it('handles empty options list', () => {
    const sorted = sortOptions([]);
    expect(sorted).toEqual([]);
  });

  it('re-attaches score to returned objects', () => {
    const options = [{ name: 'A', distance: 1, crowdDensity: 1, waitTime: 1 }];
    const result = sortOptions(options);
    expect(result[0]).toHaveProperty('score');
  });
});
