// Error logging service

import { AppError } from './errorHandling';
import { supabase } from './supabase';

export interface ErrorLogEntry {
  id?: string;
  error_code: string;
  error_message: string;
  user_message: string;
  severity: string;
  context: Record<string, any>;
  user_id?: string;
  session_id?: string;
  stack_trace?: string;
  created_at?: string;
}

class ErrorLogger {
  private logQueue: ErrorLogEntry[] = [];
  private isProcessing = false;
  private maxQueueSize = 100;
  private flushInterval = 30000; // 30 seconds
  private retryAttempts = 3;

  constructor() {
    // Start periodic flush
    setInterval(() => this.flush(), this.flushInterval);
    
    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flush());
    
    // Flush when coming back online
    window.addEventListener('online', () => this.flush());
  }

  // Log error to queue
  async logError(appError: AppError): Promise<void> {
    const logEntry: ErrorLogEntry = {
      error_code: appError.code,
      error_message: appError.message,
      user_message: appError.userMessage,
      severity: appError.severity,
      context: appError.context || {},
      user_id: appError.userId,
      session_id: appError.sessionId,
      stack_trace: appError.stack,
      created_at: appError.timestamp
    };

    // Add to queue
    this.logQueue.push(logEntry);

    // Limit queue size
    if (this.logQueue.length > this.maxQueueSize) {
      this.logQueue = this.logQueue.slice(-this.maxQueueSize);
    }

    // Store in localStorage as backup
    this.storeInLocalStorage(logEntry);

    // For critical errors, try to send immediately
    if (appError.severity === 'critical') {
      await this.flush();
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 ${appError.severity.toUpperCase()} ERROR`);
      console.error('Message:', appError.message);
      console.error('User Message:', appError.userMessage);
      console.error('Code:', appError.code);
      console.error('Context:', appError.context);
      if (appError.stack) {
        console.error('Stack:', appError.stack);
      }
      console.groupEnd();
    }
  }

  // Store error in localStorage as backup
  private storeInLocalStorage(logEntry: ErrorLogEntry): void {
    try {
      const stored = localStorage.getItem('errorLogs');
      const logs = stored ? JSON.parse(stored) : [];
      logs.push(logEntry);
      
      // Keep only last 50 errors in localStorage
      if (logs.length > 50) {
        logs.splice(0, logs.length - 50);
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(logs));
    } catch (error) {
      console.warn('Failed to store error in localStorage:', error);
    }
  }

  // Flush queue to server
  async flush(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    try {
      await this.sendLogs(logsToSend);
      
      // Clear from localStorage on successful send
      this.clearLocalStorageLogs(logsToSend);
    } catch (error) {
      console.warn('Failed to send error logs:', error);
      
      // Put logs back in queue for retry
      this.logQueue.unshift(...logsToSend);
    } finally {
      this.isProcessing = false;
    }
  }

  // Send logs to server
  private async sendLogs(logs: ErrorLogEntry[]): Promise<void> {
    if (!supabase || !navigator.onLine) {
      throw new Error('Cannot send logs: offline or no database connection');
    }

    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const { error } = await supabase
          .from('error_logs')
          .insert(logs);

        if (error) throw error;
        return; // Success
      } catch (error) {
        if (attempt === this.retryAttempts - 1) {
          throw error; // Last attempt failed
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  // Clear successfully sent logs from localStorage
  private clearLocalStorageLogs(sentLogs: ErrorLogEntry[]): void {
    try {
      const stored = localStorage.getItem('errorLogs');
      if (!stored) return;
      
      const logs = JSON.parse(stored);
      const sentTimestamps = new Set(sentLogs.map(log => log.created_at));
      
      const remainingLogs = logs.filter((log: ErrorLogEntry) => 
        !sentTimestamps.has(log.created_at)
      );
      
      localStorage.setItem('errorLogs', JSON.stringify(remainingLogs));
    } catch (error) {
      console.warn('Failed to clear localStorage logs:', error);
    }
  }

  // Get error statistics
  getErrorStats(): {
    queueSize: number;
    localStorageSize: number;
    isProcessing: boolean;
  } {
    let localStorageSize = 0;
    try {
      const stored = localStorage.getItem('errorLogs');
      localStorageSize = stored ? JSON.parse(stored).length : 0;
    } catch (error) {
      // Ignore
    }

    return {
      queueSize: this.logQueue.length,
      localStorageSize,
      isProcessing: this.isProcessing
    };
  }

  // Manual retry of failed logs
  async retryFailedLogs(): Promise<void> {
    try {
      const stored = localStorage.getItem('errorLogs');
      if (!stored) return;
      
      const logs = JSON.parse(stored);
      if (logs.length === 0) return;
      
      await this.sendLogs(logs);
      localStorage.removeItem('errorLogs');
    } catch (error) {
      console.warn('Failed to retry logs:', error);
    }
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger();

// Convenience function to log errors
export const logError = (error: Error, context?: Record<string, any>, userId?: string): void => {
  const { createAppError } = require('./errorHandling');
  const appError = createAppError(error, context, userId);
  errorLogger.logError(appError);
};

// Log performance issues
export const logPerformanceIssue = (
  metric: string,
  value: number,
  threshold: number,
  context?: Record<string, any>
): void => {
  if (value > threshold) {
    const error = new Error(`Performance issue: ${metric} (${value}ms) exceeded threshold (${threshold}ms)`);
    logError(error, { ...context, metric, value, threshold, type: 'performance' });
  }
};

// Log user actions for debugging
export const logUserAction = (
  action: string,
  context?: Record<string, any>,
  userId?: string
): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`👤 User Action: ${action}`, context);
  }
  
  // Store user actions for error context
  try {
    const actions = JSON.parse(sessionStorage.getItem('userActions') || '[]');
    actions.push({
      action,
      context,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 20 actions
    if (actions.length > 20) {
      actions.splice(0, actions.length - 20);
    }
    
    sessionStorage.setItem('userActions', JSON.stringify(actions));
  } catch (error) {
    // Ignore storage errors
  }
};