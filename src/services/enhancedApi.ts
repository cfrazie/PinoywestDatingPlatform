// Enhanced API service with comprehensive error handling

import { supabase } from '../lib/supabase';
import { ContactFormData, NewsletterData } from '../lib/validations';
import { ApiResponse } from '../types';
import { 
  NetworkError, 
  APIError, 
  ValidationError, 
  OfflineError,
  retryWithBackoff,
  CircuitBreaker
} from '../lib/errorHandling';
import { logError } from '../lib/errorLogger';

// Circuit breakers for different services
const contactFormBreaker = new CircuitBreaker(3, 30000, 60000);
const newsletterBreaker = new CircuitBreaker(3, 30000, 60000);
const analyticsBreaker = new CircuitBreaker(5, 60000, 120000);

// Request timeout
const REQUEST_TIMEOUT = 10000;

// Create timeout promise
const createTimeoutPromise = (ms: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), ms);
  });
};

// Enhanced fetch with timeout and error handling
const enhancedFetch = async (
  url: string,
  options: RequestInit = {},
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> => {
  // Check if offline
  if (!navigator.onLine) {
    throw new OfflineError();
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let responseData;

      try {
        responseData = await response.json();
        errorMessage = responseData.message || responseData.error || errorMessage;
      } catch {
        // Response is not JSON
      }

      throw new NetworkError(errorMessage, response.status, responseData);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      if (error.message.includes('Failed to fetch')) {
        throw new NetworkError('Network connection failed');
      }
    }
    
    throw error;
  }
};

// Enhanced contact form submission
export const submitContactFormEnhanced = async (
  data: ContactFormData,
  userId?: string
): Promise<ApiResponse<any>> => {
  try {
    return await contactFormBreaker.execute(async () => {
      return await retryWithBackoff(async () => {
        if (!supabase) {
          // Simulate API call for demo
          await new Promise(resolve => setTimeout(resolve, 1000));
          return { message: 'Thank you for your message! We\'ll get back to you soon.' };
        }

        const { error } = await supabase
          .from('contact_submissions')
          .insert({
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
            status: 'new'
          });

        if (error) {
          throw new APIError(error.message, 500, 'contact_submissions', error);
        }

        // Track successful submission
        await trackEventEnhanced('contact_form_submitted', { 
          subject_length: data.subject.length,
          message_length: data.message.length
        }, userId);

        return { message: 'Thank you for your message! We\'ll get back to you soon.' };
      }, 3);
    });
  } catch (error) {
    const context = {
      action: 'submit_contact_form',
      formData: { ...data, message: '[REDACTED]' }, // Don't log full message
      circuitBreakerState: contactFormBreaker.getState()
    };
    
    logError(error as Error, context, userId);
    
    if (error instanceof OfflineError) {
      return { error: 'You\'re offline. Your message will be sent when you reconnect.' };
    }
    
    if (error instanceof NetworkError) {
      return { error: 'Connection problem. Please check your internet and try again.' };
    }
    
    if (error instanceof APIError) {
      return { error: 'Service temporarily unavailable. Please try again in a moment.' };
    }
    
    return { error: 'Failed to submit form. Please try again.' };
  }
};

// Enhanced newsletter subscription
export const subscribeToNewsletterEnhanced = async (
  data: NewsletterData,
  userId?: string
): Promise<ApiResponse<any>> => {
  try {
    return await newsletterBreaker.execute(async () => {
      return await retryWithBackoff(async () => {
        if (!supabase) {
          // Simulate API call for demo
          await new Promise(resolve => setTimeout(resolve, 800));
          return { message: 'Successfully subscribed to our newsletter!' };
        }

        // Check if email already exists
        const { data: existing } = await supabase
          .from('newsletter_subscriptions')
          .select('email')
          .eq('email', data.email)
          .single();

        if (existing) {
          throw new ValidationError('This email is already subscribed to our newsletter.', 'email', data.email);
        }

        const { error } = await supabase
          .from('newsletter_subscriptions')
          .insert({
            email: data.email,
            active: true
          });

        if (error) {
          throw new APIError(error.message, 500, 'newsletter_subscriptions', error);
        }

        // Track successful subscription
        await trackEventEnhanced('newsletter_subscribed', { 
          email_domain: data.email.split('@')[1] 
        }, userId);

        return { message: 'Successfully subscribed to our newsletter!' };
      }, 3);
    });
  } catch (error) {
    const context = {
      action: 'subscribe_newsletter',
      email: data.email,
      circuitBreakerState: newsletterBreaker.getState()
    };
    
    logError(error as Error, context, userId);
    
    if (error instanceof ValidationError) {
      return { error: error.message };
    }
    
    if (error instanceof OfflineError) {
      return { error: 'You\'re offline. Your subscription will be processed when you reconnect.' };
    }
    
    if (error instanceof NetworkError) {
      return { error: 'Connection problem. Please check your internet and try again.' };
    }
    
    return { error: 'Failed to subscribe. Please try again.' };
  }
};

