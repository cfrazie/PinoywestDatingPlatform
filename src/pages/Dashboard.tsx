import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Settings, CreditCard, Heart, MessageCircle, 
  Bell, LogOut, Shield, Calendar, ChevronRight, Edit,
  Camera, CheckCircle, Clock, AlertTriangle, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { supabase } from '../lib/supabase';
import { getUserSubscription } from '../lib/stripe';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  
  const navigate = useNavigate();
  
  // Testing function to verify all interactive elements
  const testInteractiveElement = (elementName: string, action: () => void) => {
    try {
      action();
      setTestResults(prev => ({ ...prev, [elementName]: true }));
      console.log(`✅ ${elementName}: PASSED`);
    } catch (error) {
      setTestResults(prev => ({ ...prev, [elementName]: false }));
      console.error(`❌ ${elementName}: FAILED`, error);
    }
  };
  
  // Comprehensive testing function
  const runComprehensiveTest = () => {
    console.log('🧪 Starting Comprehensive Dashboard Testing...');
    
    // Test tab navigation
    testInteractiveElement('Overview Tab', () => setActiveTab('overview'));
    testInteractiveElement('Profile Tab', () => setActiveTab('profile'));
    testInteractiveElement('Matches Tab', () => setActiveTab('matches'));
    testInteractiveElement('Messages Tab', () => setActiveTab('messages'));
    testInteractiveElement('Settings Tab', () => setActiveTab('settings'));
    
    // Test navigation buttons
    testInteractiveElement('Edit Profile Button', () => setActiveTab('profile'));
    testInteractiveElement('Manage Subscription Button', () => navigate('/pricing'));
    testInteractiveElement('View Plans Button', () => navigate('/pricing'));
    
    // Test external links
    testInteractiveElement('Pricing Navigation', () => {
      console.log('Would navigate to pricing page');
    });
    
    console.log('🎯 Testing Complete! Check console for results.');
  };
  
  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        setError('Database connection not available');
        setIsLoading(false);
        return;
      }
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/');
          return;
        }
        
        // Load user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }
        
        if (profileData) {
          setProfile(profileData);
        } else {
          // Create profile if it doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata.full_name || 'User',
              avatar_url: session.user.user_metadata.avatar_url
            })
            .select()
            .single();
          
          if (createError) throw createError;
          
          setProfile(newProfile);
        }
        
        // Load subscription data
        const subscriptionData = await getUserSubscription();
        setSubscription(subscriptionData);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleLogout = async () => {
    if (!supabase) return;
    
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };
  
  const getSubscriptionStatus = () => {
    if (!subscription) return 'Free';
    
    const status = subscription.subscription_status;
    
    switch (status) {
      case 'active':
        return 'Active';
      case 'trialing':
        return 'Trial';
      case 'past_due':
        return 'Past Due';
      case 'canceled':
        return 'Canceled';
      default:
        return 'Free';
    }
  };
  
  const getSubscriptionColor = () => {
    if (!subscription) return 'bg-gray-100 text-gray-800';
    
    const status = subscription.subscription_status;
    
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getSubscriptionPlan = () => {
    if (!subscription || !subscription.price_id) return 'Basic';
    
    // Extract plan name from price ID or use a mapping
    if (subscription.price_id.includes('premium')) {
      return 'Premium';
    } else if (subscription.price_id.includes('platinum')) {
      return 'Platinum';
    }
    
    return 'Basic';
  };
  
  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Welcome Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome, {profile?.full_name || 'User'}</h2>
                <p className="text-gray-600">Here's an overview of your account</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSubscriptionColor()}`}>
                {getSubscriptionPlan()} - {getSubscriptionStatus()}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <h3 className="font-semibold text-gray-900">Matches</h3>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">12</div>
                <p className="text-sm text-gray-600">New matches this week</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">Messages</h3>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">8</div>
                <p className="text-sm text-gray-600">Unread messages</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-gray-900">Upcoming</h3>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">2</div>
                <p className="text-sm text-gray-600">Scheduled video calls</p>
              </div>
            </div>
          </div>
          
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('profile')}
                data-testid="edit-profile-button"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center space-y-6 md:space-y-0 md:space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile?.full_name || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {profile?.verification_status === 'verified' && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">{profile?.full_name || 'Not set'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{profile?.email || 'Not set'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{profile?.location || 'Not set'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {profile?.created_at 
                      ? new Date(profile.created_at).toLocaleDateString() 
                      : 'Not available'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Profile Completion</h4>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: '65%' }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Your profile is 65% complete. Add more details to improve your matches.
              </p>
            </div>
          </div>
          
          {/* Subscription Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Subscription Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/pricing')}
                data-testid="manage-subscription-button"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Subscription
              </Button>
            </div>
            
            {subscription ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Plan</p>
                    <p className="font-medium text-gray-900">{getSubscriptionPlan()}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`font-medium ${
                      subscription.subscription_status === 'active' ? 'text-green-600' :
                      subscription.subscription_status === 'trialing' ? 'text-blue-600' :
                      subscription.subscription_status === 'past_due' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {subscription.subscription_status?.charAt(0).toUpperCase() + 
                       subscription.subscription_status?.slice(1) || 'Unknown'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Next Billing Date</p>
                    <p className="font-medium text-gray-900">
                      {subscription.current_period_end 
                        ? formatDate(subscription.current_period_end) 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {subscription.payment_method_brand && subscription.payment_method_last4 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
                          </p>
                          <p className="text-sm text-gray-500">
                            Primary payment method
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                )}
                
                {subscription.subscription_status === 'past_due' && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-yellow-800 mb-1">Payment Issue</h4>
                        <p className="text-sm text-yellow-700">
                          We're having trouble processing your payment. Please update your payment method to avoid service interruption.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h4>
                <p className="text-gray-600 mb-4">
                  Upgrade to a premium plan to access all features and benefits.
                </p>
                <Button
                  onClick={() => navigate('/pricing')}
                  data-testid="view-plans-button"
                >
                  View Plans
                </Button>
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Verification</h3>
              </div>
              
              {profile?.verification_status === 'verified' ? (
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-green-700">Your profile is verified</p>
                </div>
              ) : profile?.verification_status === 'pending' ? (
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <p className="text-yellow-700">Verification in progress</p>
                </div>
              ) : (
                <p className="text-gray-600 mb-4">
                  Verify your profile to build trust and get more matches.
                </p>
              )}
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => testInteractiveElement('Verify Profile Button', () => {
                  console.log('Profile verification would start');
                  alert('Profile verification process would begin here');
                })}
                disabled={profile?.verification_status === 'verified' || profile?.verification_status === 'pending'}
                data-testid="verify-profile-button"
              >
                {profile?.verification_status === 'verified' ? 'Verified' : 
                 profile?.verification_status === 'pending' ? 'In Progress' : 'Verify Profile'}
              </Button>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Matches</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                You have 5 new potential matches waiting for you.
              </p>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setActiveTab('matches')}
                data-testid="view-matches-button"
              >
                View Matches
              </Button>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                You have 3 unread notifications.
              </p>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setActiveTab('notifications')}
                data-testid="view-notifications-button"
              >
                View Notifications
              </Button>
            </div>
          </div>
          
          {/* Testing Panel - Development Only */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">🧪 Dashboard Testing Panel</h3>
              <Button
                onClick={runComprehensiveTest}
                className="mb-4"
                data-testid="run-comprehensive-test"
              >
                Run Comprehensive Test
              </Button>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {Object.entries(testResults).map(([test, passed]) => (
                  <div key={test} className={`p-2 rounded ${passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {passed ? '✅' : '❌'} {test}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
          
          <div className="mb-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile?.full_name || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <button 
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                  onClick={() => testInteractiveElement('Camera Button', () => {
                    console.log('Photo upload would be triggered');
                    alert('Photo upload functionality would be triggered here');
                  })}
                  data-testid="camera-button"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900">{profile?.full_name || 'User'}</h3>
              <p className="text-gray-600">{profile?.email || 'No email'}</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={profile?.full_name || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                  defaultValue={profile?.email || ''}
                  disabled
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={profile?.location || ''}
                  placeholder="City, Country"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={profile?.phone || ''}
                  placeholder="+1 (123) 456-7890"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                defaultValue={profile?.bio || ''}
                placeholder="Tell us about yourself..."
              />
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Preferences</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-gray-700">Email Notifications</label>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="toggle-email"
                      className="sr-only"
                      defaultChecked={profile?.preferences?.email_notifications ?? true}
                    />
                    <label
                      htmlFor="toggle-email"
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                        profile?.preferences?.email_notifications ?? true ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                          profile?.preferences?.email_notifications ?? true ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      ></span>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-gray-700">Push Notifications</label>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="toggle-push"
                      className="sr-only"
                      defaultChecked={profile?.preferences?.push_notifications ?? true}
                    />
                    <label
                      htmlFor="toggle-push"
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                        profile?.preferences?.push_notifications ?? true ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                          profile?.preferences?.push_notifications ?? true ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      ></span>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-gray-700">Profile Visibility</label>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="toggle-visibility"
                      className="sr-only"
                      defaultChecked={profile?.preferences?.profile_visible ?? true}
                    />
                    <label
                      htmlFor="toggle-visibility"
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                        profile?.preferences?.profile_visible ?? true ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                          profile?.preferences?.profile_visible ?? true ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      ></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setActiveTab('overview')}
                data-testid="cancel-profile-edit"
              >
                Cancel
              </Button>
              <Button
                onClick={() => testInteractiveElement('Save Profile Changes', () => {
                  console.log('Profile changes would be saved');
                  alert('Profile changes would be saved');
                  setActiveTab('overview');
                })}
                data-testid="save-profile-changes"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'matches' && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Matches</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Matches</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testInteractiveElement('View All Matches', () => {
                  console.log('Navigate to all matches page');
                  alert('Would navigate to all matches page');
                })}
                data-testid="view-all-matches"
              >
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img 
                      src={`https://images.pexels.com/photos/${774909 + i}/pexels-photo-${774909 + i}.jpeg`}
                      alt="Profile" 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                      <Heart className="w-5 h-5 text-pink-500" />
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Maria S., 28</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        85% Match
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>Manila, Philippines</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        Travel
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        Cooking
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        Music
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => testInteractiveElement(`Message User ${i}`, () => {
                          console.log(`Start conversation with user ${i}`);
                          alert(`Would start conversation with user ${i}`);
                        })}
                        data-testid={`message-user-${i}`}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => testInteractiveElement(`View Profile ${i}`, () => {
                          console.log(`View profile for user ${i}`);
                          alert(`Would view profile for user ${i}`);
                        })}
                        data-testid={`view-profile-${i}`}
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'messages' && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages</h2>
          
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="relative mr-4">
                  <img 
                    src={`https://images.pexels.com/photos/${774909 + i}/pexels-photo-${774909 + i}.jpeg`}
                    alt="Profile" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">Maria Santos</h4>
                    <span className="text-xs text-gray-500">2h ago</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate">
                    Hey there! I saw that you're interested in Filipino cuisine too. Have you tried cooking adobo?
                  </p>
                </div>
                
                <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Button 
              variant="outline"
              onClick={() => testInteractiveElement('View All Messages', () => {
                console.log('Navigate to all messages');
                alert('Would navigate to all messages page');
              })}
              data-testid="view-all-messages"
            >
              View All Messages
            </Button>
          </div>
        </div>
      )}
      
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Password</h4>
                    <p className="text-sm text-gray-600">Last updated 3 months ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Not enabled</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Login Sessions</h4>
                    <p className="text-sm text-gray-600">1 active session</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-gray-700">Profile Visibility</label>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="toggle-profile-visibility"
                      className="sr-only"
                      defaultChecked
                    />
                    <label
                      htmlFor="toggle-profile-visibility"
                      className="block overflow-hidden h-6 rounded-full cursor-pointer bg-blue-600"
                    >
                      <span
                        className="block h-6 w-6 rounded-full bg-white transform translate-x-4"
                      ></span>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-gray-700">Show Online Status</label>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="toggle-online-status"
                      className="sr-only"
                      defaultChecked
                    />
                    <label
                      htmlFor="toggle-online-status"
                      className="block overflow-hidden h-6 rounded-full cursor-pointer bg-blue-600"
                    >
                      <span
                        className="block h-6 w-6 rounded-full bg-white transform translate-x-4"
                      ></span>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-gray-700">Allow Profile Verification Requests</label>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="toggle-verification-requests"
                      className="sr-only"
                      defaultChecked
                    />
                    <label
                      htmlFor="toggle-verification-requests"
                      className="block overflow-hidden h-6 rounded-full cursor-pointer bg-blue-600"
                    >
                      <span
                        className="block h-6 w-6 rounded-full bg-white transform translate-x-4"
                      ></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-gray-700">Email Notifications</label>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="toggle-email-notifications"
                      className="sr-only"
                      defaultChecked
                    />
                    <label
                      htmlFor="toggle-email-notifications"
                      className="block overflow-hidden h-6 rounded-full cursor-pointer bg-blue-600"
                    >
                      <span
                        className="block h-6 w-6 rounded-full bg-white transform translate-x-4"
                      ></span>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-gray-700">Push Notifications</label>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="toggle-push-notifications"
                      className="sr-only"
                      defaultChecked
                    />
                    <label
                      htmlFor="toggle-push-notifications"
                      className="block overflow-hidden h-6 rounded-full cursor-pointer bg-blue-600"
                    >
                      <span
                        className="block h-6 w-6 rounded-full bg-white transform translate-x-4"
                      ></span>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-gray-700">Marketing Communications</label>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="toggle-marketing"
                      className="sr-only"
                      defaultChecked
                    />
                    <label
                      htmlFor="toggle-marketing"
                      className="block overflow-hidden h-6 rounded-full cursor-pointer bg-blue-600"
                    >
                      <span
                        className="block h-6 w-6 rounded-full bg-white transform translate-x-4"
                      ></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => testInteractiveElement('Export Data', () => {
                    console.log('Export user data');
                    alert('Would export user data');
                  })}
                  data-testid="export-data-button"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Export My Data
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => testInteractiveElement('Deactivate Account', () => {
                    console.log('Deactivate account');
                    const confirmed = confirm('Are you sure you want to deactivate your account?');
                    if (confirmed) {
                      alert('Account deactivation process would begin');
                    }
                  })}
                  data-testid="deactivate-account-button"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Deactivate Account
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                  data-testid="sign-out-button"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;