import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AdminForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      if (!supabase) {
        throw new Error('Database connection not available');
      }
      
      // Check if email exists
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', email)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          setError('No admin account found with this email address');
        } else {
          throw error;
        }
        return;
      }
      
      // In a real application, you would:
      // 1. Generate a password reset token
      // 2. Store it in the database with an expiration
      // 3. Send an email with a reset link
      
      // For this example, we'll just simulate success
      setIsSubmitted(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-bold text-center">Reset Admin Password</h1>
          <p className="text-center text-blue-100 mt-2">
            Enter your email to receive password reset instructions
          </p>
        </div>
        
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center">
              <div className="inline-flex p-3 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-600 mb-6">
                If an account exists with the email <strong>{email}</strong>, we've sent instructions to reset your password.
              </p>
              <Link to="/admin/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-5 h-5 text-gray-400" />}
                  placeholder="Enter your admin email"
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
                Send Reset Instructions
              </Button>
              
              <div className="text-center">
                <Link to="/admin/login" className="text-sm text-blue-600 hover:text-blue-800">
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Shield className="w-4 h-4 mr-1" />
                <span>Admin Security</span>
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

export default AdminForgotPassword;