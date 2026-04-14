import DOMPurify from 'dompurify';

/**
 * Bounds for a typical stadium area (example bounds)
 */
const STADIUM_BOUNDS = {
  minLat: 37.770,
  maxLat: 38.000,
  minLng: -122.500,
  maxLng: -122.300
};

/**
 * Sanitizes a string using DOMPurify to prevent XSS.
 */
export const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return DOMPurify.sanitize(str, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

/**
 * Validates if coordinates are within the operational stadium boundary.
 */
export const validateCoordinates = (lat, lng) => {
  const nLat = parseFloat(lat);
  const nLng = parseFloat(lng);
  
  if (isNaN(nLat) || isNaN(nLng)) return false;
  
  return (
    nLat >= STADIUM_BOUNDS.minLat &&
    nLat <= STADIUM_BOUNDS.maxLat &&
    nLng >= STADIUM_BOUNDS.minLng &&
    nLng <= STADIUM_BOUNDS.maxLng
  );
};

/**
 * Specialized sanitizer for AI queries.
 */
export const sanitizeQuery = (query) => {
  const clean = sanitizeInput(query).trim();
  // Remove common SQL injection indicators or risky tokens
  return clean.replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND|XP_|EXECUTE|DECLARE|CAST|CONVERT)\b)|[*;]|--|['"]/gi, '');
};
