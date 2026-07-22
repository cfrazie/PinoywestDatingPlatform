-- Gift Store System Migration
-- This migration creates the tables for virtual and physical gift management

-- 1. Gift Catalog Table
CREATE TABLE IF NOT EXISTS public.gift_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'virtual_romantic', 
    'virtual_friendly', 
    'virtual_premium', 
    'physical_flowers', 
    'physical_jewelry', 
    'physical_food', 
    'physical_experience', 
    'physical_tech', 
    'physical_custom'
  )),
  type TEXT NOT NULL CHECK (type IN ('virtual', 'physical')),
  price_usd DECIMAL(10,2) NOT NULL,
  price_php DECIMAL(10,2),
  image_url TEXT NOT NULL,
  animation_url TEXT,
  thumbnail_url TEXT,
  available_countries TEXT[] DEFAULT ARRAY['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'PH', 'JP', 'KR', 'TH', 'VN', 'SG', 'MY', 'ID', 'TW'],
  requires_relationship_status TEXT[] DEFAULT ARRAY['talking', 'in_relationship', 'engaged', 'married', 'friends_only'],
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER,
  delivery_time_days INTEGER,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Gift Transactions Table
CREATE TABLE IF NOT EXISTS public.gift_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id UUID REFERENCES public.gift_catalog(id),
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gift_type TEXT NOT NULL CHECK (gift_type IN ('virtual', 'physical')),
  amount_usd DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'delivered', 'shipped', 'cancelled')),
  stripe_payment_intent_id TEXT,
  delivery_tracking_number TEXT,
  delivery_status TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Shipping Addresses Table
CREATE TABLE IF NOT EXISTS public.shipping_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state_province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  country_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  delivery_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Delivery Tracking Table
CREATE TABLE IF NOT EXISTS public.delivery_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.gift_transactions(id) ON DELETE CASCADE NOT NULL,
  tracking_number TEXT NOT NULL,
  carrier TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned')),
  current_location TEXT,
  estimated_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  tracking_events JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gift_catalog_category ON public.gift_catalog(category);
CREATE INDEX IF NOT EXISTS idx_gift_catalog_type ON public.gift_catalog(type);
CREATE INDEX IF NOT EXISTS idx_gift_catalog_active ON public.gift_catalog(is_active);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_from_user ON public.gift_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_to_user ON public.gift_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_status ON public.gift_transactions(status);
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user ON public.shipping_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_transaction ON public.delivery_tracking(transaction_id);

-- Add updated_at triggers
CREATE TRIGGER set_updated_at_gift_catalog
  BEFORE UPDATE ON public.gift_catalog
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_gift_transactions
  BEFORE UPDATE ON public.gift_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_shipping_addresses
  BEFORE UPDATE ON public.shipping_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_delivery_tracking
  BEFORE UPDATE ON public.delivery_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to validate gift sending
