import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/error/ErrorBoundary';
import { ErrorProvider } from './components/error/ErrorProvider';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import StickyNavigation from './components/navigation/StickyNavigation';
import MobileBottomNavigation from './components/navigation/MobileBottomNavigation';
import SkipNavigation from './components/navigation/SkipNavigation';
import Hero from './components/sections/Hero';
import Features from './components/sections/Features';
import Testimonials from './components/sections/Testimonials';
import Pricing from './components/sections/Pricing';
import Contact from './components/sections/Contact';
import Newsletter from './components/sections/Newsletter';
import MessagingDemo from './components/sections/MessagingDemo';
import VideoCallDemo from './components/sections/VideoCallDemo';
import PaymentDemo from './components/sections/PaymentDemo';
import AdvancedSearchDemo from './components/search/AdvancedSearchDemo';
import Dashboard from './pages/Dashboard';
import CulturalProfilesDemo from './components/cultural/CulturalProfilesDemo';
import CulturalCalendar from './components/cultural/CulturalCalendar';
import ImagePerformanceMonitor from './components/performance/ImagePerformanceMonitor';
import SecurityMonitor from './components/security/SecurityMonitor';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSecuritySettings from './pages/admin/AdminSecuritySettings';
import AdminForgotPassword from './pages/admin/AdminForgotPassword';
import AdminTwoFactorSetup from './pages/admin/AdminTwoFactorSetup';
import AdminBackupSettings from './pages/admin/AdminBackupSettings';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCanceled from './pages/CheckoutCanceled';
import DashboardTesting from './pages/DashboardTesting';
import { LiveStreamPage } from './components/LiveStream/LiveStreamPage';
import LiveStreamBrowsePage from './pages/LiveStreamBrowse';
// import AdminRoute from './components/admin/AdminRoute';
import { AnalyticsProvider } from './components/analytics/AnalyticsProvider';
import { trackEventSecure, initializeSecurity } from './services/secureApi';
import { validateEnvironment } from './lib/security';
import { usePreloadCriticalImages } from './hooks/useImagePreloader';
import { logError } from './lib/errorLogger';

// Add custom CSS for animations
const customStyles = `
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
  
  .animate-blob {
    animation: blob 7s infinite;
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  .animation-delay-4000 {
    animation-delay: 4s;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

function App() {
  // Preload critical images
  usePreloadCriticalImages();
  
  // Check if we're on admin route
  const isAdminRoute = window.location.pathname.startsWith('/admin') && 
                      !window.location.pathname.startsWith('/admin/login') &&
                      !window.location.pathname.startsWith('/admin/dashboard') &&
                      !window.location.pathname.startsWith('/admin/security') &&
                      !window.location.pathname.startsWith('/admin/forgot-password') &&
                      !window.location.pathname.startsWith('/admin/two-factor-setup');
  
  // Handle admin route access
  if (isAdminRoute) {
    // return <AdminRoute />;
    return <Navigate to="/admin/login" replace />;
  }

  useEffect(() => {
    // Add custom styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = customStyles;
    document.head.appendChild(styleSheet);

    // Initialize security monitoring
    initializeSecurity();
    
    // Validate environment configuration
    const envValidation = validateEnvironment();
    if (!envValidation.isValid) {
      console.warn('Environment configuration issues:', envValidation.errors);
    }

    // Track page view with secure tracking
    trackEventSecure('page_view', { page: 'landing' });

    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      logError(new Error(event.reason), { type: 'unhandled_promise_rejection' });
    };

    // Global error handler for JavaScript errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      logError(event.error, { 
        type: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup
    return () => {
      document.head.removeChild(styleSheet);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <ErrorProvider>
        <AnalyticsProvider>
          <Router>
            <div className="min-h-screen bg-white">
              {/* Skip Navigation for Accessibility */}
              <SkipNavigation />
              
              {/* Toast notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />

              <Routes>
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/checkout/canceled" element={<CheckoutCanceled />} />
                <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/*" element={<Dashboard />} />
                <Route path="/dashboard-testing" element={<DashboardTesting />} />
                
                {/* Live Stream Routes */}
                <Route path="/live" element={<LiveStreamBrowsePage />} />
                <Route path="/live/:streamId" element={<LiveStreamPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/security" element={<AdminSecuritySettings />} />
                <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
                <Route path="/admin/two-factor-setup" element={<AdminTwoFactorSetup />} />
                <Route path="/admin/backup" element={<AdminBackupSettings />} />
                
                <Route path="/" element={
                  <>
                    {/* Header */}
                    <Header id="navigation" />

                    {/* Sticky Navigation */}
                    <StickyNavigation
                      sections={[
                        { id: 'features', label: 'Features' },
                        { id: 'testimonials', label: 'Stories' },
                        { id: 'messaging', label: 'Messaging' },
                        { id: 'pricing', label: 'Pricing' },
                        { id: 'contact', label: 'Contact' }
                      ]}
                    />

                    {/* Main content */}
                    <main id="main-content">
                      <Hero />
                      <Features />
                      <Testimonials />
                      <MessagingDemo />
                      <VideoCallDemo />
                      <PaymentDemo />
                      <AdvancedSearchDemo />
                      <CulturalProfilesDemo />
                      <CulturalCalendar />
                      <Pricing />
                      <Newsletter />
                      <Contact />
                    </main>

                    {/* Footer */}
                    <Footer id="footer" />

                    {/* Mobile Bottom Navigation */}
                    <MobileBottomNavigation />

                    {/* Development tools */}
                    <ImagePerformanceMonitor />
                    <SecurityMonitor />
                  </>
                } />
              </Routes>
            </div>
          </Router>
        </AnalyticsProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}

export default App;