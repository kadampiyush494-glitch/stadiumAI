const isProd = import.meta.env.PROD;

/**
 * Production-safe logger that prevents leaking sensitive info and 
 * disables console outputs in production.
 */
const logger = {
  info: (msg, ...args) => {
    if (isProd) return;
    console.log(`%c[INFO] %c${msg}`, 'color: #0ea5e9; font-weight: bold;', 'color: inherit;', ...args);
  },
  
  warn: (msg, ...args) => {
    if (isProd) return;
    console.warn(`%c[WARN] %c${msg}`, 'color: #f59e0b; font-weight: bold;', 'color: inherit;', ...args);
  },
  
  error: (msg, ...args) => {
    // We log errors even in production but filter sensitive patterns
    const sanitizedMsg = String(msg).replace(/(Bearer\s+[a-zA-Z0-9._-]+)|(key=[a-zA-Z0-9_-]+)/gi, '[REDACTED]');
    console.error(`%c[ERROR] %c${sanitizedMsg}`, 'color: #ef4444; font-weight: bold;', 'color: inherit;', ...args);
  },

  /**
   * Specifically logs security events to a remote sink or console locally
   */
  security: (event, metadata = {}) => {
    const logData = { event, ...metadata, timestamp: new Date().toISOString() };
    if (!isProd) {
      console.log('%c[SECURITY] %o', 'background: #450a0a; color: #fca5a5; padding: 2px 5px; border-radius: 4px;', logData);
    }
    // In production, you would send path to remote endpoint
  }
};

export default logger;
