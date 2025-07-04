import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, Shield, Lock, CheckCircle, Star, 
  DollarSign, Calendar, Users, Zap, Award, AlertTriangle
} from 'lucide-react';
import Button from '../ui/Button';
import PaymentForm from '../payments/PaymentForm';
import SubscriptionManager from '../payments/SubscriptionManager';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { redirectToCheckout } from '../../lib/stripe';
import { stripeProducts } from '../../stripe-config';

const PaymentDemo: React.FC = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Basic plan (free tier)
  const basicPlan = {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Create profile and browse members',
      'Send up to 10 messages per day',
      'Basic matching algorithm',
      'Standard customer support',
      'Mobile app access'
    ]
  };

  // Get monthly and yearly plans from stripe-config
  const monthlyPlans = stripeProducts
    .filter(product => !product.name.includes('Annually'))
    .map(product => {      
      // Extract price from description - match the first price in the format $XX.XX
      const priceMatch = product.description.match(/\$(\d+\.\d+)/);
      const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
      
      return {
        id: product.id,
        name: product.name,
        description: product.name === 'Premium' ? 'Most popular choice' : 'For serious relationship seekers',
        monthlyPrice: price,
        yearlyPrice: 0, // Not used for monthly plans
        priceId: product.priceId,
        popular: product.name === 'Premium',
        features: product.name === 'Premium' 
          ? [
              'Everything in Basic',
              'Unlimited messaging',
              'Advanced matching with cultural preferences',
              'Video chat and virtual dates',
              'Real-time translation',
              'AI-powered compatibility scoring',
              'Gift messaging points to Basic members (20 points/week)',
              'Connect with up to 4 Basic members weekly via gifts',
              'Priority customer support',
              'See who viewed your profile',
              'Advanced privacy controls',
            ]
          : [
              'Everything in Premium',
              'Profile boost (3x more visibility)',
              'Exclusive access to verified members',
              'Advanced AI compatibility insights',
              'Personal relationship coach',
              'Cultural exchange workshops',
              'VIP customer support',
              'Advanced compatibility reports',
              'Travel planning assistance',
            ]
      };
    });

  const yearlyPlans = stripeProducts
    .filter(product => product.name.includes('Annually'))
    .map(product => {      
      // Extract yearly price from description - match the first price in the format $XXX.XX or $X.XX
      const priceMatch = product.description.match(/\$(\d+\.\d+)/);
      const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
      
      // Extract monthly equivalent price - look for $XX.XX/month pattern
      const monthlyMatch = product.description.match(/\$(\d+\.\d+)\/month/);
      const monthlyEquivalent = monthlyMatch ? parseFloat(monthlyMatch[1]) : (price / 12);
      
      console.log(`Processing ${product.name}: Price ID ${product.priceId}, Price: $${price}, Monthly: $${monthlyEquivalent}`);
      
      return {
        id: product.id,
        name: product.name.replace(' Annually', ''),
        description: product.name.includes('Premium') ? 'Most popular choice' : 'For serious relationship seekers',
        monthlyPrice: 0, // Not used for yearly plans
        yearlyPrice: price,
        monthlyEquivalent,
        priceId: product.priceId,
        popular: product.name.includes('Premium'),
        features: product.name.includes('Premium')
          ? [
              'Everything in Basic',
              'Unlimited messaging',
              'Advanced matching with cultural preferences',
              'Video chat and virtual dates',
              'Real-time translation',
              'AI-powered compatibility scoring',
              'Gift messaging points to Basic members (20 points/week)',
              'Connect with up to 4 Basic members weekly via gifts',
              'Priority customer support',
              'See who viewed your profile',
              'Advanced privacy controls',
            ]
          : [
              'Everything in Premium',
              'Profile boost (3x more visibility)',
              'Exclusive access to verified members',
              'Advanced AI compatibility insights',
              'Personal relationship coach',
              'Cultural exchange workshops',
              'VIP customer support',
              'Advanced compatibility reports',
              'Travel planning assistance',
            ]
      };
    });

  // Combine plans based on billing cycle
  const plans = [
    basicPlan,
    ...(billingCycle === 'monthly' ? monthlyPlans : yearlyPlans)
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Bank-level security with 256-bit SSL encryption',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: CreditCard,
      title: 'Multiple Payment Methods',
      description: 'Credit cards, debit cards, and digital wallets',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Lock,
      title: 'PCI Compliant',
      description: 'Highest standards for payment security',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Zap,
      title: 'Instant Processing',
      description: 'Fast and reliable payment processing',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: Users,
      title: 'Global Support',
      description: 'Accept payments from 135+ countries',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      icon: Award,
      title: 'Money-Back Guarantee',
      description: '30-day satisfaction guarantee',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  const handlePlanSelect = async (plan: any) => {
    if (plan.id === 'basic') {
      alert('🎉 Welcome to PinoyWest! Your free Basic plan is ready to use!');
      return;
    }
    
    if (!plan.priceId) {
      alert('Invalid product selected. Please try again.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      await redirectToCheckout(plan.priceId);
    } catch (error: any) {
      console.error('Error during checkout:', error);
      setError(error.message || 'There was an error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowSubscriptionManager = () => {
    setShowSubscriptionManager(true);
  };

  return (
    <>
      <section ref={elementRef} className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex p-3 bg-blue-100 rounded-full mb-6">
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Secure Payment Processing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Experience our enterprise-grade payment system powered by Stripe. 
              Secure, fast, and trusted by millions worldwide.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className={`inline-flex p-3 rounded-lg ${feature.bgColor} mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Pricing Plans Demo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-16"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Try Our Payment System
              </h3>
              <p className="text-gray-600 mb-4">
                Select a plan to experience our secure checkout process
              </p>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-700">
                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* Billing Toggle */}
              <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    billingCycle === 'yearly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Yearly
                  <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    Save 17%
                  </span>
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.8 + plans.indexOf(plan) * 0.1 }}
                  className={`relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                    plan.popular ? 'border-blue-500 scale-105' : 'border-gray-200'
                  } overflow-hidden`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                      Most Popular
                    </div>
                  )}

                  <div className={`p-6 ${plan.popular ? 'pt-12' : ''}`}>
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                      <p className="text-gray-600 mb-4">{plan.description}</p>
                      
                      <div className="mb-4">
                        <div className="flex items-baseline justify-center">
                          <span className="text-3xl font-bold text-gray-900">
                            ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                          </span>
                          {plan.monthlyPrice > 0 && (
                            <span className="text-gray-600 ml-2">
                              /{billingCycle === 'monthly' ? 'month' : 'year'}
                            </span>
                          )}
                        </div>
                        {billingCycle === 'yearly' && plan.monthlyPrice > 0 && (
                          <p className="text-sm text-green-600 mt-1">
                            ${(plan.yearlyPrice / 12).toFixed(2)}/month billed annually
                          </p>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 4 && (
                        <li className="text-sm text-gray-500">
                          +{plan.features.length - 4} more features
                        </li>
                      )}
                    </ul>

                    <Button
                      variant={plan.popular ? 'primary' : 'outline'}
                      size="lg"
                      loading={isLoading}
                      className="w-full"
                      onClick={() => handlePlanSelect(plan)}
                    >
                      {plan.monthlyPrice === 0 ? 'Get Started Free' : 'Try Payment Demo'}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Demo Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="text-center"
          >
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Explore Payment Features
              </h3>
              <p className="text-gray-600 mb-6">
                Experience our complete payment and subscription management system
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  onClick={handleShowSubscriptionManager}
                  disabled={isLoading}
                  className="flex items-center"
                >
                  <Star className="w-4 h-4 mr-2" />
                  View Subscription Manager
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handlePlanSelect(monthlyPlans[0])}
                  disabled={isLoading}
                  className="flex items-center"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Try Payment Form
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-16 bg-gray-900 rounded-2xl p-8 text-white"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Trusted by Thousands</h3>
              <p className="text-gray-300">
                Join the growing community of successful cross-cultural relationships
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">99.9%</div>
                <div className="text-gray-300">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">$2M+</div>
                <div className="text-gray-300">Processed Safely</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-2">50K+</div>
                <div className="text-gray-300">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
                <div className="text-gray-300">Support</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Subscription Manager Modal */}
      {showSubscriptionManager && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Subscription Management Demo</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSubscriptionManager(false)}
              >
                ×
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <SubscriptionManager userId="demo_user" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default PaymentDemo;