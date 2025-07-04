// Secure API service with enhanced validation and rate limiting
import { supabase } from '../lib/supabase';
import { ContactFormData, NewsletterData } from '../lib/validations';
import { ApiResponse } from '../types';
import { 
  sanitizeInput, 
  validateEmail, 
  rateLimiter, 
  validateFormData, 
  detectSuspiciousActivity,
  logSecurityEvent,
  securityConfig
} from '../lib/security';

// Get client identifier for rate limiting
const getClientIdentifier = (): string => {
  // Use a combination of factors for identification
  const factors = [
    navigator.userAgent,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset().toString(),
    navigator.language
  ];
  
  // Create a simple hash
  let hash = 0;
  const str = factors.join('|');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
};

// Enhanced contact form submission with security
export const submitContactFormSecure = async (data: ContactFormData): Promise<ApiResponse<any>> => {
  try {
    const clientId = getClientIdentifier();
    
    // Rate limiting check
    if (!rateLimiter.isAllowed(clientId, securityConfig.maxRequestsPerHour, 60 * 60 * 1000)) {
      logSecurityEvent({
        type: 'rate_limit',
        details: { endpoint: 'contact_form', clientId },
        userAgent: navigator.userAgent
      });
      return { error: 'Too many requests. Please try again later.' };
    }
    
    // Validate and sanitize input
    const sanitizedData = validateFormData(data);
    
    // Check for suspicious activity
    if (detectSuspiciousActivity(sanitizedData)) {
      logSecurityEvent({
        type: 'suspicious_activity',
        details: { endpoint: 'contact_form', data: sanitizedData },
        userAgent: navigator.userAgent
      });
      return { error: 'Invalid request detected.' };
    }
    
    // Additional email validation
    if (!validateEmail(sanitizedData.email)) {
      return { error: 'Please enter a valid email address.' };
    }
    
    // Length and content validation
    if (sanitizedData.name.length < 2 || sanitizedData.name.length > 100) {
      return { error: 'Name must be between 2 and 100 characters.' };
    }
    
    if (sanitizedData.subject.length < 5 || sanitizedData.subject.length > 200) {
      return { error: 'Subject must be between 5 and 200 characters.' };
    }
    
    if (sanitizedData.message.length < 10 || sanitizedData.message.length > 1000) {
      return { error: 'Message must be between 10 and 1000 characters.' };
    }
    
    if (!supabase) {
      // Simulate successful submission for demo with security logging
      await new Promise(resolve => setTimeout(resolve, 1000));
      logSecurityEvent({
        type: 'validation_error',
        details: { message: 'Supabase not configured', endpoint: 'contact_form' }
      });
      return { message: 'Thank you for your message! We\'ll get back to you soon.' };
    }

    const { error } = await supabase
      .from('contact_submissions')
      .insert({
        name: sanitizedData.name,
        email: sanitizedData.email,
        message: sanitizedData.message,
      });

    if (error) throw error;

    // Track successful submission
    await trackEventSecure('contact_form_submitted', { 
      subject_length: sanitizedData.subject.length,
      message_length: sanitizedData.message.length
    });

    return { message: 'Thank you for your message! We\'ll get back to you soon.' };
  } catch (error) {
    console.error('Contact form submission error:', error);
    logSecurityEvent({
      type: 'validation_error',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      userAgent: navigator.userAgent
    });
    return { error: 'Failed to submit form. Please try again.' };
  }
};

