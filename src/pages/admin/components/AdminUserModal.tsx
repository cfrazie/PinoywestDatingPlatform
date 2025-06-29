import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Key, Shield, X, Eye, EyeOff, 
  AlertCircle, Check, Info
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';
import { AdminUser } from '../../../types/admin';

interface AdminUserModalProps {
  mode: 'create' | 'edit' | 'view';
  user: AdminUser | null;
  currentUserRole: string;
  onSave: () => void;
  onCancel: () => void;
}

const AdminUserModal: React.FC<AdminUserModalProps> = ({
  mode,
  user,
  currentUserRole,
  onSave,
  onCancel
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<string>('standard_admin');
  const [isActive, setIsActive] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize form with user data if editing
  useEffect(() => {
    if (user && (mode === 'edit' || mode === 'view')) {
      setUsername(user.username);
      setEmail(user.email);
      setRole(user.role);
      setIsActive(user.is_active);
      setTwoFactorEnabled(user.two_factor_enabled);
    }
  }, [user, mode]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (mode !== 'view') {
      if (!username.trim()) {
        setError('Username is required');
        return;
      }
      
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
        setError('Valid email is required');
        return;
      }
      
      if (mode === 'create') {
        if (!password) {
          setError('Password is required');
          return;
        }
        
        if (password.length < 8) {
          setError('Password must be at least 8 characters');
          return;
        }
        
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
      }
      
      // Role validation based on current user's role
      if (currentUserRole === 'senior_admin' && role !== 'standard_admin') {
        setError('Senior admins can only create standard admin accounts');
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      if (!supabase) {
        throw new Error('Database connection not available');
      }
      
      if (mode === 'create') {
        // Create new admin user
        const { data, error } = await supabase.rpc('create_admin_user', {
          username,
          email,
          password,
          role,
          created_by: user?.id // This should be the current user's ID, not the new user
        });
        
        if (error) throw error;
      } else if (mode === 'edit') {
        // Update existing admin user
        const { error } = await supabase
          .from('admin_users')
          .update({
            username,
            email,
            role,
            is_active: isActive,
            two_factor_enabled: twoFactorEnabled,
            updated_at: new Date().toISOString()
          })
          .eq('id', user?.id);
        
        if (error) throw error;
      }
      
      onSave();
    } catch (err) {
      console.error('Admin user save error:', err);
      setError('Failed to save admin user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getTitle = () => {
    if (mode === 'create') return 'Create Admin User';
    if (mode === 'edit') return 'Edit Admin User';
    return 'Admin User Details';
  };
  
  const getAvailableRoles = () => {
    if (currentUserRole === 'super_admin') {
      return [
        { value: 'super_admin', label: 'Super Admin' },
        { value: 'senior_admin', label: 'Senior Admin' },
        { value: 'standard_admin', label: 'Standard Admin' }
      ];
    } else if (currentUserRole === 'senior_admin') {
      return [
        { value: 'standard_admin', label: 'Standard Admin' }
      ];
    } else {
      return [
        { value: 'standard_admin', label: 'Standard Admin' }
      ];
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Username */}
            <div>
              <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={<User className="w-5 h-5 text-gray-400" />}
                disabled={mode === 'view'}
                required={mode !== 'view'}
              />
            </div>
            
            {/* Email */}
            <div>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-5 h-5 text-gray-400" />}
                disabled={mode === 'view'}
                required={mode !== 'view'}
              />
            </div>
            
            {/* Password (only for create mode) */}
            {mode === 'create' && (
              <>
                <div>
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Key className="w-5 h-5 text-gray-400" />}
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
                
                <div>
                  <Input
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    icon={<Key className="w-5 h-5 text-gray-400" />}
                    required
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Password Requirements</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li className="flex items-center">
                          <Check className={`w-4 h-4 mr-1 ${password.length >= 8 ? 'text-green-500' : 'text-gray-300'}`} />
                          At least 8 characters
                        </li>
                        <li className="flex items-center">
                          <Check className={`w-4 h-4 mr-1 ${/[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-300'}`} />
                          At least one uppercase letter
                        </li>
                        <li className="flex items-center">
                          <Check className={`w-4 h-4 mr-1 ${/[0-9]/.test(password) ? 'text-green-500' : 'text-gray-300'}`} />
                          At least one number
                        </li>
                        <li className="flex items-center">
                          <Check className={`w-4 h-4 mr-1 ${/[!@#$%^&*]/.test(password) ? 'text-green-500' : 'text-gray-300'}`} />
                          At least one special character
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={mode === 'view' || (mode === 'edit' && user?.role === 'super_admin' && currentUserRole !== 'super_admin')}
                  className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    mode === 'view' ? 'bg-gray-100' : ''
                  }`}
                >
                  {getAvailableRoles().map((roleOption) => (
                    <option key={roleOption.value} value={roleOption.value}>
                      {roleOption.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Status (only for edit and view modes) */}
            {(mode === 'edit' || mode === 'view') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={isActive ? 'active' : 'inactive'}
                    onChange={(e) => setIsActive(e.target.value === 'active')}
                    disabled={mode === 'view'}
                    className={`block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      mode === 'view' ? 'bg-gray-100' : ''
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            )}
            
            {/* Two-Factor Authentication */}
            {(mode === 'edit' || mode === 'view') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Two-Factor Authentication
                </label>
                <div className="relative">
                  <select
                    value={twoFactorEnabled ? 'enabled' : 'disabled'}
                    onChange={(e) => setTwoFactorEnabled(e.target.value === 'enabled')}
                    disabled={mode === 'view'}
                    className={`block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      mode === 'view' ? 'bg-gray-100' : ''
                    }`}
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center text-red-700">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            
            {mode !== 'view' && (
              <Button
                type="submit"
                loading={isLoading}
              >
                {mode === 'create' ? 'Create User' : 'Save Changes'}
              </Button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminUserModal;