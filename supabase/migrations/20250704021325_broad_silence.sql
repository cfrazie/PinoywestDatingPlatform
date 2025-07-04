/*
  # Fix Stripe Checkout Configuration

  1. Changes
    - Update Stripe product configuration in the database
    - Ensure price IDs match the ones in the frontend
    - Add proper descriptions for products
    - Fix any data inconsistencies
*/

-- Update products table with correct information
UPDATE products 
SET 
  name = 'Premium',
  description = 'Most popular choice with advanced features. $14.99/month. Unlimited messaging, advanced matching, video chat, and more.'
WHERE id = 'prod_premium' OR id = 'prod_SaLyUKs2auXcof';

UPDATE products 
SET 
  name = 'Platinum',
  description = 'For serious relationship seekers. $29.99/month. Everything in Premium plus profile boost, exclusive access, and personal relationship coach.'
WHERE id = 'prod_platinum' OR id = 'prod_SaM1erWmdtIKxT';

-- Update prices table with correct price IDs
UPDATE prices 
SET 
  id = 'price_1RfBGZAxEddEOHWCFEp7sfrE',
  unit_amount = 1499
WHERE id = 'price_premium_monthly';

UPDATE prices 
SET 
  id = 'price_1RfBJUAxEddEOHWCkoxxgbM7',
  unit_amount = 2999
WHERE id = 'price_platinum_monthly';

UPDATE prices 
SET 
  id = 'price_1RfBOlAxEddEOHWCmT4aLzu7',
  unit_amount = 14999
WHERE id = 'price_premium_yearly';

UPDATE prices 
SET 
  id = 'price_1RfBXlAxEddEOHWCLv9xRoyi',
  unit_amount = 29999
WHERE id = 'price_platinum_yearly';

-- Insert products and prices if they don't exist
INSERT INTO products (id, name, description, active)
VALUES 
  ('prod_SaLyUKs2auXcof', 'Premium', 'Most popular choice with advanced features. $14.99/month. Unlimited messaging, advanced matching, video chat, and more.', true),
  ('prod_SaM1erWmdtIKxT', 'Platinum', 'For serious relationship seekers. $29.99/month. Everything in Premium plus profile boost, exclusive access, and personal relationship coach.', true),
  ('prod_SaM68f1eFfwu0b', 'Premium Annually', 'Most popular choice with advanced features. $149.99/year ($12.50/month). Unlimited messaging, advanced matching, video chat, and more.', true),
  ('prod_SaMGZX1lVfKeRW', 'Platinum Annually', 'For serious relationship seekers. $299.99/year ($25.00/month). Everything in Premium plus profile boost, exclusive access, and personal relationship coach.', true)
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  active = EXCLUDED.active;

-- Insert prices if they don't exist
INSERT INTO prices (id, product_id, active, currency, type, unit_amount, recurring_interval)
VALUES 
  ('price_1RfBGZAxEddEOHWCFEp7sfrE', 'prod_SaLyUKs2auXcof', true, 'usd', 'recurring', 1499, 'month'),
  ('price_1RfBJUAxEddEOHWCkoxxgbM7', 'prod_SaM1erWmdtIKxT', true, 'usd', 'recurring', 2999, 'month'),
  ('price_1RfBOlAxEddEOHWCmT4aLzu7', 'prod_SaM68f1eFfwu0b', true, 'usd', 'recurring', 14999, 'year'),
  ('price_1RfBXlAxEddEOHWCLv9xRoyi', 'prod_SaMGZX1lVfKeRW', true, 'usd', 'recurring', 29999, 'year')
ON CONFLICT (id) DO UPDATE
SET 
  product_id = EXCLUDED.product_id,
  active = EXCLUDED.active,
  currency = EXCLUDED.currency,
  type = EXCLUDED.type,
  unit_amount = EXCLUDED.unit_amount,
  recurring_interval = EXCLUDED.recurring_interval;

-- Create a function to validate price IDs
CREATE OR REPLACE FUNCTION validate_price_id(price_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM prices WHERE id = price_id AND active = true
  );
END;
$$;