// Enhanced newsletter subscription with security
export const subscribeToNewsletterSecure = async (data: NewsletterData): Promise<ApiResponse<any>> => {
  try {
    const clientId = getClientIdentifier();
    
    // Rate limiting check
    if (!rateLimiter.isAllowed(clientId, securityConfig.maxRequestsPerMinute, 60 * 1000)) {
      logSecurityEvent({
        type: 'rate_limit',
        details: { endpoint: 'newsletter', clientId },
        userAgent: navigator.userAgent
      });
      return { error: 'Too many requests. Please try again later.' };
    }
    
    // Validate and sanitize input
    const sanitizedData = validateFormData(data);
    
    // Check for suspicious activity
    if (detectSuspiciousActivity(sanitizedData)) {
      logSecurityEvent({
        type: 'suspicious_activity',
        details: { endpoint: 'newsletter', data: sanitizedData },
        userAgent: navigator.userAgent
      });
      return { error: 'Invalid request detected.' };
    }
    
    // Enhanced email validation
    if (!validateEmail(sanitizedData.email)) {
      return { error: 'Please enter a valid email address.' };
    }
    
    if (!supabase) {
      // Simulate successful subscription for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      return { message: 'Successfully subscribed to our newsletter!' };
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('newsletter_subscriptions')
      .select('email')
      .eq('email', sanitizedData.email)
      .single();

    if (existing) {
      return { error: 'This email is already subscribed to our newsletter.' };
    }

    const { error } = await supabase
      .from('newsletter_subscriptions')
      .insert({
        email: sanitizedData.email
      });

    if (error) throw error;

    // Track successful subscription
    await trackEventSecure('newsletter_subscribed', { 
      email_domain: sanitizedData.email.split('@')[1] 
    });

    return { message: 'Successfully subscribed to our newsletter!' };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    logSecurityEvent({
      type: 'validation_error',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      userAgent: navigator.userAgent
    });
    return { error: 'Failed to subscribe. Please try again.' };
  }
};

// Secure analytics tracking
export const trackEventSecure = async (eventType: string, eventData?: any): Promise<void> => {
  try {
    const clientId = getClientIdentifier();
    
    // Rate limiting for analytics
    if (!rateLimiter.isAllowed(`analytics_${clientId}`, 50, 60 * 1000)) {
      return; // Silently fail for analytics
    }
    
    // Sanitize event data
    const sanitizedEventData = eventData ? validateFormData(eventData) : {};
    
    // Check for suspicious activity in analytics data
    if (detectSuspiciousActivity(sanitizedEventData)) {
      logSecurityEvent({
        type: 'suspicious_activity',
        details: { endpoint: 'analytics', eventType, data: sanitizedEventData },
        userAgent: navigator.userAgent
      });
      return;
    }
    
    if (!supabase) {
      // Log to console for demo
      console.log('Analytics event (secure):', eventType, sanitizedEventData);
      console.log('User ID:', auth.uid() || 'anonymous');
      return;
    }

    await supabase
      .from('analytics_events')
      .insert({
        user_id: auth.uid() || null, // Use current user ID or null for anonymous events
        event_type: sanitizeInput(eventType),
        event_data: sanitizedEventData,
      });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Don't throw errors for analytics failures
  }
};

// Secure user agent validation
export const validateUserAgent = (userAgent: string): boolean => {
  const blockedPatterns = securityConfig.blockedUserAgents;
  const lowerUA = userAgent.toLowerCase();
  
  return !blockedPatterns.some(pattern => lowerUA.includes(pattern));
};

// Check if request is from allowed origin
export const validateOrigin = (origin: string): boolean => {
  return securityConfig.allowedOrigins.includes(origin);
};

// Secure session validation
export const validateSession = (): boolean => {
  try {
    // Check if user agent is valid
    if (!validateUserAgent(navigator.userAgent)) {
      logSecurityEvent({
        type: 'unauthorized_access',
        details: { reason: 'blocked_user_agent' },
        userAgent: navigator.userAgent
      });
      return false;
    }
    
    // Additional session checks can be added here
    return true;
  } catch (error) {
    logSecurityEvent({
      type: 'validation_error',
      details: { error: 'Session validation failed' }
    });
    return false;
  }
};

// Initialize security monitoring
export const initializeSecurity = () => {
  // Validate session on load
  if (!validateSession()) {
    console.warn('Security validation failed');
  }
  
  // Monitor for suspicious activity
  if (typeof window !== 'undefined') {
    // Monitor for console access (basic protection)
    let devtools = false;
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        if (!devtools) {
          devtools = true;
          logSecurityEvent({
            type: 'suspicious_activity',
            details: { activity: 'devtools_detected' }
          });
        }
      } else {
        devtools = false;
      }
    }, 1000);
    
    // Monitor for right-click context menu
    document.addEventListener('contextmenu', (e) => {
      if (import.meta.env.PROD) {
        e.preventDefault();
        logSecurityEvent({
          type: 'suspicious_activity',
          details: { activity: 'context_menu_attempt' }
        });
      }
    });
    
    // Monitor for key combinations
    document.addEventListener('keydown', (e) => {
      if (import.meta.env.PROD && (
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.key === 'F12')
      )) {
        e.preventDefault();
        logSecurityEvent({
          type: 'suspicious_activity',
          details: { activity: 'devtools_shortcut_attempt', key: e.key }
        });
      }
    });
  }
};