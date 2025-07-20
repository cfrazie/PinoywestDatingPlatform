import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  trackPageView, 
  trackEvent, 
  trackUserInteraction,
  trackScrollDepth,
  trackEngagement
} from '../services/analytics';

// Hook for automatic page view tracking
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    trackPageView(location.pathname + location.search, document.title);
  }, [location]);
};

// Hook for scroll depth tracking
export const useScrollTracking = () => {
  useEffect(() => {
    let maxScroll = 0;
    const trackingThresholds = [25, 50, 75, 90, 100];
    const trackedThresholds = new Set<number>();

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        // Track milestone thresholds
        trackingThresholds.forEach(threshold => {
          if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
            trackedThresholds.add(threshold);
            trackScrollDepth(threshold);
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
};

// Hook for engagement time tracking
export const useEngagementTracking = () => {
  useEffect(() => {
    const startTime = Date.now();
    let isActive = true;
    let lastActivity = startTime;

    const trackActivity = () => {
      lastActivity = Date.now();
      isActive = true;
    };

    const checkEngagement = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      
      // Consider user inactive after 30 seconds of no activity
      if (timeSinceLastActivity > 30000) {
        isActive = false;
      }
    };

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true });
    });

    // Check engagement every 10 seconds
    const engagementInterval = setInterval(checkEngagement, 10000);

    // Track engagement time on page unload
    const handleUnload = () => {
      const engagementTime = isActive ? Date.now() - startTime : lastActivity - startTime;
      trackEngagement('page_engagement', engagementTime);
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity);
      });
      clearInterval(engagementInterval);
      window.removeEventListener('beforeunload', handleUnload);
      
      // Track final engagement time
      const engagementTime = isActive ? Date.now() - startTime : lastActivity - startTime;
      trackEngagement('page_engagement', engagementTime);
    };
  }, []);
};

// Hook for form tracking
export const useFormTracking = (formName: string) => {
  const trackFormStart = () => {
    trackEvent('form_start', { form_name: formName });
  };

  const trackFormSubmit = (success: boolean, errorType?: string) => {
    trackEvent('form_submit', { 
      form_name: formName, 
      success,
      error_type: errorType 
    });
  };

  const trackFieldInteraction = (fieldName: string, action: 'focus' | 'blur' | 'change') => {
    trackUserInteraction(action, `${formName}_${fieldName}`);
  };

  return {
    trackFormStart,
    trackFormSubmit,
    trackFieldInteraction
  };
};

// Hook for video tracking
export const useVideoTracking = (videoTitle: string) => {
  const trackVideoPlay = () => {
    trackEvent('video_play', { video_title: videoTitle });
  };

  const trackVideoPause = () => {
    trackEvent('video_pause', { video_title: videoTitle });
  };

  const trackVideoComplete = () => {
    trackEvent('video_complete', { video_title: videoTitle });
  };

  const trackVideoProgress = (percentage: number) => {
    trackEvent('video_progress', { 
      video_title: videoTitle, 
      progress_percentage: percentage 
    });
  };

  return {
    trackVideoPlay,
    trackVideoPause,
    trackVideoComplete,
    trackVideoProgress
  };
};

// Hook for ecommerce tracking
export const useEcommerceTracking = () => {
  const trackProductView = (productId: string, productName: string, category: string, price: number) => {
    trackEvent('view_item', {
      currency: 'USD',
      value: price,
      items: [{
        item_id: productId,
        item_name: productName,
        item_category: category,
        price: price,
        quantity: 1
      }]
    });
  };

  const trackAddToCart = (productId: string, productName: string, price: number) => {
    trackEvent('add_to_cart', {
      currency: 'USD',
      value: price,
      items: [{
        item_id: productId,
        item_name: productName,
        price: price,
        quantity: 1
      }]
    });
  };

  const trackPurchase = (transactionId: string, value: number, items: any[]) => {
    trackEvent('purchase', {
      transaction_id: transactionId,
      value: value,
      currency: 'USD',
      items: items
    });
  };

  return {
    trackProductView,
    trackAddToCart,
    trackPurchase
  };
};