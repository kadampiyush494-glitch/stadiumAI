import { describe, it, expect } from 'vitest';
import { sanitizeInput, validateCoordinates, sanitizeQuery } from './sanitizer';

describe('sanitizer utility', () => {
  describe('sanitizeInput (20+ XSS payloads)', () => {
    const payloads = [
      ['<script>alert(1)</script>', ''],
      ['<img src=x onerror=alert(1)>', ''],
      ['<svg onload=alert(1)>', ''],
      ['<details open ontoggle=alert(1)>', ''],
      ['<video><source onerror=alert(1)>', ''],
      ['<audio src=x onerror=alert(1)>', ''],
      ['<iframe src="javascript:alert(1)">', ''],
      ['<embed src="javascript:alert(1)">', ''],
      ['<object data="javascript:alert(1)">', ''],
      ['<form action="javascript:alert(1)"><input type=submit>', ''],
      ['<a href="javascript:alert(1)">Click me</a>', 'Click me'],
      ['<button onmouseover=alert(1)>Hover</button>', 'Hover'],
      ['<input autofocus onfocus=alert(1)>', ''],
      ['<textarea onfocus=alert(1)>', ''],
      ['<p style="behavior:url(xss.htc);">Test</p>', 'Test'],
      ['<p style="width: expression(alert(1));">Test</p>', 'Test'],
      ['<img src="vbscript:msgbox(1)">', ''],
      ['<div style="background-image: url(javascript:alert(1))">', ''],
      ['<math><mtext><option><fake><script>alert(1)</script></fake></option></mtext></math>', ''],
      ['<isindex type=image src=1 onerror=alert(1)>', ''],
      ['<script>/* comment */ alert(1) </script>', ''],
      ['%3Cscript%3Ealert(1)%3C/script%3E', '%3Cscript%3Ealert(1)%3C/script%3E'], // DOMPurify doesn't decode URL encoding
      ['<scr<script>ipt>alert(1)</scr</script>ipt>', 'ipt&gt;alert(1)ipt&gt;'] // Nested/Obfuscated
    ];

    payloads.forEach(([input, expected], i) => {
      it(`Case ${i + 1}: sanitizes ${input.slice(0, 20)}...`, () => {
        expect(sanitizeInput(input)).toBe(expected);
      });
    });
  });

  describe('sanitizeQuery (SQL injection tests)', () => {
    it('removes SQL keywords from query', () => {
      const query = "Get gate status' OR '1'='1' --";
      const sanitized = sanitizeQuery(query);
      expect(sanitized).not.toContain('OR');
      expect(sanitized).not.toContain("'1'='1'");
      expect(sanitized).not.toContain('--');
    });

    it('blocks double dash comments', () => {
       expect(sanitizeQuery('test -- Comment')).not.toContain('--');
    });

    it('blocks semicolon commands', () => {
       expect(sanitizeQuery('test; DROP TABLE nodes')).not.toContain(';');
       expect(sanitizeQuery('test; DROP TABLE nodes')).not.toContain('DROP');
    });

    it('passthrough for valid normal queries', () => {
       const queries = [
         'Which gate is closest?',
         'Where is burger king?',
         'Show me the way to section 404',
         'Wait time for restroom 5'
       ];
       queries.forEach(q => {
         expect(sanitizeQuery(q)).toBe(q);
       });
    });
  });

  describe('validateCoordinates (Boundary checks)', () => {
    it('accepts perfectly valid coordinates', () => {
      expect(validateCoordinates(37.7749, -122.4194)).toBe(true);
    });

    it('rejects coordinates on the moon', () => {
      expect(validateCoordinates(100, 200)).toBe(false);
    });

    it('rejects non-numeric coordinates', () => {
      expect(validateCoordinates('abc', 'def')).toBe(false);
      expect(validateCoordinates(37.77, 'invalid')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('returns empty string for non-string input in sanitizeInput', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
      expect(sanitizeInput(123)).toBe('');
      expect(sanitizeInput({})).toBe('');
    });
  });
});
