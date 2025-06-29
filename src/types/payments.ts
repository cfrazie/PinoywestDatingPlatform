export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  popular?: boolean;
  color?: string;
  icon?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  created: string;
  description?: string;
  metadata?: Record<string, string>;
  clientSecret?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  created: string;
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
}

export interface Subscription {
  id: string;
  customerId: string;
  plan: PricingPlan;
  status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  created: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  defaultPaymentMethod?: string;
  latestInvoice?: string;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible' | 'pending' | 'failed';
  date: string;
  dueDate?: string;
  description: string;
  url: string;
  pdfUrl: string;
  failureReason?: string;
  attemptCount?: number;
  nextPaymentAttempt?: string;
  lineItems?: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
  period?: {
    start: string;
    end: string;
  };
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  created: string;
  defaultSource?: string;
  subscriptions: Subscription[];
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
  balance: number;
  currency: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

export interface PaymentError {
  type: 'card_error' | 'validation_error' | 'api_error' | 'authentication_error' | 'rate_limit_error';
  code?: string;
  message: string;
  param?: string;
  decline_code?: string;
}

export interface StripeConfig {
  publishableKey: string;
  apiVersion: string;
  locale?: string;
  appearance?: {
    theme?: 'stripe' | 'night' | 'flat';
    variables?: Record<string, string>;
  };
}

export interface CheckoutSession {
  id: string;
  url: string;
  status: 'open' | 'complete' | 'expired';
  customer?: string;
  paymentIntent?: string;
  subscription?: string;
  mode: 'payment' | 'subscription' | 'setup';
  successUrl: string;
  cancelUrl: string;
  created: string;
  expiresAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  images: string[];
  metadata: Record<string, string>;
  active: boolean;
  created: string;
  updated: string;
  prices: Price[];
}

export interface Price {
  id: string;
  productId: string;
  active: boolean;
  currency: string;
  type: 'one_time' | 'recurring';
  unitAmount: number;
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year';
    intervalCount: number;
    trialPeriodDays?: number;
  };
  metadata: Record<string, string>;
  created: string;
}

export interface Coupon {
  id: string;
  name?: string;
  percentOff?: number;
  amountOff?: number;
  currency?: string;
  duration: 'forever' | 'once' | 'repeating';
  durationInMonths?: number;
  maxRedemptions?: number;
  timesRedeemed: number;
  valid: boolean;
  created: string;
  redeemBy?: string;
}

export interface PromotionCode {
  id: string;
  code: string;
  coupon: Coupon;
  active: boolean;
  customer?: string;
  expiresAt?: string;
  maxRedemptions?: number;
  timesRedeemed: number;
  created: string;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  description: string;
  created: string;
  paymentMethod: {
    type: string;
    brand?: string;
    last4?: string;
  };
  receiptUrl?: string;
  refunded: boolean;
  refundAmount?: number;
}

export interface BillingPortalSession {
  id: string;
  url: string;
  created: string;
  expiresAt: string;
  customer: string;
  returnUrl?: string;
}

export interface TaxRate {
  id: string;
  displayName: string;
  description?: string;
  jurisdiction?: string;
  percentage: number;
  inclusive: boolean;
  active: boolean;
  created: string;
}

export interface UsageRecord {
  id: string;
  quantity: number;
  timestamp: string;
  subscriptionItem: string;
  action?: 'increment' | 'set';
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  type: 'boolean' | 'limit' | 'usage';
  limit?: number;
  included: boolean;
  overage?: {
    price: number;
    unit: string;
  };
}

export interface PlanComparison {
  feature: string;
  basic: string | boolean;
  premium: string | boolean;
  platinum: string | boolean;
  highlight?: boolean;
}

export interface PaymentAnalytics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  churnRate: number;
  averageRevenuePerUser: number;
  lifetimeValue: number;
  conversionRate: number;
  refundRate: number;
  period: {
    start: string;
    end: string;
  };
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
    previous_attributes?: any;
  };
  created: string;
  livemode: boolean;
  pendingWebhooks: number;
  request?: {
    id: string;
    idempotencyKey?: string;
  };
}

export interface StripeError extends Error {
  type: string;
  code?: string;
  decline_code?: string;
  param?: string;
  payment_intent?: PaymentIntent;
  payment_method?: PaymentMethod;
  setup_intent?: any;
  source?: any;
}

export interface PaymentConfiguration {
  enabledMethods: string[];
  currency: string;
  minimumAmount: number;
  maximumAmount: number;
  allowPromotionCodes: boolean;
  collectBillingAddress: boolean;
  collectShippingAddress: boolean;
  submitType?: 'auto' | 'book' | 'donate' | 'pay';
  billingAddressCollection?: 'auto' | 'required';
  shippingAddressCollection?: {
    allowedCountries: string[];
  };
}

export interface SubscriptionSchedule {
  id: string;
  status: 'not_started' | 'active' | 'completed' | 'released' | 'canceled';
  customer: string;
  subscription?: string;
  phases: SubscriptionPhase[];
  currentPhase?: SubscriptionPhase;
  created: string;
  released?: string;
  completedAt?: string;
}

export interface SubscriptionPhase {
  startDate: string;
  endDate?: string;
  plans: {
    plan: string;
    quantity: number;
  }[];
  trialEnd?: string;
  coupon?: string;
  defaultTaxRates?: string[];
}

export interface SetupIntent {
  id: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  usage: 'off_session' | 'on_session';
  customer?: string;
  paymentMethod?: string;
  created: string;
  clientSecret?: string;
  lastSetupError?: PaymentError;
}

export interface Mandate {
  id: string;
  status: 'active' | 'inactive' | 'pending';
  type: 'multi_use' | 'single_use';
  paymentMethod: string;
  customerAcceptance: {
    type: 'online' | 'offline';
    acceptedAt: string;
    online?: {
      ipAddress: string;
      userAgent: string;
    };
  };
}

export interface PaymentLink {
  id: string;
  url: string;
  active: boolean;
  lineItems: {
    price: string;
    quantity: number;
  }[];
  afterCompletion: {
    type: 'redirect' | 'hosted_confirmation';
    redirect?: {
      url: string;
    };
  };
  allowPromotionCodes: boolean;
  automaticTax: {
    enabled: boolean;
  };
  billingAddressCollection: 'auto' | 'required';
  created: string;
  livemode: boolean;
  metadata: Record<string, string>;
}

export interface Quote {
  id: string;
  status: 'draft' | 'open' | 'accepted' | 'canceled';
  number?: string;
  description?: string;
  header?: string;
  footer?: string;
  customer: string;
  subscription?: string;
  invoice?: string;
  lineItems: QuoteLineItem[];
  totalAmount: number;
  currency: string;
  expiresAt: string;
  created: string;
  acceptedAt?: string;
}

export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  price: Price;
  amount: number;
}