// Enhanced analytics tracking
export const trackEventEnhanced = async (
  eventType: string,
  eventData?: any,
  userId?: string
): Promise<void> => {
  try {
    await analyticsBreaker.execute(async () => {
      if (!supabase) {
        // Log to console for demo
        console.log('Analytics event (enhanced):', eventType, eventData);
        return;
      }

      await supabase
        .from('analytics_events')
        .insert({
          user_id: userId || null,
          event_type: eventType,
          event_data: eventData || {},
          user_agent: navigator.userAgent,
          ip_address: 'client-side'
        });
    });
  } catch (error) {
    // Don't throw errors for analytics failures, just log them
    const context = {
      action: 'track_event',
      eventType,
      eventData,
      circuitBreakerState: analyticsBreaker.getState()
    };
    
    logError(error as Error, context, userId);
  }
};

// Enhanced API call with comprehensive error handling
export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {},
  timeout?: number
): Promise<T> => {
  try {
    const response = await enhancedFetch(endpoint, options, timeout);
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof NetworkError || error instanceof OfflineError) {
      throw error;
    }
    
    // Convert generic errors to appropriate types
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new NetworkError('Request timed out', 408);
      }
      if (error.message.includes('Failed to fetch')) {
        throw new NetworkError('Network connection failed');
      }
    }
    
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown API error',
      500,
      endpoint
    );
  }
};

// Batch API calls with error handling
export const batchApiCalls = async <T>(
  calls: Array<() => Promise<T>>,
  options: {
    maxConcurrent?: number;
    failFast?: boolean;
    retryFailed?: boolean;
  } = {}
): Promise<Array<T | Error>> => {
  const {
    maxConcurrent = 3,
    failFast = false,
    retryFailed = true
  } = options;

  const results: Array<T | Error> = [];
  const chunks: Array<Array<() => Promise<T>>> = [];
  
  // Split calls into chunks
  for (let i = 0; i < calls.length; i += maxConcurrent) {
    chunks.push(calls.slice(i, i + maxConcurrent));
  }

  for (const chunk of chunks) {
    const chunkPromises = chunk.map(async (call, index) => {
      try {
        if (retryFailed) {
          return await retryWithBackoff(call, 2);
        } else {
          return await call();
        }
      } catch (error) {
        if (failFast) {
          throw error;
        }
        return error as Error;
      }
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
  }

  return results;
};

// Health check endpoint
export const healthCheck = async (): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, boolean>;
  timestamp: string;
}> => {
  const services: Record<string, boolean> = {};
  
  try {
    // Check database connection
    if (supabase) {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      services.database = !error;
    } else {
      services.database = false;
    }
  } catch {
    services.database = false;
  }

  // Check circuit breaker states
  services.contactForm = contactFormBreaker.getState().state !== 'open';
  services.newsletter = newsletterBreaker.getState().state !== 'open';
  services.analytics = analyticsBreaker.getState().state !== 'open';

  const healthyServices = Object.values(services).filter(Boolean).length;
  const totalServices = Object.keys(services).length;
  
  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (healthyServices === totalServices) {
    status = 'healthy';
  } else if (healthyServices > totalServices / 2) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }

  return {
    status,
    services,
    timestamp: new Date().toISOString()
  };
};