/*
  # Payment System Schema

  1. New Tables
    - `customers` - Stripe customer information
    - `subscriptions` - User subscription data
    - `payment_methods` - Stored payment methods
    - `invoices` - Invoice history and status
    - `payment_intents` - Payment processing records
    - `products` - Available subscription products
    - `prices` - Pricing information for products
    - `coupons` - Discount codes and promotions
    - `usage_records` - Usage-based billing records
    - `webhook_events` - Stripe webhook event log

  2. Security
    - Enable RLS on all payment tables
    - Add policies for user data access
    - Secure sensitive payment information

  3. Indexes
    - Optimize queries for payment processing
    - Add indexes for common lookups
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prices table
CREATE TABLE IF NOT EXISTS prices (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT true,
  currency TEXT NOT NULL DEFAULT 'usd',
  type TEXT NOT NULL CHECK (type IN ('one_time', 'recurring')),
  unit_amount INTEGER NOT NULL,
  recurring_interval TEXT CHECK (recurring_interval IN ('day', 'week', 'month', 'year')),
  recurring_interval_count INTEGER DEFAULT 1,
  trial_period_days INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  address JSONB,
  currency TEXT DEFAULT 'usd',
  balance INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  brand TEXT,
  last4 TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  billing_details JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  price_id TEXT REFERENCES prices(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'trialing', 'unpaid')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  default_payment_method TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  subscription_id TEXT REFERENCES subscriptions(id) ON DELETE SET NULL,
  number TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  currency TEXT NOT NULL DEFAULT 'usd',
  amount_due INTEGER NOT NULL,
  amount_paid INTEGER DEFAULT 0,
  amount_remaining INTEGER DEFAULT 0,
  description TEXT,
  invoice_pdf TEXT,
  hosted_invoice_url TEXT,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  attempt_count INTEGER DEFAULT 0,
  next_payment_attempt TIMESTAMPTZ,
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment intents table
CREATE TABLE IF NOT EXISTS payment_intents (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'succeeded', 'canceled')),
  payment_method TEXT,
  description TEXT,
  receipt_email TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  name TEXT,
  percent_off INTEGER CHECK (percent_off >= 0 AND percent_off <= 100),
  amount_off INTEGER CHECK (amount_off >= 0),
  currency TEXT,
  duration TEXT NOT NULL CHECK (duration IN ('forever', 'once', 'repeating')),
  duration_in_months INTEGER,
  max_redemptions INTEGER,
  times_redeemed INTEGER DEFAULT 0,
  valid BOOLEAN DEFAULT true,
  redeem_by TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage records table (for usage-based billing)
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id TEXT REFERENCES subscriptions(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  action TEXT CHECK (action IN ('increment', 'set')) DEFAULT 'increment',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook events table
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processing_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Products and prices are publicly readable
CREATE POLICY "Products are publicly readable" ON products
  FOR SELECT TO public USING (active = true);

CREATE POLICY "Prices are publicly readable" ON prices
  FOR SELECT TO public USING (active = true);

-- Customers can only access their own data
CREATE POLICY "Users can read own customer data" ON customers
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update own customer data" ON customers
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Payment methods - users can only access their own
CREATE POLICY "Users can read own payment methods" ON payment_methods
  FOR SELECT TO authenticated 
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own payment methods" ON payment_methods
  FOR INSERT TO authenticated 
  WITH CHECK (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own payment methods" ON payment_methods
  FOR UPDATE TO authenticated 
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own payment methods" ON payment_methods
  FOR DELETE TO authenticated 
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- Subscriptions - users can only access their own
CREATE POLICY "Users can read own subscriptions" ON subscriptions
  FOR SELECT TO authenticated 
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE TO authenticated 
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- Invoices - users can only access their own
CREATE POLICY "Users can read own invoices" ON invoices
  FOR SELECT TO authenticated 
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- Payment intents - users can only access their own
CREATE POLICY "Users can read own payment intents" ON payment_intents
  FOR SELECT TO authenticated 
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own payment intents" ON payment_intents
  FOR INSERT TO authenticated 
  WITH CHECK (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- Coupons are publicly readable
CREATE POLICY "Coupons are publicly readable" ON coupons
  FOR SELECT TO public USING (valid = true);

-- Usage records - users can only access their own
CREATE POLICY "Users can read own usage records" ON usage_records
  FOR SELECT TO authenticated 
  USING (subscription_id IN (
    SELECT id FROM subscriptions 
    WHERE customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  ));

CREATE POLICY "Users can insert own usage records" ON usage_records
  FOR INSERT TO authenticated 
  WITH CHECK (subscription_id IN (
    SELECT id FROM subscriptions 
    WHERE customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  ));

-- Webhook events - admin only
CREATE POLICY "Only service role can access webhook events" ON webhook_events
  FOR ALL TO service_role USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_payment_methods_customer_id ON payment_methods(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(customer_id, is_default);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_payment_intents_customer_id ON payment_intents(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_usage_records_subscription_id ON usage_records(subscription_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_timestamp ON usage_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_customers_updated_at 
  BEFORE UPDATE ON customers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_intents_updated_at 
  BEFORE UPDATE ON payment_intents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample products and prices
INSERT INTO products (id, name, description, active) VALUES
  ('prod_basic', 'Basic Plan', 'Perfect for getting started with PinoyWest', true),
  ('prod_premium', 'Premium Plan', 'Most popular choice with advanced features', true),
  ('prod_platinum', 'Platinum Plan', 'For serious relationship seekers', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO prices (id, product_id, active, currency, type, unit_amount, recurring_interval) VALUES
  ('price_basic_monthly', 'prod_basic', true, 'usd', 'recurring', 0, 'month'),
  ('price_basic_yearly', 'prod_basic', true, 'usd', 'recurring', 0, 'year'),
  ('price_premium_monthly', 'prod_premium', true, 'usd', 'recurring', 2999, 'month'),
  ('price_premium_yearly', 'prod_premium', true, 'usd', 'recurring', 29999, 'year'),
  ('price_platinum_monthly', 'prod_platinum', true, 'usd', 'recurring', 4999, 'month'),
  ('price_platinum_yearly', 'prod_platinum', true, 'usd', 'recurring', 49999, 'year')
ON CONFLICT (id) DO NOTHING;