import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callAssistant, buildContextString, sanitizeInput, resetRateLimit } from './aiService';

describe('aiService', () => {
  let mockFetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    resetRateLimit();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('sanitizes input properly', () => {
    const maliciousInput = '<script>alert("xss")</script>Hello <b onmouseover="alert(1)">there</b>';
    const clean = sanitizeInput(maliciousInput);
    expect(clean).toBe('Hello there'); // DOMPurify strips tags
  });

  it('builds context string correctly', () => {
    const context = {
      zone: 'North',
      time: '12:00 PM',
      densityMap: 'High',
      facilities: { restrooms: '2 mins' }
    };
    const ctxString = buildContextString(context);
    expect(ctxString).toContain('North');
    expect(ctxString).toContain('12:00 PM');
    expect(ctxString).toContain('High');
    expect(ctxString).toContain('restrooms');
  });

  it('calls AI service via fetch and returns reply', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: 'Go to South gate' })
    });

    const reply = await callAssistant('Where to go?', { zone: 'North' });
    expect(reply).toBe('Go to South gate');
    expect(mockFetch).toHaveBeenCalled();
    const fetchArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(fetchArgs[1].body);
    expect(body.messages[0].role).toBe('system');
    expect(body.messages[0].content).toContain('OmniFlow');
    expect(body.messages[0].content).toContain('North');    // context injected
    expect(body.messages[1].role).toBe('user');
    expect(body.messages[1].content).toBe('Where to go?');
  });

  it('blocks queries after 10 requests within a minute (rate limiting)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ reply: 'Test reply' })
    });

    // Make 10 valid requests
    for (let i = 0; i < 10; i++) {
        await callAssistant(`Query ${i}`, {});
    }

    // 11th request should fail
    await expect(callAssistant('Query 11', {})).rejects.toThrow('Rate limit exceeded');

    // Advance timer by 60s
    vi.advanceTimersByTime(60000);

    // 12th request should work after time passes
    const reply = await callAssistant('Query 12', {});
    expect(reply).toBe('Test reply');
  });
  
  it('rejects empty queries', async () => {
    await expect(callAssistant('   ', {})).rejects.toThrow(/Invalid or empty query/i);
    await expect(callAssistant('<script></script>', {})).rejects.toThrow(/Invalid or empty query/i); // Sanitized to empty
  });
});
