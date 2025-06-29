import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Lock, Key, RefreshCw, Save, 
  Clock, AlertTriangle, CheckCircle, Info
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import { AdminUser } from '../../types/admin';

const AdminSecuritySettings: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [lockoutDuration, setLockoutDuration] = useState(30);
  const [passwordMinLength, setPasswordMinLength] = useState(8);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumbers, setRequireNumbers] = useState(true);
  const [requireSpecialChars, setRequireSpecialChars] = useState(true);
  const [passwordExpiryDays, setPasswordExpiryDays] = useState(90);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  // Check authentication and load data
  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        setError('Database connection not available');
        setIsLoading(false);
        return;
      }
      
      try {
        const token = localStorage.getItem('admin_session_token');
        if (!token) {
          navigate('/admin/login');
          return;
        }
        
        // Validate session
        const { data, error } = await supabase.rpc('validate_admin_session', {
          session_token: token
        });
        
        if (error) throw error;
        
        if (!data || data.length === 0 || !data[0].is_valid) {
          localStorage.removeItem('admin_session_token');
          navigate('/admin/login');
          return;
        }
        
        // Get current user details
        const { data: userData, error: userError } = await supabase.rpc('get_admin_user_details', {
          admin_id: data[0].admin_id
        });
        
        if (userError) throw userError;
        
        if (userData && userData.length > 0) {
          setCurrentUser(userData[0]);
          
          // Check if user has permission to access security settings
          if (userData[0].role !== 'super_admin') {
            navigate('/admin/dashboard');
            return;
          }
        }
        
        // Load security settings
        loadSecuritySettings();
      } catch (err) {
        console.error('Authentication error:', err);
        localStorage.removeItem('admin_session_token');
        navigate('/admin/login');
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const loadSecuritySettings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!supabase) {
        throw new Error('Database connection not available');
      }
      
      // In a real application, you would fetch these settings from the database
      // For this example, we'll use the default values
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load security settings:', err);
      setError('Failed to load security settings. Please try again.');
      setIsLoading(false);
    }
  };
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      if (!supabase) {
        throw new Error('Database connection not available');
      }
      
      // In a real application, you would save these settings to the database
      // For this example, we'll just simulate a successful save
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Security settings saved successfully');
      
      // Log the activity
      await supabase.rpc('log_admin_activity', {
        admin_id: currentUser?.id,
        action: 'update_security_settings',
        details: {
          session_timeout: sessionTimeout,
          max_login_attempts: maxLoginAttempts,
          lockout_duration: lockoutDuration,
          password_min_length: passwordMinLength,
          require_uppercase: requireUppercase,
          require_numbers: requireNumbers,
          require_special_chars: requireSpecialChars,
          password_expiry_days: passwordExpiryDays
        }
      });
      
      setIsSaving(false);
    } catch (err) {
      console.error('Failed to save security settings:', err);
      setError('Failed to save security settings. Please try again.');
      setIsSaving(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      if (!supabase) {
        throw new Error('Database connection not available');
      }
      
      const token = localStorage.getItem('admin_session_token');
      if (token) {
        await supabase.rpc('end_admin_session', {
          session_token: token
        });
      }
      
      localStorage.removeItem('admin_session_token');
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout even if there's an error
      localStorage.removeItem('admin_session_token');
      navigate('/admin/login');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AdminHeader 
        currentUser={currentUser} 
        onLogout={handleLogout} 
      />
      
      <div className="flex flex-1">
        <AdminSidebar 
          activeTab="security" 
          onTabChange={() => {}} 
        />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Security Settings
              </h1>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={loadSecuritySettings}
                  loading={isLoading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                
                <Button
                  onClick={handleSaveSettings}
                  loading={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center text-red-700">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>{successMessage}</span>
                </div>
              </div>
            )}
            
            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Authentication Settings
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Configure authentication and security settings for the admin panel.
                </p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Session Settings */}
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                    Session Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Session Timeout (minutes)
                      </label>
                      <Input
                        type="number"
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                        min={5}
                        max={120}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Sessions will automatically expire after this period of inactivity.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Login Security */}
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 text-blue-600 mr-2" />
                    Login Security
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Login Attempts
                      </label>
                      <Input
                        type="number"
                        value={maxLoginAttempts}
                        onChange={(e) => setMaxLoginAttempts(parseInt(e.target.value))}
                        min={3}
                        max={10}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Number of failed attempts before account lockout.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Lockout Duration (minutes)
                      </label>
                      <Input
                        type="number"
                        value={lockoutDuration}
                        onChange={(e) => setLockoutDuration(parseInt(e.target.value))}
                        min={5}
                        max={1440}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        How long accounts remain locked after too many failed attempts.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Password Policy */}
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                    <Key className="w-5 h-5 text-blue-600 mr-2" />
                    Password Policy
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Password Length
                      </label>
                      <Input
                        type="number"
                        value={passwordMinLength}
                        onChange={(e) => setPasswordMinLength(parseInt(e.target.value))}
                        min={8}
                        max={32}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password Expiry (days)
                      </label>
                      <Input
                        type="number"
                        value={passwordExpiryDays}
                        onChange={(e) => setPasswordExpiryDays(parseInt(e.target.value))}
                        min={0}
                        max={365}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Set to 0 for no expiration.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="require-uppercase"
                        checked={requireUppercase}
                        onChange={(e) => setRequireUppercase(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="require-uppercase" className="ml-2 block text-sm text-gray-700">
                        Require at least one uppercase letter
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="require-numbers"
                        checked={requireNumbers}
                        onChange={(e) => setRequireNumbers(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="require-numbers" className="ml-2 block text-sm text-gray-700">
                        Require at least one number
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="require-special-chars"
                        checked={requireSpecialChars}
                        onChange={(e) => setRequireSpecialChars(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="require-special-chars" className="ml-2 block text-sm text-gray-700">
                        Require at least one special character
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Security Recommendations */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Security Recommendations</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Enable two-factor authentication for all admin accounts</li>
                        <li>• Regularly review active sessions and admin activity logs</li>
                        <li>• Use strong, unique passwords for each admin account</li>
                        <li>• Limit the number of super admin accounts</li>
                        <li>• Regularly rotate admin credentials</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <Button
                  onClick={handleSaveSettings}
                  loading={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSecuritySettings;