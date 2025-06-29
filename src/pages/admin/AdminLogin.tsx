import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Key, Lock, AlertCircle, User } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AdminLogin: React.FC = () => {
  const [step, setStep] = useState<'login' | 'twoFactor'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) return;
      
      try {
        const token = localStorage.getItem('admin_session_token');
        if (!token) return;
        
        const { data, error } = await supabase.rpc('validate_admin_session', {
          session_token: token
        });
        
        if (error) throw error;
        
        if (data && data.length > 0 && data[0].is_valid) {
          // Already logged in, redirect to dashboard
          navigate('/admin/dashboard');
        }
      } catch (err) {
        console.error('Session validation error:', err);
        localStorage.removeItem('admin_session_token');
      }
    };
    
    checkSession();
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      if (!supabase) {
        throw new Error('Database connection not available');
      }
      
      // Verify credentials
      const { data, error } = await supabase.rpc('verify_password', {
        username,
        password
      });
      
      if (error) throw error;
      
      if (!data) {
        setError('Invalid username or password');
        return;
      }
      
      // Get user details to check if 2FA is enabled
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('two_factor_enabled')
        .eq('id', data)
        .single();
      
      if (adminError) throw adminError;
      
      setAdminId(data);
      
      // If 2FA is enabled, move to 2FA step
      if (adminData.two_factor_enabled) {
        setStep('twoFactor');
      } else {
        // Otherwise, create session and log in
        await createSession(data);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTwoFactorVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      if (!supabase || !adminId) {
        throw new Error('Invalid state');
      }
      
      // Verify TOTP code
      const { data, error } = await supabase.rpc('verify_totp_code', {
        admin_id: adminId,
        code: twoFactorCode
      });
      
      if (error) throw error;
      
      if (!data) {
        // Try backup code
        const { data: backupData, error: backupError } = await supabase.rpc('verify_backup_code', {
          admin_id: adminId,
          code: twoFactorCode
        });
        
        if (backupError) throw backupError;
        
        if (!backupData) {
          setError('Invalid verification code');
          return;
        }
      }
      
      // Create session
      await createSession(adminId);
    } catch (err) {
      console.error('2FA verification error:', err);
      setError('An error occurred during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const createSession = async (adminId: string) => {
    try {
      if (!supabase) {
        throw new Error('Database connection not available');
      }
      
      // Get client IP and user agent
      const ipAddress = 'client-side'; // In production, this would be handled server-side
      const userAgent = navigator.userAgent;
      
      // Create session
      const { data, error } = await supabase.rpc('create_admin_session', {
        admin_id: adminId,
        ip_address: ipAddress,
        user_agent: userAgent
      });
      
      if (error) throw error;
      
      // Store session token
      localStorage.setItem('admin_session_token', data);
      
      // Redirect to dashboard
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from);
    } catch (err) {
      console.error('Session creation error:', err);
      setError('An error occurred while creating your session. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <Shield className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center">Admin Authentication</h1>
          <p className="text-center text-blue-100 mt-2">
            Secure access to administration panel
          </p>
        </div>
        
        <div className="p-6">
          {step === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Input
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  icon={<User className="w-5 h-5 text-gray-400" />}
                  required
                  autoFocus
                />
              </div>
              
              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-5 h-5 text-gray-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                  required
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center text-red-700">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              <Button
                type="submit"
                loading={isLoading}
                className="w-full"
              >
                Sign In
              </Button>
              
              <div className="text-center">
                <a href="/admin/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot your password?
                </a>
              </div>
            </form>
          ) : (
            <form onSubmit={handleTwoFactorVerify} className="space-y-6">
              <div className="text-center mb-4">
                <div className="inline-flex p-3 bg-blue-100 rounded-full mb-4">
                  <Key className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Two-Factor Verification</h2>
                <p className="text-gray-600">
                  Enter the verification code from your authenticator app or use a backup code.
                </p>
              </div>
              
              <div>
                <Input
                  label="Verification Code"
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="Enter 6-digit code or backup code"
                  required
                  autoFocus
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center text-red-700">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              <Button
                type="submit"
                loading={isLoading}
                className="w-full"
              >
                Verify
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Lock className="w-4 h-4 mr-1" />
                <span>Secure Connection</span>
              </div>
              <div className="text-sm text-gray-500">
                {new Date().getFullYear()} © PinoyWest
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;