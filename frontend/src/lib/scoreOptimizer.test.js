import { describe, it, expect } from 'vitest';
import { computeScore, sortOptions } from './scoreOptimizer';

describe('scoreOptimizer', () => {
  // --- Category: Normal Values ---
  it('1. computes basic score correctly', () => {
    const score = computeScore({ distance: 500, crowdDensity: 50, waitTime: 30 });
    expect(score).toBeCloseTo(0.5);
  });

  it('2. weights density higher than distance and wait', () => {
    // Both dist/wait are identical, only density differs
    const scoreLowDensity = computeScore({ distance: 100, crowdDensity: 10, waitTime: 10 });
    const scoreHighDensity = computeScore({ distance: 100, crowdDensity: 90, waitTime: 10 });
    expect(scoreHighDensity).toBeGreaterThan(scoreLowDensity);
  });

  it('3. handles decimal values correctly', () => {
    const score = computeScore({ distance: 0.5, crowdDensity: 0.2, waitTime: 0.1 });
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(0.01);
  });

  // --- Category: All Zeros ---
  it('4. handles all zeros', () => {
    const score = computeScore({ distance: 0, crowdDensity: 0, waitTime: 0 });
    expect(score).toBe(0);
  });

  // --- Category: Max Values ---
  it('5. handles exact threshold values (Max)', () => {
    const score = computeScore({ distance: 1000, crowdDensity: 100, waitTime: 60 });
    expect(score).toBeCloseTo(1);
  });

  it('6. clips values exceeding thresholds', () => {
    const score = computeScore({ distance: 5000, crowdDensity: 200, waitTime: 2000 });
    expect(score).toBe(1);
  });

  it('7. handles very large values', () => {
    const score = computeScore({ distance: 1e10, crowdDensity: 1e10, waitTime: 1e10 });
    expect(score).toBe(1);
  });

  // --- Category: Tie-Breaking / Sorting ---
  it('8. sorts options correctly by score', () => {
    const options = [
      { id: 'worst', distance: 1000, crowdDensity: 100, waitTime: 60 },
      { id: 'best', distance: 0, crowdDensity: 0, waitTime: 0 },
      { id: 'mid', distance: 500, crowdDensity: 50, waitTime: 30 }
    ];
    const sorted = sortOptions(options);
    expect(sorted[0].id).toBe('best');
    expect(sorted[2].id).toBe('worst');
  });

  it('9. maintains order for identical scores (stable tie-breaking)', () => {
    const options = [
      { id: 'a', distance: 100, crowdDensity: 50, waitTime: 10 },
      { id: 'b', distance: 100, crowdDensity: 50, waitTime: 10 }
    ];
    const sorted = sortOptions(options);
    expect(sorted[0].id).toBe('a');
    expect(sorted[1].id).toBe('b');
  });

  it('10. handles single option in sort', () => {
    const result = sortOptions([{ id: 'x', distance: 1, crowdDensity: 1, waitTime: 1 }]);
    expect(result).toHaveLength(1);
  });

  it('11. handles empty lists in sort', () => {
    expect(sortOptions([])).toEqual([]);
  });

  // --- Category: NaN and Edge Cases ---
  it('12. returns NaN if required inputs are missing', () => {
    const score = computeScore({ distance: 100 });
    expect(score).toBeNaN();
  });

  it('13. returns NaN if inputs are explicitly NaN', () => {
    const score = computeScore({ distance: NaN, crowdDensity: 50, waitTime: 10 });
    expect(score).toBeNaN();
  });

  it('14. handles negative values (treated as <= 0)', () => {
    const score = computeScore({ distance: -100, crowdDensity: -50, waitTime: -10 });
    // Normalize will return negative values if not clamped at 0
    // Math.min(-0.1, 1) = -0.1
    expect(score).toBeLessThan(0);
  });

  it('15. verifies that the output has the score property attached', () => {
    const result = sortOptions([{ name: 'Test', distance: 10, crowdDensity: 10, waitTime: 10 }]);
    expect(result[0]).toHaveProperty('score');
    expect(typeof result[0].score).toBe('number');
  });
});
