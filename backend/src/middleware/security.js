/**
 * Security middleware for Cloud Run backend.
 */
export const securityHeaders = (req, res, next) => {
  // CSP: Strict policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self' *.googleapis.com *.firebaseio.com *.firebase.com; script-src 'self' 'unsafe-inline' *.google.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com;"
  );
  
  // Anti-clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

export const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
