import { useState, useEffect, useCallback } from 'react';
import { Subscription, PaymentMethod, Invoice } from '../types/payments';

export const useSubscription = (userId: string) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockSubscription: Subscription = {
    id: 'sub_1234567890',
    customerId: userId,
    plan: {
      id: 'premium',
      name: 'Premium',
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
    status: 'active',
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    created: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false
  };

  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: 'pm_1234567890',
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2025,
      isDefault: true,
      created: new Date().toISOString()
    },
    {
      id: 'pm_0987654321',
      type: 'card',
      brand: 'mastercard',
      last4: '5555',
      expMonth: 8,
      expYear: 2024,
      isDefault: false,
      created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const mockInvoices: Invoice[] = [
    {
      id: 'in_1234567890',
      number: 'INV-2024-001',
      amount: 29.99,
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
      amount: 29.99,
      currency: 'usd',
      status: 'pending',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Premium Plan - Monthly',
      url: '#',
      pdfUrl: '#'
    },
    {
      id: 'in_1122334455',
      number: 'INV-2024-003',
      amount: 29.99,
      currency: 'usd',
      status: 'failed',
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Premium Plan - Monthly',
      url: '#',
      pdfUrl: '#',
      failureReason: 'Insufficient funds'
    }
  ];

  // Load subscription data
  const loadSubscriptionData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubscription(mockSubscription);
      setPaymentMethods(mockPaymentMethods);
      setInvoices(mockInvoices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Update subscription
  const updateSubscription = useCallback(async (newPlanId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (subscription) {
        const updatedSubscription = {
          ...subscription,
          plan: {
            ...subscription.plan,
            id: newPlanId,
            name: newPlanId === 'premium' ? 'Premium' : 'Basic'
          }
        };
        setSubscription(updatedSubscription);
      }
    } catch (err) {
      throw new Error('Failed to update subscription');
    }
  }, [subscription]);

  // Cancel subscription
  const cancelSubscription = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (subscription) {
        const canceledSubscription = {
          ...subscription,
          status: 'canceled' as const,
          cancelAtPeriodEnd: true
        };
        setSubscription(canceledSubscription);
      }
    } catch (err) {
      throw new Error('Failed to cancel subscription');
    }
  }, [subscription]);

  // Add payment method
  const addPaymentMethod = useCallback(async () => {
    try {
      // In a real app, this would open Stripe's payment method collection
      console.log('Opening payment method collection...');
      
      // Simulate adding a new payment method
      const newPaymentMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: 'card',
        brand: 'visa',
        last4: '1234',
        expMonth: 12,
        expYear: 2026,
        isDefault: false,
        created: new Date().toISOString()
      };

      setPaymentMethods(prev => [...prev, newPaymentMethod]);
    } catch (err) {
      throw new Error('Failed to add payment method');
    }
  }, []);

  // Remove payment method
  const removePaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
    } catch (err) {
      throw new Error('Failed to remove payment method');
    }
  }, []);

  // Set default payment method
  const setDefaultPaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setPaymentMethods(prev => prev.map(pm => ({
        ...pm,
        isDefault: pm.id === paymentMethodId
      })));
    } catch (err) {
      throw new Error('Failed to set default payment method');
    }
  }, []);

  // Download invoice
  const downloadInvoice = useCallback(async (invoiceId: string) => {
    try {
      // Simulate download
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        console.log(`Downloading invoice ${invoice.number}...`);
        // In a real app, this would trigger a download
        alert(`Invoice ${invoice.number} download started!`);
      }
    } catch (err) {
      throw new Error('Failed to download invoice');
    }
  }, [invoices]);

  // Retry payment
  const retryPayment = useCallback(async (invoiceId: string) => {
    try {
      // Simulate payment retry
      await new Promise(resolve => setTimeout(resolve, 2000));

      setInvoices(prev => prev.map(invoice => 
        invoice.id === invoiceId 
          ? { ...invoice, status: 'paid' as const, failureReason: undefined }
          : invoice
      ));
    } catch (err) {
      throw new Error('Failed to retry payment');
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

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
    refreshData: loadSubscriptionData
  };
};