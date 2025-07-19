import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, RefreshCw, Home, MessageCircle, 
  Copy, ExternalLink, Bug, Shield 
} from 'lucide-react';
import Button from '../ui/Button';
import { AppError } from '../../lib/errorHandling';

interface ErrorFallbackProps {
  error?: AppError | Error;
  resetError?: () => void;
  title?: string;
  message?: string;
  showDetails?: boolean;
  showActions?: boolean;
  className?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = 'Something went wrong',
  message = 'We apologize for the inconvenience. Please try again or contact support if the problem persists.',
  showDetails = false,
  showActions = true,
  className = ''
}) => {
  const handleCopyError = () => {
    if (!error) return;
    
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
  };

  const handleReportError = () => {
    // In a real app, this would open a support ticket or feedback form
    const subject = encodeURIComponent('Error Report');
    const body = encodeURIComponent(`
Error: ${error?.message || 'Unknown error'}
URL: ${window.location.href}
Time: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:
    `);
    
    window.open(`mailto:support@pinoywest.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className={`flex items-center justify-center min-h-96 p-4 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="mb-6">
          <div className="inline-flex p-4 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">{message}</p>
        </div>

        {showActions && (
          <div className="space-y-3 mb-6">
            {resetError && (
              <Button
                onClick={resetError}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>

              <Button
                variant="outline"
                onClick={handleReportError}
                className="flex-1"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Report
              </Button>
            </div>
          </div>
        )}

        {showDetails && error && (
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-3">
              <Bug className="w-4 h-4 inline mr-1" />
              Technical Details
            </summary>
            <div className="bg-gray-50 p-4 rounded-lg text-xs">
              <div className="space-y-2 text-gray-600">
                <div>
                  <strong>Error:</strong> {error.message}
                </div>
                <div>
                  <strong>Type:</strong> {error.name}
                </div>
                <div>
                  <strong>Time:</strong> {new Date().toLocaleString()}
                </div>
                <div>
                  <strong>URL:</strong> {window.location.href}
                </div>
              </div>
              
              <div className="flex space-x-2 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyError}
                  className="text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => console.error('Error Details:', error)}
                    className="text-xs"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Console
                  </Button>
                )}
              </div>
            </div>
          </details>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <Shield className="w-3 h-3 inline mr-1" />
          Your data is safe and secure
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorFallback;