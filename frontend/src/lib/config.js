/**
 * Mandatory environment variable validation.
 */
const REQUIRED_VARS = [
  'VITE_GOOGLE_MAPS_API_KEY',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_AI_SERVICE_URL'
];

export const validateConfig = () => {
  const missing = REQUIRED_VARS.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    const errorMsg = `CRITICAL CONFIG ERROR: Missing environment variables: ${missing.join(', ')}. Check your .env file.`;
    if (import.meta.env.PROD) {
      console.error(errorMsg);
    } else {
      throw new Error(errorMsg);
    }
  }
};

export const config = {
  mapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  aiBaseUrl: import.meta.env.VITE_AI_SERVICE_URL,
  isDev: import.meta.env.DEV
};
