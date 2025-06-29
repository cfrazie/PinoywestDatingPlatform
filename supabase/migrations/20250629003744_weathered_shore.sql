/*
  # Update Pricing Structure

  1. Changes
    - Update Premium plan from $29.99 to $14.99 monthly
    - Update Platinum plan from $49.99 to $29.99 monthly
    - Update yearly pricing accordingly
    - Keep Basic plan at $0.00

  2. Database Updates
    - Update prices table with new amounts
    - Amounts are stored in cents (multiply by 100)
*/

-- Update Premium pricing
UPDATE prices 
SET unit_amount = 1499 
WHERE id = 'price_premium_monthly';

UPDATE prices 
SET unit_amount = 14999 
WHERE id = 'price_premium_yearly';

-- Update Platinum pricing
UPDATE prices 
SET unit_amount = 2999 
WHERE id = 'price_platinum_monthly';

UPDATE prices 
SET unit_amount = 29999 
WHERE id = 'price_platinum_yearly';