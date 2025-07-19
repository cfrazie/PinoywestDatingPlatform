import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { useForm } from '../../hooks/useForm';
import { contactFormSchema, ContactFormData } from '../../lib/validations';
import { submitContactFormEnhanced } from '../../services/enhancedApi';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { useError } from '../error/ErrorProvider';
import ValidationErrorDisplay, { useValidationErrors } from '../error/ValidationErrorDisplay';
import { ValidationError } from '../../lib/errorHandling';

const Contact: React.FC = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver();
  const { showError } = useError();
  const { 
    errors: validationErrors, 
    addError, 
    removeError, 
    clearErrors,
    hasErrors 
  } = useValidationErrors();
  
  const { 
    executeWithRetry, 
    isRetrying, 
    error: submitError,
    clearError 
  } = useErrorHandler({
    maxRetries: 3,
    onError: (error) => {
      if (error.code === 'VALIDATION_ERROR') {
        // Handle validation errors
        const validationError = error.context?.originalError;
        if (validationError instanceof ValidationError && validationError.field) {
          addError(validationError.field, validationError.message);
        } else {
          showError(error);
        }
      } else {
        showError(error, { 
          onRetry: () => {
            clearError();
            handleSubmit();
          }
        });
      }
    }
  });

  const {
    values,
    isSubmitting,
    handleChange,
    handleSubmit: handleFormSubmit,
  } = useForm<ContactFormData>({
    initialValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
    validationSchema: contactFormSchema,
    onSubmit: async (data) => {
      clearErrors();
      await handleSubmit(data);
    },
  });

  const handleSubmit = async (data?: ContactFormData) => {
    const formData = data || values;
    
    const result = await executeWithRetry(async () => {
      return await submitContactFormEnhanced(formData);
    });
    
    if (result?.message) {
      // Show success message
      showError({
        code: 'SUCCESS',
        message: result.message,
        userMessage: result.message,
        severity: 'low',
        timestamp: new Date().toISOString()
      } as any, {
        autoHide: true,
        duration: 3000
      });
    }
  };

  const handleFieldChange = (field: keyof ContactFormData, value: string) => {
    handleChange(field, value);
    // Clear validation error for this field when user starts typing
    if (hasErrors) {
      removeError(field);
    }
  };
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'support@pinoywest.com',
      description: 'Send us an email anytime',
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+1 (555) 123-4567',
      description: 'Mon-Fri from 8am to 6pm PST',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content: 'San Francisco, CA',
      description: 'Our headquarters',
    },
    {
      icon: Clock,
      title: 'Support Hours',
      content: '24/7 Available',
      description: 'We\'re here to help anytime',
    },
  ];

  return (
    <section id="contact" ref={elementRef} className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about finding your perfect match? We're here to help you 
            start your cross-cultural love journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isIntersecting ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white p-8 rounded-2xl shadow-lg"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Send us a message</h3>
              <p className="text-gray-600">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Validation Errors */}
              <ValidationErrorDisplay 
                errors={validationErrors}
                onDismiss={removeError}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  type="text"
                  value={values.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  error={validationErrors.find(e => e.field === 'name')?.message}
                  placeholder="Your full name"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={values.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  error={validationErrors.find(e => e.field === 'email')?.message}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <Input
                label="Subject"
                type="text"
                value={values.subject}
                onChange={(e) => handleFieldChange('subject', e.target.value)}
                error={validationErrors.find(e => e.field === 'subject')?.message}
                placeholder="What's this about?"
                required
              />

              <Textarea
                label="Message"
                value={values.message}
                onChange={(e) => handleFieldChange('message', e.target.value)}
                error={validationErrors.find(e => e.field === 'message')?.message}
                placeholder="Tell us how we can help you..."
                rows={5}
                required
              />

              <Button
                type="submit"
                size="lg"
                loading={isSubmitting || isRetrying}
                className="w-full"
                disabled={hasErrors}
              >
                <Send className="w-5 h-5 mr-2" />
                {isRetrying ? 'Retrying...' : 'Send Message'}
              </Button>
            </form>
          </motion.div>

          {/* Contact information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isIntersecting ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Let's start a conversation
              </h3>
              <p className="text-gray-600 mb-8">
                We're passionate about helping people find meaningful connections across cultures. 
                Whether you have questions about our platform, need technical support, or want to 
                share your success story, we'd love to hear from you.
              </p>
            </div>

            {/* Contact info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg">
                      <info.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{info.title}</h4>
                      <p className="text-blue-600 font-medium mb-1">{info.content}</p>
                      <p className="text-sm text-gray-600">{info.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Live chat CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-xl text-white"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 p-3 bg-white bg-opacity-20 rounded-lg">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Need immediate help?</h4>
                  <p className="text-blue-100 text-sm mb-3">
                    Chat with our support team right now
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white text-blue-600 hover:bg-gray-100"
                    onClick={() => {
                      console.log('Attempting to open live chat...');
                      
                      // Try different common chat widget APIs
                      try {
                        // Common LiveChat API patterns
                        if (typeof window !== 'undefined') {
                          // Try LiveChat Widget API
                          if ((window as any).LiveChatWidget) {
                            (window as any).LiveChatWidget.call('maximize');
                            console.log('LiveChat widget opened via LiveChatWidget.call');
                            return;
                          }
                          
                          // Try alternative LiveChat API
                          if ((window as any).__lc) {
                            (window as any).__lc.maximize();
                            console.log('LiveChat widget opened via __lc.maximize');
                            return;
                          }
                          
                          // Try ChatBot API
                          if ((window as any).__ow) {
                            (window as any).__ow.openChat();
                            console.log('ChatBot widget opened via __ow.openChat');
                            return;
                          }
                          
                          // Try generic chat API
                          if ((window as any).openChat) {
                            (window as any).openChat();
                            console.log('Chat opened via openChat function');
                            return;
                          }
                        }
                        
                        // Fallback if no chat widget API is found
                        console.log('No chat widget API found, showing fallback message');
                        alert('💬 Live chat would open here! The chat widget will be available once fully configured.');
                        
                      } catch (error) {
                        console.error('Error opening chat widget:', error);
                        alert('💬 Live chat would open here! The chat widget will be available once fully configured.');
                      }
                    }}
                  >
                    Start Live Chat
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;