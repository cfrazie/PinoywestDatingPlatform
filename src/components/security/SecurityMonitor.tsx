import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { validateEnvironment, logSecurityEvent } from '../../lib/security';

interface SecurityStatus {
  environment: boolean;
  headers: boolean;
  rateLimit: boolean;
  validation: boolean;
}

const SecurityMonitor: React.FC = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    environment: false,
    headers: false,
    rateLimit: false,
    validation: false
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (import.meta.env.NODE_ENV !== 'development') return;

    const checkSecurity = () => {
      const envValidation = validateEnvironment();
      
      setSecurityStatus({
        environment: envValidation.isValid,
        headers: checkSecurityHeaders(),
        rateLimit: checkRateLimit(),
        validation: checkValidation()
      });
    };

    checkSecurity();

    // Toggle visibility with keyboard shortcut
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const checkSecurityHeaders = (): boolean => {
    // Check if CSP is present
    const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    return metaTags.length > 0;
  };

  const checkRateLimit = (): boolean => {
    // Check if rate limiting is configured
    return typeof window !== 'undefined' && 
           document.querySelector('meta[name="rate-limit"]') !== null;
  };

  const checkValidation = (): boolean => {
    // Check if validation is working
    try {
      const { validateFormData } = require('../../lib/security');
      const testData = { test: '<script>alert("test")</script>' };
      const sanitized = validateFormData(testData);
      return !sanitized.test.includes('<script>');
    } catch {
      return false;
    }
  };

  if (import.meta.env.NODE_ENV !== 'development' || !isVisible) return null;

  const getStatusColor = (status: boolean) => status ? 'text-green-500' : 'text-red-500';
  const getStatusIcon = (status: boolean) => status ? CheckCircle : AlertTriangle;

  const overallSecurity = Object.values(securityStatus).every(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-20 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm"
    >
      <div className="flex items-center space-x-2 mb-3">
        <Shield className={`w-5 h-5 ${overallSecurity ? 'text-green-400' : 'text-red-400'}`} />
        <h3 className="font-semibold">Security Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-auto text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            Environment:
          </span>
          <div className="flex items-center">
            {React.createElement(getStatusIcon(securityStatus.environment), {
              className: `w-4 h-4 ${getStatusColor(securityStatus.environment)}`
            })}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            Headers:
          </span>
          <div className="flex items-center">
            {React.createElement(getStatusIcon(securityStatus.headers), {
              className: `w-4 h-4 ${getStatusColor(securityStatus.headers)}`
            })}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Rate Limit:
          </span>
          <div className="flex items-center">
            {React.createElement(getStatusIcon(securityStatus.rateLimit), {
              className: `w-4 h-4 ${getStatusColor(securityStatus.rateLimit)}`
            })}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            Validation:
          </span>
          <div className="flex items-center">
            {React.createElement(getStatusIcon(securityStatus.validation), {
              className: `w-4 h-4 ${getStatusColor(securityStatus.validation)}`
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-600">
        <div className={`text-xs font-medium ${overallSecurity ? 'text-green-400' : 'text-red-400'}`}>
          Status: {overallSecurity ? 'SECURE' : 'NEEDS ATTENTION'}
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-400">
        Press Ctrl+Shift+S to toggle
      </div>
    </motion.div>
  );
};

export default SecurityMonitor;