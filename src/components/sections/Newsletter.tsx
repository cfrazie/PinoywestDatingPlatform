import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Gift, Heart, Star } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { useForm } from '../../hooks/useForm';
import { newsletterSchema, NewsletterData } from '../../lib/validations';
import { subscribeToNewsletterSecure } from '../../services/secureApi';
import toast from 'react-hot-toast';

const Newsletter: React.FC = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver();

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useForm<NewsletterData>({
    initialValues: {
      email: '',
    },
    validationSchema: newsletterSchema,
    onSubmit: async (data) => {
      const result = await subscribeToNewsletterSecure(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message || 'Successfully subscribed!');
      }
    },
  });

  const benefits = [
    {
      icon: Heart,
      title: 'Dating Tips',
      description: 'Weekly advice for cross-cultural relationships',
    },
    {
      icon: Star,
      title: 'Success Stories',
      description: 'Inspiring stories from our community',
    },
    {
      icon: Gift,
      title: 'Exclusive Offers',
      description: 'Special discounts and premium features',
    },
  ];

  return (
    <section ref={elementRef} className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="inline-flex p-3 bg-white bg-opacity-20 rounded-full mb-6">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay Connected with Love
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Get the latest dating tips, success stories, and exclusive offers 
              delivered straight to your inbox.
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          >
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex p-3 bg-white bg-opacity-20 rounded-full mb-4">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-blue-100">{benefit.description}</p>
              </div>
            ))}
          </motion.div>

          {/* Newsletter form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-md mx-auto"
          >
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="email"
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={errors.email}
                  placeholder="Enter your email address"
                  className="bg-white text-gray-900"
                  required
                />
              </div>
              <Button
                type="submit"
                loading={isSubmitting}
                className="bg-white text-blue-600 hover:bg-gray-100 whitespace-nowrap"
              >
                Subscribe Now
              </Button>
            </form>
            <p className="text-sm text-blue-100 mt-4">
              Join 25,000+ subscribers. Unsubscribe anytime.
            </p>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isIntersecting ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 flex items-center justify-center space-x-8 text-blue-100"
          >
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              No spam, ever
            </div>
            <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              Weekly updates
            </div>
            <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
            <div className="flex items-center">
              <Gift className="w-4 h-4 mr-1" />
              Exclusive content
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;