import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug, Copy } from 'lucide-react';
import Button from '../ui/Button';
import { createAppError, generateErrorId, ErrorBoundaryState } from '../../lib/errorHandling';
import { errorLogger } from '../../lib/errorLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State extends ErrorBoundaryState {}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo
    });

    // Log error
    const appError = createAppError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      errorId: this.state.errorId
    });
    
    errorLogger.logError(appError);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleCopyError = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="bg-red-500 p-6 text-white">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 mr-3" />
                <div>
                  <h1 className="text-xl font-bold">Something went wrong</h1>
                  <p className="text-red-100">We're sorry for the inconvenience</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6">
                An unexpected error occurred. Our team has been automatically notified 
                and is working on a fix.
              </p>

              <div className="space-y-3 mb-6">
                <Button
                  onClick={this.handleRetry}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>

                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
              </div>

              {this.props.showDetails && (
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    <Bug className="w-4 h-4 inline mr-1" />
                    Technical Details
                  </summary>
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 space-y-2">
                      <div>
                        <strong>Error ID:</strong> {this.state.errorId}
                      </div>
                      <div>
                        <strong>Message:</strong> {this.state.error?.message}
                      </div>
                      <div>
                        <strong>Time:</strong> {new Date().toLocaleString()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={this.handleCopyError}
                      className="mt-2"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Error Details
                    </Button>
                  </div>
                </details>
              )}

              <div className="text-xs text-gray-500 text-center">
                Error ID: {this.state.errorId}
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;