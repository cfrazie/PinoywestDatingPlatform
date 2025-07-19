import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

interface ValidationErrorDisplayProps {
  errors: ValidationError[];
  onDismiss?: (field: string) => void;
  className?: string;
}

const ValidationErrorDisplay: React.FC<ValidationErrorDisplayProps> = ({
  errors,
  onDismiss,
  className = ''
}) => {
  if (errors.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <AnimatePresence>
        {errors.map((error, index) => (
          <motion.div
            key={`${error.field}-${index}`}
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-red-700">
                <span className="font-medium capitalize">{error.field}:</span> {error.message}
              </p>
            </div>
            
            {onDismiss && (
              <button
                onClick={() => onDismiss(error.field)}
                className="ml-2 text-red-400 hover:text-red-600 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook for managing validation errors
export const useValidationErrors = () => {
  const [errors, setErrors] = React.useState<ValidationError[]>([]);

  const addError = React.useCallback((field: string, message: string, code?: string) => {
    setErrors(prev => {
      // Remove existing error for this field
      const filtered = prev.filter(error => error.field !== field);
      return [...filtered, { field, message, code }];
    });
  }, []);

  const removeError = React.useCallback((field: string) => {
    setErrors(prev => prev.filter(error => error.field !== field));
  }, []);

  const clearErrors = React.useCallback(() => {
    setErrors([]);
  }, []);

  const hasError = React.useCallback((field: string) => {
    return errors.some(error => error.field === field);
  }, [errors]);

  const getError = React.useCallback((field: string) => {
    return errors.find(error => error.field === field);
  }, [errors]);

  const setFieldErrors = React.useCallback((fieldErrors: Record<string, string>) => {
    const newErrors = Object.entries(fieldErrors).map(([field, message]) => ({
      field,
      message
    }));
    setErrors(newErrors);
  }, []);

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    hasError,
    getError,
    setFieldErrors,
    hasErrors: errors.length > 0
  };
};

export default ValidationErrorDisplay;