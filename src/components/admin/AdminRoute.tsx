import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SystemStatusDashboard from './SystemStatusDashboard';
import SupabaseSetupGuide from './SupabaseSetupGuide';

const AdminRoute: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'setup'>('dashboard');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple password check for demo (in production, use proper authentication)
    if (password === 'admin123' || password === 'pinoywest2024') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password. Try "admin123" or "pinoywest2024"');
    }
  };

  const checkSupabaseConfig = () => {
    const hasUrl = !!import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url_here';
    const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here';
    return hasUrl && hasKey;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg"
        >
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-blue-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
            <p className="text-gray-600">Enter password to access system dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="Admin Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error}
              placeholder="Enter admin password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />

            <Button type="submit" className="w-full">
              Access Dashboard
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Demo credentials:</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• admin123</li>
              <li>• pinoywest2024</li>
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }

  const isSupabaseConfigured = checkSupabaseConfig();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <Button
              variant={currentView === 'dashboard' ? 'primary' : 'outline'}
              onClick={() => setCurrentView('dashboard')}
              size="sm"
            >
              System Status
            </Button>
            <Button
              variant={currentView === 'setup' ? 'primary' : 'outline'}
              onClick={() => setCurrentView('setup')}
              size="sm"
            >
              Supabase Setup
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!isSupabaseConfigured && currentView === 'dashboard' && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <h3 className="font-medium text-yellow-900">Supabase Not Configured</h3>
                  <p className="text-yellow-800 text-sm">
                    Your Supabase credentials are not set up. 
                    <button 
                      onClick={() => setCurrentView('setup')}
                      className="underline ml-1"
                    >
                      Click here to set up Supabase
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {currentView === 'dashboard' ? <SystemStatusDashboard /> : <SupabaseSetupGuide />}
      </div>
    </div>
  );
};

export default AdminRoute;