@@ .. @@
   ('price_premium_monthly', 'prod_premium', true, 'usd', 'recurring', 2999, 'month'),
-  ('price_premium_yearly', 'prod_premium', true, 'usd', 'recurring', 29999, 'year'),
-  ('price_platinum_monthly', 'prod_platinum', true, 'usd', 'recurring', 4999, 'month'),
-  ('price_platinum_yearly', 'prod_platinum', true, 'usd', 'recurring', 49999, 'year')
+  ('price_premium_yearly', 'prod_premium', true, 'usd', 'recurring', 14999, 'year'),
+  ('price_platinum_monthly', 'prod_platinum', true, 'usd', 'recurring', 2999, 'month'),
+  ('price_platinum_yearly', 'prod_platinum', true, 'usd', 'recurring', 29999, 'year')
 ON CONFLICT (id) DO NOTHING;