CREATE OR REPLACE FUNCTION public.validate_gift_sending(
  p_from_user_id UUID,
  p_to_user_id UUID,
  p_gift_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_sender_status TEXT;
  v_recipient_status TEXT;
  v_sender_partner_id UUID;
  v_gift_requirements TEXT[];
  v_gift_category TEXT;
  v_are_connected BOOLEAN;
BEGIN
  -- Get sender's relationship status and partner
  SELECT status, partner_id INTO v_sender_status, v_sender_partner_id
  FROM public.relationship_statuses 
  WHERE user_id = p_from_user_id;
  
  -- Get recipient's relationship status
  SELECT status INTO v_recipient_status 
  FROM public.relationship_statuses 
  WHERE user_id = p_to_user_id;
  
  -- Get gift requirements and category
  SELECT requires_relationship_status, category 
  INTO v_gift_requirements, v_gift_category
  FROM public.gift_catalog 
  WHERE id = p_gift_id;
  
  -- Check if users are connected (either as partners or friends)
  SELECT EXISTS(
    SELECT 1 FROM public.relationship_statuses 
    WHERE (user_id = p_from_user_id AND partner_id = p_to_user_id AND confirmed_by_partner = true)
       OR (user_id = p_to_user_id AND partner_id = p_from_user_id AND confirmed_by_partner = true)
  ) INTO v_are_connected;
  
  -- Validation checks
  IF v_sender_status IS NULL THEN
    v_sender_status := 'single';
  END IF;
  
  IF v_sender_status = 'recently_single' THEN
    RETURN jsonb_build_object(
      'allowed', false, 
      'reason', 'You cannot send gifts while in Recently Single status'
    );
  END IF;
  
  IF v_sender_status = 'single' AND v_gift_category LIKE 'virtual_romantic%' THEN
    RETURN jsonb_build_object(
      'allowed', false, 
      'reason', 'You must be in a relationship to send romantic gifts'
    );
  END IF;
  
  IF NOT v_are_connected THEN
    RETURN jsonb_build_object(
      'allowed', false, 
      'reason', 'You can only send gifts to people you are connected with'
    );
  END IF;
  
  IF v_gift_requirements IS NOT NULL AND NOT (v_sender_status = ANY(v_gift_requirements)) THEN
    RETURN jsonb_build_object(
      'allowed', false, 
      'reason', 'Your relationship status does not allow sending this gift'
    );
  END IF;
  
  RETURN jsonb_build_object('allowed', true, 'reason', '');
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.gift_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gift_catalog
-- Everyone can view active gifts
CREATE POLICY "Active gifts are viewable by everyone"
  ON public.gift_catalog
  FOR SELECT
  USING (is_active = true);

-- Admins can manage gift catalog (to be implemented with admin table)
CREATE POLICY "Admins can manage gift catalog"
  ON public.gift_catalog
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- RLS Policies for gift_transactions
-- Users can view gifts they sent
CREATE POLICY "Users can view sent gifts"
  ON public.gift_transactions
  FOR SELECT
  USING (auth.uid() = from_user_id);

-- Users can view gifts they received
CREATE POLICY "Users can view received gifts"
  ON public.gift_transactions
  FOR SELECT
  USING (auth.uid() = to_user_id);

-- Users can create gift transactions
CREATE POLICY "Users can create gift transactions"
  ON public.gift_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Users can update their sent gifts (for cancellation)
CREATE POLICY "Users can update sent gifts"
  ON public.gift_transactions
  FOR UPDATE
  USING (auth.uid() = from_user_id);

-- RLS Policies for shipping_addresses
-- Users can view their own addresses
CREATE POLICY "Users can view own addresses"
  ON public.shipping_addresses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own addresses
CREATE POLICY "Users can insert own addresses"
  ON public.shipping_addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
CREATE POLICY "Users can update own addresses"
  ON public.shipping_addresses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "Users can delete own addresses"
  ON public.shipping_addresses
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for delivery_tracking
-- Users can view tracking for gifts they sent or received
CREATE POLICY "Users can view tracking for their gifts"
  ON public.delivery_tracking
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gift_transactions
      WHERE id = delivery_tracking.transaction_id
      AND (from_user_id = auth.uid() OR to_user_id = auth.uid())
    )
  );

-- System can insert tracking data
CREATE POLICY "System can insert tracking data"
  ON public.delivery_tracking
  FOR INSERT
  WITH CHECK (true);

-- System can update tracking data
CREATE POLICY "System can update tracking data"
  ON public.delivery_tracking
  FOR UPDATE
  USING (true);

