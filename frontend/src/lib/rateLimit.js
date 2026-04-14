/**
 * Simple Token Bucket implementation for client-side rate limiting.
 */
class TokenBucket {
  constructor(capacity, fillPerMinute) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.lastRefill = Date.now();
    this.fillRate = fillPerMinute / 60000; // tokens per ms
  }

  refill() {
    const now = Date.now();
    const ellapsed = now - this.lastRefill;
    this.tokens = Math.min(this.capacity, this.tokens + ellapsed * this.fillRate);
    this.lastRefill = now;
  }

  tryConsume() {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return { allowed: true, retryAfter: 0 };
    }
    
    const waitMs = (1 - this.tokens) / this.fillRate;
    return { allowed: false, retryAfter: Math.ceil(waitMs) };
  }
}

// Singletons for designated buckets
const AI_BUCKET = new TokenBucket(10, 10); // 10 per min
const LOCATION_BUCKET = new TokenBucket(60, 60); // 1 per sec (60/min)

export const checkRateLimit = (type) => {
  switch (type) {
    case 'AI_QUERY':
      return AI_BUCKET.tryConsume();
    case 'LOCATION_UPDATE':
      return LOCATION_BUCKET.tryConsume();
    default:
      return { allowed: true, retryAfter: 0 };
  }
};
