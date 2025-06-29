import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft, CreditCard } from 'lucide-react';
import Button from '../components/ui/Button';
import { Link, useSearchParams } from 'react-router-dom';
import { getUserSubscription } from '../lib/stripe';

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      try {
        setIsLoading(true);
        // Fetch the user's subscription details
        const subData = await getUserSubscription();
        setSubscription(subData);
      } catch (error) {
        console.error('Error fetching subscription details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchSubscriptionDetails();
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-center">
            <div className="bg-white bg-opacity-30 rounded-full p-3">
              <CheckCircle className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mt-4">Payment Successful!</h1>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Thank you for your purchase. Your payment has been processed successfully.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Order Details</h3>
              
              {subscription ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium">{subscription.price_id ? subscription.price_id.split('_')[1] : 'Premium'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium capitalize">{subscription.subscription_status || 'active'}</span>
                  </div>
                  {subscription.current_period_end && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next Billing Date:</span>
                      <span className="font-medium">
                        {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {subscription.payment_method_brand && subscription.payment_method_last4 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium capitalize">
                        {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600 text-center">
                  Your subscription details will be available soon.
                </p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <Button
              component={Link}
              to="/dashboard"
              variant="primary"
              className="w-full"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Go to My Account
            </Button>
            
            <Button
              component={Link}
              to="/"
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccess;