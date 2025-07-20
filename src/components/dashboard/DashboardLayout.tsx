import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Heart, MessageCircle, Settings, Bell, Search,
  Menu, X, Home, Users, Star, Gift, Shield, LogOut,
  CreditCard, Calendar, Compass
} from 'lucide-react';
import Button from '../ui/Button';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  onTabChange
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const navigationItems = [
    { id: 'overview', label: 'Dashboard', icon: Home, href: '/dashboard' },
    { id: 'matches', label: 'Matches', icon: Heart, href: '/dashboard/matches' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, href: '/dashboard/messages' },
    { id: 'discover', label: 'Discover', icon: Compass, href: '/dashboard/discover' },
    { id: 'calls', label: 'Video Calls', icon: Calendar, href: '/dashboard/calls' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/dashboard/calendar' },
    { id: 'profile', label: 'My Profile', icon: User, href: '/dashboard/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
    { id: 'subscription', label: 'Subscription', icon: CreditCard, href: '/dashboard/subscription' },
    { id: 'notifications', label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
  ];

  // Testing function for navigation items
  const testNavigationItem = (itemId: string, itemLabel: string) => {
    try {
      onTabChange(itemId);
      setTestResults(prev => ({ ...prev, [itemLabel]: true }));
      console.log(`✅ Navigation: ${itemLabel} - PASSED`);
    } catch (error) {
      setTestResults(prev => ({ ...prev, [itemLabel]: false }));
      console.error(`❌ Navigation: ${itemLabel} - FAILED`, error);
    }
  };

  // Comprehensive navigation testing
  const testAllNavigation = () => {
    console.log('🧪 Testing All Navigation Items...');
    navigationItems.forEach(item => {
      testNavigationItem(item.id, item.label);
    });
    console.log('🎯 Navigation Testing Complete!');
  };

  const handleLogout = () => {
    // In production, this would handle actual logout
    console.log('Logging out...');
    alert('Logout functionality would be implemented here');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isSidebarOpen ? 0 : '-100%'
        }}
        className="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:translate-x-0 transition-transform duration-300 ease-in-out lg:shadow-none lg:border-r border-gray-200"
      >
        <div className="flex flex-col h-full">
                    testNavigationItem(item.id, item.label);
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PinoyWest</span>
            </div>
                  data-testid={`nav-${item.id}`}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Testing Panel - Development Only */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-4 border-t border-gray-200 bg-yellow-50">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">🧪 Navigation Testing</h4>
                <Button
                  size="sm"
                  onClick={testAllNavigation}
                  className="w-full mb-2"
                  data-testid="test-all-navigation"
                >
                  Test All Navigation
                </Button>
                <div className="text-xs space-y-1">
                  {Object.entries(testResults).map(([test, passed]) => (
                    <div key={test} className={`${passed ? 'text-green-600' : 'text-red-600'}`}>
                      {passed ? '✅' : '❌'} {test}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-pink-400 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Maria Santos</p>
                <p className="text-sm text-gray-500">Premium Member</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-gray-600 hover:text-red-600"
              data-testid="sidebar-logout-button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {activeTab === 'overview' ? 'Dashboard' : activeTab}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                onClick={() => {
                  console.log('Notifications clicked');
                  alert('Notifications panel would open');
                }}
                data-testid="notifications-bell"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                onClick={() => {
                  console.log('Gifts clicked');
                  alert('Gifts panel would open');
                }}
                data-testid="gifts-button"
              >
                <Gift className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;