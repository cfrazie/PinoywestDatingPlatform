import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, Calendar, DollarSign, AlertTriangle, 
  CheckCircle, Download, RefreshCw, Settings, Crown
} from 'lucide-react';
import Button from '../ui/Button';
import { getUserSubscription, formatCurrency, getSubscriptionStatus, getProductNameFromPriceId } from '../../lib/stripe';
import PaymentMethodCard from './PaymentMethodCard';
import InvoiceHistory from './InvoiceHistory';

interface SubscriptionManagerProps {
  userId: string;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'billing'>('overview');
  
  const {
    subscription,
    paymentMethods,
    invoices,
    isLoading,
    updateSubscription,
    cancelSubscription,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    downloadInvoice,
    retryPayment
  } = useSubscriptionHook(userId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'past_due': return 'text-yellow-600 bg-yellow-100';
      case 'canceled': return 'text-red-600 bg-red-100';
      case 'trialing': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePlanChange = async (newPlanId: string) => {
    try {
      await updateSubscription(newPlanId);
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  const handleCancelSubscription = async () => {
    const confirmed = confirm(
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.'
    );
    
    if (confirmed) {
      try {
        await cancelSubscription();
      } catch (error) {
        console.error('Failed to cancel subscription:', error);
      }
    }
  };

  // Custom hook to simulate subscription data
  function useSubscriptionHook(userId: string) {
    const [subscription, setSubscription] = useState<any | null>(null);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchSubscription = async () => {
        setIsLoading(true);
        try {
          const subData = await getUserSubscription();
          
          if (subData) {
            // Transform the data to match the expected format
            setSubscription({
              id: subData.subscription_id || 'sub_demo',
              customerId: subData.customer_id,
              plan: {
                id: subData.price_id || 'price_demo',
                name: getProductNameFromPriceId(subData.price_id || '') || 'Premium',
                description: 'Full access to all features',
                price: 14.99,
                interval: 'month',
                features: [
                  'Unlimited messaging',
                  'Video calls',
                  'Advanced matching',
                  'Profile boost',
                  'Read receipts',
                  'Priority support'
                ]
              },
              status: subData.subscription_status || 'active',
              currentPeriodStart: subData.current_period_start 
                ? new Date(subData.current_period_start * 1000).toISOString() 
                : new Date().toISOString(),
              currentPeriodEnd: subData.current_period_end 
                ? new Date(subData.current_period_end * 1000).toISOString() 
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              created: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
              cancelAtPeriodEnd: subData.cancel_at_period_end || false
            });

            // Add payment method if available
            if (subData.payment_method_brand && subData.payment_method_last4) {
              setPaymentMethods([{
                id: 'pm_demo',
                type: 'card',
                brand: subData.payment_method_brand,
                last4: subData.payment_method_last4,
                expMonth: 12,
                expYear: 2025,
                isDefault: true,
                created: new Date().toISOString()
              }]);
            } else {
              // Mock payment methods
              setPaymentMethods([
                {
                  id: 'pm_1234567890',
                  type: 'card',
                  brand: 'visa',
                  last4: '4242',
                  expMonth: 12,
                  expYear: 2025,
                  isDefault: true,
                  created: new Date().toISOString()
                }
              ]);
            }
          } else {
            // No subscription found, use mock data for demo
            setSubscription(null);
            setPaymentMethods([]);
          }

          // Mock invoices for demo
          setInvoices([
            {
              id: 'in_1234567890',
              number: 'INV-2024-001',
              amount: 2999,
              currency: 'usd',
              status: 'paid',
              date: new Date().toISOString(),
              description: 'Premium Plan - Monthly',
              url: '#',
              pdfUrl: '#'
            },
            {
              id: 'in_0987654321',
              number: 'INV-2024-002',
              amount: 2999,
              currency: 'usd',
              status: 'pending',
              date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              description: 'Premium Plan - Monthly',
              url: '#',
              pdfUrl: '#'
            }
          ]);
        } catch (err) {
          console.error('Error fetching subscription:', err);
          setError('Failed to load subscription data');
        } finally {
          setIsLoading(false);
        }
      };

      fetchSubscription();
    }, [userId]);

    // Mock functions
    const updateSubscription = async () => {
      alert('This would update your subscription in a real application.');
      return true;
    };

    const cancelSubscription = async () => {
      alert('This would cancel your subscription in a real application.');
      return true;
    };

    const addPaymentMethod = async () => {
      alert('This would add a new payment method in a real application.');
    };

    const removePaymentMethod = async () => {
      alert('This would remove the payment method in a real application.');
    };

    const setDefaultPaymentMethod = async () => {
      alert('This would set the default payment method in a real application.');
    };

    const downloadInvoice = async () => {
      alert('This would download the invoice in a real application.');
    };

    const retryPayment = async () => {
      alert('This would retry the payment in a real application.');
    };

    return {
      subscription,
      paymentMethods,
      invoices,
      isLoading,
      error,
      updateSubscription,
      cancelSubscription,
      addPaymentMethod,
      removePaymentMethod,
      setDefaultPaymentMethod,
      downloadInvoice,
      retryPayment,
      refreshData: () => {}
    };
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
        <p className="text-gray-600">Manage your PinoyWest subscription and billing</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
        {[
          { key: 'overview', label: 'Overview', icon: Crown },
          { key: 'billing', label: 'Billing', icon: CreditCard }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && subscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Current Plan */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Current Plan</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                {subscription?.status ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) : 'No Subscription'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{subscription.plan.name}</h3>
                <p className="text-2xl font-bold text-blue-600">
                  ${subscription.plan.price}/{subscription.plan.interval}
                </p>
                <p className="text-sm text-gray-500 mt-1">{subscription.plan.description}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Next Billing Date</h4>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{formatDate(subscription?.currentPeriodEnd)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Amount Due</h4>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">${subscription.plan.price}</span>
                </div>
              </div>
            </div>

            {/* Plan Features */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Plan Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subscription.plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setActiveTab('billing')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
              
              {subscription.status === 'active' && (
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Usage This Month</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">∞</div>
                <div className="text-sm text-gray-600">Messages Sent</div>
                <div className="text-xs text-gray-500 mt-1">Unlimited</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">25</div>
                <div className="text-sm text-gray-600">Video Calls</div>
                <div className="text-xs text-gray-500 mt-1">This month</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">12</div>
                <div className="text-sm text-gray-600">Profile Views</div>
                <div className="text-xs text-gray-500 mt-1">Daily average</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
              <Button
                onClick={addPaymentMethod}
                size="sm"
              >
                Add Payment Method
              </Button>
            </div>

            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  paymentMethod={method}
                  isDefault={method.isDefault}
                  onSetDefault={() => setDefaultPaymentMethod(method.id)}
                  onRemove={() => removePaymentMethod(method.id)}
                />
              ))}
            </div>
          </div>

          {/* Billing Address */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Billing Address</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="john@example.com"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="123 Main Street"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="San Francisco"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="94102"
                />
              </div>
            </div>

            <div className="mt-6">
              <Button variant="outline">
                Update Billing Address
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SubscriptionManager;