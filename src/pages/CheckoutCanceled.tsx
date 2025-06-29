import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

const CheckoutCanceled: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-6 text-white">
          <div className="flex items-center justify-center">
            <div className="bg-white bg-opacity-30 rounded-full p-3">
              <XCircle className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mt-4">Payment Canceled</h1>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Your payment process was canceled. No charges were made to your account.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">What happens next?</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You can try again whenever you're ready</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Your account remains on the Basic plan</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You can still browse profiles and use basic features</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <Button
              component={Link}
              to="/pricing"
              variant="primary"
              className="w-full"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Return to Pricing
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

export default CheckoutCanceled;