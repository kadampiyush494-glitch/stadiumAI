import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkRateLimit, resetRateLimits } from './rateLimit';

describe('rateLimit utility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetRateLimits();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests within capacity', () => {
    const results = [];
    for (let i = 0; i < 5; i++) {
      results.push(checkRateLimit('AI_QUERY'));
    }
    results.forEach(res => expect(res.allowed).toBe(true));
  });

  it('enforces limit when capacity is exceeded', () => {
    // 10 is the capacity for AI_QUERY
    for (let i = 0; i < 10; i++) {
      checkRateLimit('AI_QUERY');
    }
    const blocked = checkRateLimit('AI_QUERY');
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it('refills tokens over time', () => {
    // Empty the bucket
    for (let i = 0; i < 10; i++) {
        checkRateLimit('AI_QUERY');
    }
    expect(checkRateLimit('AI_QUERY').allowed).toBe(false);

    // AI_QUERY refills at 10 tokens per minute (1 token every 6 seconds)
    vi.advanceTimersByTime(6000); 
    
    const allowedAfterWait = checkRateLimit('AI_QUERY');
    expect(allowedAfterWait.allowed).toBe(true);
  });

  it('calculates retryAfter correctly', () => {
    // Empty bucket (10 tokens)
    for (let i = 0; i < 10; i++) {
      checkRateLimit('AI_QUERY');
    }
    
    const result = checkRateLimit('AI_QUERY');
    // We have 0 tokens. To get 1 token, we need 6000ms.
    //retryAfter = Math.ceil((1 - tokens) / fillRate)
    // tokens after tryConsume (which called refill) will be 0
    // retryAfter should be approx 6000
    expect(result.retryAfter).toBeCloseTo(6000, -2); // close within 100ms
  });

  it('handles unknown types by allowing always', () => {
    expect(checkRateLimit('UNKNOWN').allowed).toBe(true);
  });

  it('handles LOCATION_UPDATE with separate bucket', () => {
    // LOCATION_UPDATE has capacity 60
    for(let i=0; i<60; i++) {
        expect(checkRateLimit('LOCATION_UPDATE').allowed).toBe(true);
    }
    expect(checkRateLimit('LOCATION_UPDATE').allowed).toBe(false);
  });
});
