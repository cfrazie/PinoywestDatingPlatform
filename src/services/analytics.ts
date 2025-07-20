// Google Tag Manager and Analytics utilities

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize dataLayer if it doesn't exist
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}

// GTM tracking function
export const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(arguments);
  }
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  gtag('config', import.meta.env.VITE_GTM_ID, {
    page_path: url,
    page_title: title
  });
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  gtag('event', eventName, {
    event_category: 'engagement',
    event_label: eventName,
    ...parameters
  });
};

// Track conversions
export const trackConversion = (conversionType: string, value?: number, currency?: string) => {
  gtag('event', 'conversion', {
    event_category: 'conversion',
    event_label: conversionType,
    value: value,
    currency: currency || 'USD'
  });
};

// Track user interactions
export const trackUserInteraction = (action: string, element: string, value?: string) => {
  gtag('event', action, {
    event_category: 'user_interaction',
    event_label: element,
    value: value
  });
};

// Track form submissions
export const trackFormSubmission = (formName: string, success: boolean) => {
  gtag('event', 'form_submit', {
    event_category: 'form',
    event_label: formName,
    success: success
  });
};

// Track video interactions
export const trackVideoInteraction = (action: 'play' | 'pause' | 'complete', videoTitle: string) => {
  gtag('event', `video_${action}`, {
    event_category: 'video',
    event_label: videoTitle
  });
};

// Track scroll depth
export const trackScrollDepth = (percentage: number) => {
  gtag('event', 'scroll', {
    event_category: 'engagement',
    event_label: 'scroll_depth',
    value: percentage
  });
};

// Track file downloads
export const trackDownload = (fileName: string, fileType: string) => {
  gtag('event', 'file_download', {
    event_category: 'download',
    event_label: fileName,
    file_type: fileType
  });
};

// Track external link clicks
export const trackExternalLink = (url: string, linkText?: string) => {
  gtag('event', 'click', {
    event_category: 'external_link',
    event_label: url,
    link_text: linkText
  });
};

// Track search queries
export const trackSearch = (searchTerm: string, resultsCount?: number) => {
  gtag('event', 'search', {
    event_category: 'search',
    search_term: searchTerm,
    results_count: resultsCount
  });
};

// Track social media shares
export const trackSocialShare = (platform: string, url: string) => {
  gtag('event', 'share', {
    event_category: 'social',
    method: platform,
    content_type: 'url',
    item_id: url
  });
};

// Enhanced ecommerce tracking for Stripe integration
export const trackPurchase = (transactionId: string, value: number, currency: string, items: any[]) => {
  gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: value,
    currency: currency,
    items: items
  });
};

export const trackBeginCheckout = (value: number, currency: string, items: any[]) => {
  gtag('event', 'begin_checkout', {
    currency: currency,
    value: value,
    items: items
  });
};

export const trackAddToCart = (currency: string, value: number, items: any[]) => {
  gtag('event', 'add_to_cart', {
    currency: currency,
    value: value,
    items: items
  });
};

// Track user engagement metrics
export const trackEngagement = (engagementType: string, duration?: number) => {
  gtag('event', 'engagement', {
    event_category: 'user_engagement',
    event_label: engagementType,
    engagement_time_msec: duration
  });
};

// Track errors for analytics
export const trackError = (errorType: string, errorMessage: string, fatal: boolean = false) => {
  gtag('event', 'exception', {
    description: errorMessage,
    fatal: fatal,
    error_type: errorType
  });
};