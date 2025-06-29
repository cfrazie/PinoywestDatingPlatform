import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { NotificationProvider } from './notifications/NotificationProvider';
import Header from './layout/Header';
import Footer from './layout/Footer';

function App() {
  return (
    <NotificationProvider userId="demo_user">
      <div className="min-h-screen bg-white">
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

        {/* Header */}
        <Header />

        {/* Main content */}
        <main>
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
        <Footer />

        {/* Development tools */}
        <ImagePerformanceMonitor />
        <SecurityMonitor />
      </div>
    </NotificationProvider>
  );
}