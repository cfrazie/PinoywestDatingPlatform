import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';

type Status = 'loading' | 'success' | 'error' | 'already_verified';

const VerifyEmail: React.FC = () => {
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) {
      setStatus('error');
      setErrorMessage('Authentication service is not available.');
      return;
    }

    // Supabase handles the token from the URL fragment automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        if (session.user.email_confirmed_at) {
          setStatus('success');
          // Redirect to dashboard after a short delay
          setTimeout(() => navigate('/dashboard', { replace: true }), 3000);
        } else {
          setStatus('error');
          setErrorMessage('Email confirmation could not be verified. The link may have expired.');
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.user.email_confirmed_at) {
        setStatus('success');
        setTimeout(() => navigate('/dashboard', { replace: true }), 3000);
      }
    });

    // Also check current session (in case the user is already verified and revisiting)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user.email_confirmed_at) {
        setStatus('already_verified');
      } else if (!window.location.hash.includes('access_token')) {
        // No hash token in URL means invalid/direct navigation
        setStatus('error');
        setErrorMessage('This verification link is invalid or has already been used.');
      }
      // Otherwise still loading — waiting for onAuthStateChange
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center"
      >
        {/* Logo */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">PinoyWest</span>
          </Link>
        </div>

        {status === 'loading' && (
          <>
            <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email…</h2>
            <p className="text-gray-500 text-sm">Please wait while we confirm your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email verified!</h2>
            <p className="text-gray-600 mb-2">Your email address has been verified successfully.</p>
            <p className="text-gray-500 text-sm mb-6">Redirecting you to your dashboard…</p>
            <Button variant="primary" component={Link} to="/dashboard" className="w-full">
              Go to Dashboard
            </Button>
          </>
        )}

        {status === 'already_verified' && (
          <>
            <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Already verified</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your email address is already verified. You can sign in and start using PinoyWest.
            </p>
            <Button variant="primary" component={Link} to="/dashboard" className="w-full">
              Go to Dashboard
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification failed</h2>
            <p className="text-gray-600 mb-2">
              {errorMessage || 'We could not verify your email address.'}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Verification links expire after 24 hours. Please sign up again or request a new link.
            </p>
            <div className="space-y-3">
              <Button variant="primary" component={Link} to="/sign-up" className="w-full">
                Sign Up Again
              </Button>
              <Button variant="outline" component={Link} to="/sign-in" className="w-full">
                Back to Sign In
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
