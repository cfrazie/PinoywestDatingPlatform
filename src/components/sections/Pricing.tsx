import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Crown, Zap, Heart } from 'lucide-react';
import Button from '../ui/Button';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { trackEventSecure } from '../../services/secureApi';

const Pricing: React.FC = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Perfect for getting started',
      monthlyPrice: 0,
      yearlyPrice: 0,
      icon: Star,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      popular: false,
      features: [
        'Create profile and browse members',
        'Send up to 10 messages per day',
        'Basic matching algorithm',
        'Standard customer support',
        'Mobile app access',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Most popular choice',
      monthlyPrice: 14.99,
      yearlyPrice: 149.99,
      icon: Crown,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      popular: true,
      features: [
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
      ],
    },
    {
      id: 'platinum',
      name: 'Platinum',
      description: 'For serious relationship seekers',
      monthlyPrice: 29.99,
      yearlyPrice: 299.99,
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      popular: false,
      features: [
        'Everything in Premium',
        'Profile boost (3x more visibility)',
        'Exclusive access to verified members',
        'Advanced AI compatibility insights',
        'Personal relationship coach',
        'Cultural exchange workshops',
        'VIP customer support',
        'Advanced compatibility reports',
        'Travel planning assistance',
        'Success story features',
      ],
    },
  ];

  const handlePlanSelect = (planId: string, planName: string) => {
    trackEventSecure('pricing_plan_selected', { 
      plan: planId, 
      billing_cycle: billingCycle,
      plan_name: planName 
    });
    
    // Simulate navigation to signup page with plan details
    const queryParams = new URLSearchParams({
      plan: planId,
      billing: billingCycle,
      planName: planName
    });
    
    const signupUrl = `/signup?${queryParams.toString()}`;
    console.log(`Navigating to signup: ${signupUrl}`);
    
    // In a real application, you would use React Router or Next.js router
    // For demo purposes, we'll show what would happen
    const confirmed = confirm(
      `Ready to join with the ${planName} plan (${billingCycle} billing)?\n\n` +
      `This would redirect you to: ${signupUrl}\n\n` +
      `Click OK to simulate the signup process.`
    );
    
    if (confirmed) {
      // Simulate the navigation
      console.log('Redirecting to signup page...');
      alert(`🚀 Welcome! You've selected the ${planName} plan with ${billingCycle} billing. In a real app, you'd now be on the signup page!`);
      
      // In production, you would do:
      // window.location.href = signupUrl;
      // or with React Router: navigate(signupUrl);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section id="pricing" ref={elementRef} className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start your journey to finding love with flexible pricing options 
            designed for every budget and commitment level.
          </p>

          {/* Billing toggle */}
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
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isIntersecting ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                plan.popular ? 'border-blue-500 scale-105' : plan.borderColor
              } overflow-hidden`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                {/* Plan header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex p-3 rounded-lg ${plan.bgColor} mb-4`}>
                    <plan.icon className={`w-8 h-8 ${plan.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  
                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">
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

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  size="lg"
                  className="w-full"
                  onClick={() => handlePlanSelect(plan.id, plan.name)}
                >
                  {plan.monthlyPrice === 0 ? 'Get Started Free' : 'Choose Plan'}
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Money back guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center text-gray-600">
            <Star className="w-5 h-5 text-yellow-500 mr-2" />
            30-day money-back guarantee • Cancel anytime • No hidden fees
          </div>
        </motion.div>

        {/* FAQ section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: 'Can I change my plan anytime?',
                answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                question: 'Is there a free trial?',
                answer: 'Our Basic plan is completely free forever. Premium plans come with a 7-day free trial.',
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards, PayPal, and local payment methods in supported countries.',
              },
              {
                question: 'Is my data secure?',
                answer: 'Absolutely. We use bank-level encryption and never share your personal information with third parties.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;