-- Insert sample virtual gifts
INSERT INTO public.gift_catalog (name, description, category, type, price_usd, price_php, image_url, animation_url, requires_relationship_status, tags) VALUES
  ('Single Rose', 'A beautiful red rose to show your affection', 'virtual_romantic', 'virtual', 0.99, 55.00, '/gifts/rose.png', '/animations/rose.json', ARRAY['talking', 'in_relationship', 'engaged', 'married'], ARRAY['romantic', 'flowers']),
  ('Bouquet of Roses', 'A stunning bouquet of 12 red roses', 'virtual_romantic', 'virtual', 4.99, 275.00, '/gifts/bouquet.png', '/animations/bouquet.json', ARRAY['talking', 'in_relationship', 'engaged', 'married'], ARRAY['romantic', 'flowers']),
  ('Heart Animation', 'Animated hearts floating across the screen', 'virtual_romantic', 'virtual', 1.99, 110.00, '/gifts/hearts.png', '/animations/hearts.json', ARRAY['talking', 'in_relationship', 'engaged', 'married'], ARRAY['romantic', 'animation']),
  ('Diamond Ring', 'A sparkling diamond ring animation', 'virtual_romantic', 'virtual', 9.99, 550.00, '/gifts/ring.png', '/animations/ring.json', ARRAY['engaged', 'married'], ARRAY['romantic', 'engagement']),
  ('Fireworks', 'Spectacular fireworks display', 'virtual_romantic', 'virtual', 2.99, 165.00, '/gifts/fireworks.png', '/animations/fireworks.json', ARRAY['talking', 'in_relationship', 'engaged', 'married'], ARRAY['celebration', 'romantic']),
  ('Champagne Toast', 'Celebratory champagne toast animation', 'virtual_romantic', 'virtual', 3.99, 220.00, '/gifts/champagne.png', '/animations/champagne.json', ARRAY['talking', 'in_relationship', 'engaged', 'married'], ARRAY['celebration', 'romantic']),
  ('Love Letter', 'A romantic love letter with hearts', 'virtual_romantic', 'virtual', 1.49, 82.00, '/gifts/letter.png', '/animations/letter.json', ARRAY['talking', 'in_relationship', 'engaged', 'married'], ARRAY['romantic', 'message']),
  ('Teddy Bear', 'Cute animated teddy bear', 'virtual_romantic', 'virtual', 2.49, 137.00, '/gifts/teddy.png', '/animations/teddy.json', ARRAY['talking', 'in_relationship', 'engaged', 'married'], ARRAY['romantic', 'cute']),
  ('Coffee', 'A warm cup of coffee for your friend', 'virtual_friendly', 'virtual', 0.99, 55.00, '/gifts/coffee.png', '/animations/coffee.json', ARRAY['friends_only', 'talking', 'in_relationship', 'engaged', 'married'], ARRAY['friendly', 'casual']),
  ('High Five', 'Epic high five animation', 'virtual_friendly', 'virtual', 0.49, 27.00, '/gifts/highfive.png', '/animations/highfive.json', ARRAY['friends_only', 'talking', 'in_relationship', 'engaged', 'married'], ARRAY['friendly', 'fun']),
  ('Thumbs Up', 'Big thumbs up', 'virtual_friendly', 'virtual', 0.49, 27.00, '/gifts/thumbsup.png', '/animations/thumbsup.json', ARRAY['friends_only', 'talking', 'in_relationship', 'engaged', 'married'], ARRAY['friendly', 'approval']),
  ('Party Popper', 'Celebration party popper', 'virtual_friendly', 'virtual', 1.99, 110.00, '/gifts/party.png', '/animations/party.json', ARRAY['friends_only', 'talking', 'in_relationship', 'engaged', 'married'], ARRAY['celebration', 'fun']),
  ('Luxury Car', 'Animated luxury sports car', 'virtual_premium', 'virtual', 49.99, 2750.00, '/gifts/car.png', '/animations/car.json', ARRAY['talking', 'in_relationship', 'engaged', 'married'], ARRAY['premium', 'luxury']),
  ('Yacht', 'Luxury yacht animation', 'virtual_premium', 'virtual', 99.99, 5500.00, '/gifts/yacht.png', '/animations/yacht.json', ARRAY['talking', 'in_relationship', 'engaged', 'married'], ARRAY['premium', 'luxury']),
  ('Private Jet', 'Private jet taking off', 'virtual_premium', 'virtual', 199.99, 11000.00, '/gifts/jet.png', '/animations/jet.json', ARRAY['talking', 'in_relationship', 'engaged', 'married'], ARRAY['premium', 'luxury']),
  ('Castle', 'Majestic castle animation', 'virtual_premium', 'virtual', 499.99, 27500.00, '/gifts/castle.png', '/animations/castle.json', ARRAY['engaged', 'married'], ARRAY['premium', 'luxury', 'ultimate'])
ON CONFLICT DO NOTHING;
