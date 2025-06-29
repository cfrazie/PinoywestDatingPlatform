// Security utilities and validation functions

export interface SecurityConfig {
  maxRequestsPerHour: number;
  maxRequestsPerMinute: number;
  blockedUserAgents: string[];
  allowedOrigins: string[];
}

export const securityConfig: SecurityConfig = {
  maxRequestsPerHour: 100,
  maxRequestsPerMinute: 10,
  blockedUserAgents: [
    'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget'
  ],
  allowedOrigins: [
    'https://pinoywest.netlify.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ]
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .slice(0, 1000); // Limit length
};

// Email validation with additional security checks
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const sanitizedEmail = sanitizeInput(email);
  
  // Check for common attack patterns
  const suspiciousPatterns = [
    /script/i,
    /javascript/i,
    /vbscript/i,
    /onload/i,
    /onerror/i,
    /<.*>/,
    /\.\./,
    /[<>]/
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(sanitizedEmail))) {
    return false;
  }
  
  return emailRegex.test(sanitizedEmail) && sanitizedEmail.length <= 254;
};

// Rate limiting implementation
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  isAllowed(identifier: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
  
  cleanup(): void {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => time > oneHourAgo);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Clean up rate limiter every hour
if (typeof window !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 60 * 60 * 1000);
}

// Content Security Policy nonce generation
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Secure headers for API responses
export const getSecurityHeaders = () => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
});

// Validate and sanitize form data
export const validateFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'number' && isFinite(value)) {
      sanitized[key] = value;
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    }
    // Skip other types for security
  }
  
  return sanitized;
};

// Check for suspicious activity
export const detectSuspiciousActivity = (data: any): boolean => {
  const suspiciousPatterns = [
    /script/i,
    /javascript/i,
    /vbscript/i,
    /onload/i,
    /onerror/i,
    /<.*>/,
    /\.\./,
    /union.*select/i,
    /drop.*table/i,
    /insert.*into/i,
    /delete.*from/i,
    /update.*set/i,
    /exec\(/i,
    /eval\(/i
  ];
  
  const dataString = JSON.stringify(data).toLowerCase();
  return suspiciousPatterns.some(pattern => pattern.test(dataString));
};

// Secure random string generation
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Environment variable validation
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check for required environment variables
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  
  for (const varName of requiredVars) {
    const value = import.meta.env[varName];
    if (!value || value.includes('your_') || value.includes('placeholder')) {
      errors.push(`${varName} is not properly configured`);
    }
  }
  
  // Check for development values in production
  if (import.meta.env.PROD) {
    const devPatterns = ['localhost', '127.0.0.1', 'test', 'dev', 'staging'];
    
    for (const varName of requiredVars) {
      const value = import.meta.env[varName];
      if (value && devPatterns.some(pattern => value.includes(pattern))) {
        errors.push(`${varName} appears to contain development values in production`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Log security events
export const logSecurityEvent = (event: {
  type: 'rate_limit' | 'suspicious_activity' | 'validation_error' | 'unauthorized_access';
  details: any;
  userAgent?: string;
  ip?: string;
}) => {
  // In production, this would send to a security monitoring service
  console.warn('Security Event:', {
    timestamp: new Date().toISOString(),
    ...event
  });
  
  // Track in analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'security_event', {
      event_category: 'security',
      event_label: event.type,
      custom_parameter_1: JSON.stringify(event.details)
    });
  }
};