// Comprehensive error handling utilities

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  stack?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  errorId: string;
}

// Error types enum
export enum ErrorType {
  NETWORK = 'NETWORK_ERROR',
  API = 'API_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTH_ERROR',
  AUTHORIZATION = 'AUTHZ_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER = 'SERVER_ERROR',
  CLIENT = 'CLIENT_ERROR',
  OFFLINE = 'OFFLINE_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Custom error classes
export class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint?: string,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class OfflineError extends Error {
  constructor(message: string = 'You are currently offline') {
    super(message);
    this.name = 'OfflineError';
  }
}

// Error classification utility
export const classifyError = (error: Error): ErrorType => {
  if (error instanceof NetworkError) {
    if (!navigator.onLine) return ErrorType.OFFLINE;
    if (error.statusCode === 429) return ErrorType.RATE_LIMIT;
    if (error.statusCode === 401) return ErrorType.AUTHENTICATION;
    if (error.statusCode === 403) return ErrorType.AUTHORIZATION;
    if (error.statusCode === 404) return ErrorType.NOT_FOUND;
    if (error.statusCode && error.statusCode >= 500) return ErrorType.SERVER;
    return ErrorType.NETWORK;
  }
  
  if (error instanceof APIError) return ErrorType.API;
  if (error instanceof ValidationError) return ErrorType.VALIDATION;
  if (error instanceof OfflineError) return ErrorType.OFFLINE;
  if (error.name === 'TimeoutError') return ErrorType.TIMEOUT;
  
  return ErrorType.UNKNOWN;
};

// Get error severity
export const getErrorSeverity = (errorType: ErrorType): ErrorSeverity => {
  switch (errorType) {
    case ErrorType.CRITICAL:
    case ErrorType.SERVER:
      return ErrorSeverity.CRITICAL;
    case ErrorType.AUTHENTICATION:
    case ErrorType.AUTHORIZATION:
    case ErrorType.API:
      return ErrorSeverity.HIGH;
    case ErrorType.NETWORK:
    case ErrorType.TIMEOUT:
    case ErrorType.NOT_FOUND:
      return ErrorSeverity.MEDIUM;
    case ErrorType.VALIDATION:
    case ErrorType.OFFLINE:
    case ErrorType.RATE_LIMIT:
      return ErrorSeverity.LOW;
    default:
      return ErrorSeverity.MEDIUM;
  }
};

// User-friendly error messages
export const getUserFriendlyMessage = (errorType: ErrorType, error?: Error): string => {
  switch (errorType) {
    case ErrorType.NETWORK:
      return 'Connection problem. Please check your internet and try again.';
    case ErrorType.API:
      return 'Service temporarily unavailable. Please try again in a moment.';
    case ErrorType.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorType.AUTHENTICATION:
      return 'Please sign in to continue.';
    case ErrorType.AUTHORIZATION:
      return 'You don\'t have permission to access this feature.';
    case ErrorType.NOT_FOUND:
      return 'The requested information could not be found.';
    case ErrorType.RATE_LIMIT:
      return 'Too many requests. Please wait a moment before trying again.';
    case ErrorType.SERVER:
      return 'Server error. Our team has been notified and is working on a fix.';
    case ErrorType.OFFLINE:
      return 'You\'re offline. Some features may not be available.';
    case ErrorType.TIMEOUT:
      return 'Request timed out. Please try again.';
    default:
      return 'Something went wrong. Please try again or contact support if the problem persists.';
  }
};

// Generate unique error ID
export const generateErrorId = (): string => {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create standardized error object
export const createAppError = (
  error: Error,
  context?: Record<string, any>,
  userId?: string
): AppError => {
  const errorType = classifyError(error);
  const severity = getErrorSeverity(errorType);
  const userMessage = getUserFriendlyMessage(errorType, error);
  
  return {
    code: errorType,
    message: error.message,
    userMessage,
    severity,
    context: {
      ...context,
      errorName: error.name,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    userId,
    sessionId: getSessionId(),
    stack: error.stack
  };
};

// Get or create session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Retry mechanism with exponential backoff
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain error types
      const errorType = classifyError(lastError);
      if ([
        ErrorType.AUTHENTICATION,
        ErrorType.AUTHORIZATION,
        ErrorType.VALIDATION,
        ErrorType.NOT_FOUND
      ].includes(errorType)) {
        throw lastError;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelay
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// Circuit breaker pattern
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,
    private resetTimeout: number = 30000
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }
  
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
}