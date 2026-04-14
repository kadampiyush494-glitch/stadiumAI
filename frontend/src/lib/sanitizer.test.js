import { describe, it, expect } from 'vitest';
import { sanitizeInput, validateCoordinates, sanitizeQuery } from './sanitizer';

describe('sanitizer utility', () => {
  describe('sanitizeInput (XSS protection)', () => {
    it('strips script tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      expect(sanitizeInput(input)).toBe('Hello');
    });

    it('strips event handlers', () => {
      const input = '<img src=x onerror=alert(1)>';
      expect(sanitizeInput(input)).toBe('');
    });

    it('handles nested tags', () => {
       const input = '<div><p><script>evil()</script>Safe</p></div>';
       expect(sanitizeInput(input)).toBe('Safe');
    });

    it('handles non-string inputs gracefully', () => {
       expect(sanitizeInput(null)).toBe('');
       expect(sanitizeInput(undefined)).toBe('');
       expect(sanitizeInput(123)).toBe('');
    });
  });

  describe('validateCoordinates (Boundary checks)', () => {
    it('allows coordinates within stadium bounds', () => {
      expect(validateCoordinates(37.800, -122.400)).toBe(true);
    });

    it('rejects coordinates outside latitude bounds', () => {
      expect(validateCoordinates(37.000, -122.400)).toBe(false);
      expect(validateCoordinates(39.000, -122.400)).toBe(false);
    });

    it('rejects coordinates outside longitude bounds', () => {
      expect(validateCoordinates(37.800, -122.100)).toBe(false);
      expect(validateCoordinates(37.800, -122.600)).toBe(false);
    });

    it('handles invalid numeric inputs', () => {
      expect(validateCoordinates('abc', -122.400)).toBe(false);
      expect(validateCoordinates(37.800, 'nan')).toBe(false);
    });
  });

  describe('sanitizeQuery (AI/Security checks)', () => {
    it('strips common SQL injection keywords', () => {
      const query = 'Where is the food? SELECT * FROM users';
      const clean = sanitizeQuery(query);
      expect(clean).not.toContain('SELECT');
      expect(clean).not.toContain('*');
      expect(clean).toContain('Where is the food?');
    });

    it('is case insensitive for keywords', () => {
       expect(sanitizeQuery('DROP TABLE')).not.toContain('DROP');
       expect(sanitizeQuery('union select')).not.toContain('union');
    });
    
    it('does not strip keywords embedded in words', () => {
       // "Selection" contains "Select"
       expect(sanitizeQuery('My selection of food')).toContain('selection');
    });
  });
});
