import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Key, Copy, ArrowLeft, AlertCircle, 
  CheckCircle, Smartphone, QrCode
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AdminTwoFactorSetup: React.FC = () => {
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check authentication and load 2FA data
  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        setError('Database connection not available');
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
        
        setAdminId(data[0].admin_id);
        
        // Generate TOTP secret
        const { data: secretData, error: secretError } = await supabase.rpc('generate_totp_secret', {
          admin_id: data[0].admin_id
        });
        
        if (secretError) throw secretError;
        
        if (secretData) {
          setSecret(secretData);
          
          // Get backup codes
          const { data: twoFactorData, error: twoFactorError } = await supabase
            .from('admin_two_factor')
            .select('backup_codes, verified')
            .eq('admin_id', data[0].admin_id)
            .single();
          
          if (twoFactorError && twoFactorError.code !== 'PGRST116') {
            throw twoFactorError;
          }
          
          if (twoFactorData) {
            setBackupCodes(twoFactorData.backup_codes || []);
            setIsVerified(twoFactorData.verified);
          }
          
          // Generate QR code URL
          const appName = 'PinoyWest Admin';
          const username = data[0].username;
          const qrUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(username)}?secret=${secretData}&issuer=${encodeURIComponent(appName)}`;
          
          // In a real application, you would generate a QR code image
          // For this example, we'll just use the URL
          setQrCodeUrl(qrUrl);
        }
      } catch (err) {
        console.error('Authentication error:', err);
        localStorage.removeItem('admin_session_token');
        navigate('/admin/login');
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleVerify = async (e: React.FormEvent) => {
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
        code: verificationCode
      });
      
      if (error) throw error;
      
      if (!data) {
        setError('Invalid verification code. Please try again.');
        return;
      }
      
      // Update user's 2FA status
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({
          two_factor_enabled: true
        })
        .eq('id', adminId);
      
      if (updateError) throw updateError;
      
      setIsVerified(true);
      
      // Log the activity
      await supabase.rpc('log_admin_activity', {
        admin_id: adminId,
        action: 'enable_2fa'
      });
    } catch (err) {
      console.error('2FA verification error:', err);
      setError('An error occurred during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
              <Key className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center">Two-Factor Authentication</h1>
          <p className="text-center text-blue-100 mt-2">
            Set up 2FA to enhance your account security
          </p>
        </div>
        
        <div className="p-6">
          {isVerified ? (
            <div className="text-center">
              <div className="inline-flex p-3 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">2FA Successfully Enabled</h2>
              <p className="text-gray-600 mb-6">
                Your account is now protected with two-factor authentication.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-medium text-yellow-800 mb-1">Save Your Backup Codes</h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      Store these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="bg-white p-2 rounded border border-yellow-300 flex items-center justify-between">
                          <code className="text-sm font-mono">{code}</code>
                          <button
                            onClick={() => copyToClipboard(code)}
                            className="text-yellow-600 hover:text-yellow-800"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                variant="primary"
                onClick={() => navigate('/admin/dashboard')}
                className="w-full"
              >
                Continue to Dashboard
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 bg-blue-100 rounded-full mb-4">
                    <Smartphone className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Set Up Authenticator App</h2>
                  <p className="text-gray-600">
                    Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Step 1: Scan QR Code</h3>
                    <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <QrCode className="w-32 h-32 mx-auto text-gray-700" />
                        <p className="text-xs text-gray-500 mt-2">
                          Scan with your authenticator app
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Step 2: Or Enter Code Manually</h3>
                    <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
                      <code className="text-sm font-mono">{secret}</code>
                      <button
                        onClick={() => copyToClipboard(secret)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Step 3: Verify Setup</h3>
                      <Input
                        label="Enter 6-digit code from your app"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="000000"
                        required
                        pattern="[0-9]{6}"
                        maxLength={6}
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
                      Verify and Enable 2FA
                    </Button>
                  </form>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Link to="/admin/dashboard" className="text-sm text-blue-600 hover:text-blue-800">
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  Skip for now
                </Link>
              </div>
            </>
          )}
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Shield className="w-4 h-4 mr-1" />
                <span>Enhanced Security</span>
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

export default AdminTwoFactorSetup;