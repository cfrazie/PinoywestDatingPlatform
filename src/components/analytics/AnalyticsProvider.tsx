import React, { createContext, useContext, ReactNode } from 'react';
import { usePageTracking, useScrollTracking, useEngagementTracking } from '../../hooks/useAnalytics';
import { trackEvent, trackUserInteraction, trackConversion } from '../../services/analytics';

interface AnalyticsContextType {
  trackEvent: (eventName: string, parameters?: Record<string, any>) => void;
  trackUserInteraction: (action: string, element: string, value?: string) => void;
  trackConversion: (conversionType: string, value?: number, currency?: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  // Enable automatic tracking
  usePageTracking();
  useScrollTracking();
  useEngagementTracking();

  const contextValue: AnalyticsContextType = {
    trackEvent,
    trackUserInteraction,
    trackConversion
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};