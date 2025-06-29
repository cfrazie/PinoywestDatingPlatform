import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Shield, Check, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useStripePayment } from '../../hooks/useStripePayment';
import { PricingPlan } from '../../types/payments';

interface PaymentFormProps {
  plan: PricingPlan;
  billingCycle: 'monthly' | 'yearly';
  onSuccess: (paymentResult: any) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  plan,
  billingCycle,
  onSuccess,
  onCancel
}) => {
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: '',
    country: '',
    postalCode: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const {
    isProcessing,
    processPayment,
    validateCard,
    formatCardNumber,
    formatExpiryDate
  } = useStripePayment();

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    // Format card number
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    }
    // Format expiry date
    else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    }
    // Format CVV
    else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setPaymentData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate card number
    if (!validateCard(paymentData.cardNumber)) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    // Validate expiry date
    if (!paymentData.expiryDate || paymentData.expiryDate.length < 5) {
      newErrors.expiryDate = 'Please enter a valid expiry date';
    }

    // Validate CVV
    if (!paymentData.cvv || paymentData.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    // Validate cardholder name
    if (!paymentData.cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter the cardholder name';
    }

    // Validate email
    if (!paymentData.email || !/\S+@\S+\.\S+/.test(paymentData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate terms acceptance
    if (!acceptedTerms) {
      newErrors.terms = 'Please accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const paymentResult = await processPayment({
        plan,
        billingCycle,
        paymentMethod: {
          card: {
            number: paymentData.cardNumber,
            exp_month: parseInt(paymentData.expiryDate.split('/')[0]),
            exp_year: parseInt('20' + paymentData.expiryDate.split('/')[1]),
            cvc: paymentData.cvv
          },
          billing_details: {
            name: paymentData.cardholderName,
            email: paymentData.email,
            address: {
              country: paymentData.country,
              postal_code: paymentData.postalCode
            }
          }
        }
      });

      onSuccess(paymentResult);
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const getCardType = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    return 'unknown';
  };

  const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const savings = billingCycle === 'yearly' ? (plan.monthlyPrice * 12 - plan.yearlyPrice) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-blue-100 rounded-full mb-4">
          <CreditCard className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Purchase</h2>
        <p className="text-gray-600">Secure payment powered by Stripe</p>
      </div>

      {/* Plan Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-900">{plan.name} Plan</span>
          <span className="text-lg font-bold text-blue-600">
            ${price}/{billingCycle === 'monthly' ? 'month' : 'year'}
          </span>
        </div>
        {savings > 0 && (
          <div className="text-sm text-green-600">
            Save ${savings.toFixed(2)} with yearly billing!
          </div>
        )}
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Information */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Payment Information</h3>
          
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Card Number"
                value={paymentData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                error={errors.cardNumber}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                rightIcon={
                  <div className="flex items-center space-x-1">
                    <div className={`w-6 h-4 rounded ${getCardType(paymentData.cardNumber) === 'visa' ? 'bg-blue-600' : 'bg-gray-300'}`} />
                    <div className={`w-6 h-4 rounded ${getCardType(paymentData.cardNumber) === 'mastercard' ? 'bg-red-600' : 'bg-gray-300'}`} />
                  </div>
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                value={paymentData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                error={errors.expiryDate}
                placeholder="MM/YY"
                maxLength={5}
              />
              <Input
                label="CVV"
                value={paymentData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                error={errors.cvv}
                placeholder="123"
                maxLength={4}
                rightIcon={<Shield className="w-4 h-4 text-gray-400" />}
              />
            </div>

            <Input
              label="Cardholder Name"
              value={paymentData.cardholderName}
              onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              error={errors.cardholderName}
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Billing Information */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Billing Information</h3>
          
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={paymentData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              placeholder="john@example.com"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  value={paymentData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="PH">Philippines</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="ES">Spain</option>
                  <option value="IT">Italy</option>
                  <option value="JP">Japan</option>
                </select>
              </div>

              <Input
                label="Postal Code"
                value={paymentData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="12345"
              />
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-4">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              I agree to the{' '}
              <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </span>
          </label>
          {errors.terms && (
            <p className="text-sm text-red-600">{errors.terms}</p>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="font-medium text-green-900">Secure Payment</h4>
              <p className="text-sm text-green-700">
                Your payment information is encrypted and secure. We never store your card details.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isProcessing}
            className="flex-1"
          >
            <Lock className="w-4 h-4 mr-2" />
            Pay ${price}
          </Button>
        </div>
      </form>

      {/* Trust Indicators */}
      <div className="mt-6 flex items-center justify-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Shield className="w-3 h-3" />
          <span>SSL Secured</span>
        </div>
        <div className="flex items-center space-x-1">
          <Check className="w-3 h-3" />
          <span>PCI Compliant</span>
        </div>
        <div className="flex items-center space-x-1">
          <Lock className="w-3 h-3" />
          <span>256-bit Encryption</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentForm;