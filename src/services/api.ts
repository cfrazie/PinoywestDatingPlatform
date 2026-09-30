import { supabase } from '../lib/supabase';
import { ContactFormData, NewsletterData } from '../lib/validations';
import { ApiResponse } from '../types';

// Contact form submission
export const submitContactForm = async (data: ContactFormData): Promise<ApiResponse<any>> => {
  try {
    if (!supabase) {
      // Simulate successful submission for demo
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

    if (error) throw error;

    // Track analytics event
    await trackEvent('contact_form_submitted', { subject: data.subject });

    return { message: 'Thank you for your message! We\'ll get back to you soon.' };
  } catch (error) {
    console.error('Contact form submission error:', error);
    return { error: 'Failed to submit form. Please try again.' };
  }
};

// Newsletter subscription
export const subscribeToNewsletter = async (data: NewsletterData): Promise<ApiResponse<any>> => {
  try {
    if (!supabase) {
      // Simulate successful subscription for demo
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
      return { error: 'This email is already subscribed to our newsletter.' };
    }

    const { error } = await supabase
      .from('newsletter_subscriptions')
      .insert({
        email: data.email,
        active: true
      });

    if (error) throw error;

    // Track analytics event
    await trackEvent('newsletter_subscribed', { email: data.email });

    return { message: 'Successfully subscribed to our newsletter!' };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return { error: 'Failed to subscribe. Please try again.' };
  }
};

// Analytics tracking
export const trackEvent = async (eventType: string, eventData?: any): Promise<void> => {
  try {
    // Defensive fallback: log locally and return early if supabase is not configured
    if (!supabase) {
      console.log('Analytics event (local):', eventType, eventData);
      return;
    }

    // Use getSession to obtain the current user id instead of undefined auth helper
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    await supabase
      .from('analytics_events')
      .insert({
        user_id: userId, // Fixed: use getSession() instead of undefined auth.uid(), removed duplicate user_id
        event_type: eventType,
        event_data: eventData,
        user_agent: navigator.userAgent,
        ip_address: 'client-side' // In production, this would be handled server-side
      });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Get analytics data (for admin dashboard)
export const getAnalytics = async (startDate?: string, endDate?: string): Promise<ApiResponse<any>> => {
  try {
    let query = supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data };
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return { error: 'Failed to fetch analytics data.' };
  }
};