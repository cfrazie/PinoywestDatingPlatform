import { useState, useCallback } from 'react';
import { PricingPlan, PaymentIntent, PaymentMethod } from '../types/payments';

interface PaymentData {
  plan: PricingPlan;
  billingCycle: 'monthly' | 'yearly';
  paymentMethod: {
    card: {
      number: string;
      exp_month: number;
      exp_year: number;
      cvc: string;
    };
    billing_details: {
      name: string;
      email: string;
      address: {
        country: string;
        postal_code: string;
      };
    };
  };
}

export const useStripePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate Stripe integration
  const processPayment = useCallback(async (paymentData: PaymentData): Promise<PaymentIntent> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate payment processing
      const success = Math.random() > 0.1; // 90% success rate for demo

      if (!success) {
        throw new Error('Your card was declined. Please try a different payment method.');
      }

      // Create mock payment intent
      const paymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: paymentData.billingCycle === 'monthly' 
          ? paymentData.plan.monthlyPrice * 100 
          : paymentData.plan.yearlyPrice * 100,
        currency: 'usd',
        status: 'succeeded',
        created: new Date().toISOString(),
        description: `${paymentData.plan.name} Plan - ${paymentData.billingCycle} billing`,
        metadata: {
          plan_id: paymentData.plan.id,
          billing_cycle: paymentData.billingCycle,
          customer_email: paymentData.paymentMethod.billing_details.email
        }
      };

      // Simulate subscription creation
      console.log('Payment successful:', paymentIntent);
      
      return paymentIntent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const validateCard = useCallback((cardNumber: string): boolean => {
    // Remove spaces and check if it's a valid length
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    // Basic Luhn algorithm check
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }, []);

  const formatCardNumber = useCallback((value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Add spaces every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  }, []);

  const formatExpiryDate = useCallback((value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    
    return digits;
  }, []);

  const getCardType = useCallback((cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, '');
    
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    if (number.startsWith('6')) return 'discover';
    
    return 'unknown';
  }, []);

  const createPaymentMethod = useCallback(async (cardData: any): Promise<PaymentMethod> => {
    // Simulate creating a payment method
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'card',
      brand: getCardType(cardData.number),
      last4: cardData.number.slice(-4),
      expMonth: cardData.exp_month,
      expYear: cardData.exp_year,
      isDefault: false,
      created: new Date().toISOString()
    };
  }, [getCardType]);

  const confirmPayment = useCallback(async (paymentIntentId: string, paymentMethodId: string) => {
    setIsProcessing(true);
    
    try {
      // Simulate payment confirmation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const success = Math.random() > 0.05; // 95% success rate
      
      if (!success) {
        throw new Error('Payment confirmation failed. Please try again.');
      }

      return {
        paymentIntent: {
          id: paymentIntentId,
          status: 'succeeded'
        }
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment confirmation failed.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleCardAction = useCallback(async (paymentIntentId: string) => {
    // Simulate 3D Secure or other card actions
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        paymentIntent: {
          id: paymentIntentId,
          status: 'succeeded'
        }
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Card action failed.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    isProcessing,
    error,
    processPayment,
    validateCard,
    formatCardNumber,
    formatExpiryDate,
    getCardType,
    createPaymentMethod,
    confirmPayment,
    handleCardAction,
    clearError: () => setError(null)
  };
};