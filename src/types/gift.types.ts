// Gift Store Types

export type GiftCategory = 
  | 'virtual_romantic'
  | 'virtual_friendly'
  | 'virtual_premium'
  | 'physical_flowers'
  | 'physical_jewelry'
  | 'physical_food'
  | 'physical_experience'
  | 'physical_tech'
  | 'physical_custom';

export type GiftType = 'virtual' | 'physical';

export type TransactionStatus = 
  | 'pending' 
  | 'completed' 
  | 'failed' 
  | 'refunded' 
  | 'delivered' 
  | 'shipped' 
  | 'cancelled';

export type DeliveryStatus = 
  | 'pending' 
  | 'picked_up' 
  | 'in_transit' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'failed' 
  | 'returned';

export interface Gift {
  id: string;
  name: string;
  description: string | null;
  category: GiftCategory;
  type: GiftType;
  price_usd: number;
  price_php: number | null;
  image_url: string;
  animation_url: string | null;
  thumbnail_url: string | null;
  available_countries: string[];
  requires_relationship_status: string[];
  is_active: boolean;
  stock_quantity: number | null;
  delivery_time_days: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface GiftTransaction {
  id: string;
  gift_id: string;
  from_user_id: string;
  to_user_id: string;
  gift_type: GiftType;
  amount_usd: number;
  currency: string;
  message: string | null;
  status: TransactionStatus;
  stripe_payment_intent_id: string | null;
  delivery_tracking_number: string | null;
  delivery_status: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  id: string;
  user_id: string;
  recipient_name: string;
  phone_number: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  country_code: string;
  is_default: boolean;
  delivery_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryTracking {
  id: string;
  transaction_id: string;
  tracking_number: string;
  carrier: string;
  status: DeliveryStatus;
  current_location: string | null;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  tracking_events: TrackingEvent[];
  created_at: string;
  updated_at: string;
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

export interface GiftValidationResult {
  allowed: boolean;
  reason: string;
}

export interface SendGiftRequest {
  gift_id: string;
  to_user_id: string;
  message?: string;
  shipping_address_id?: string;
  payment_method_id?: string;
}

export interface GiftFilters {
  category?: GiftCategory;
  type?: GiftType;
  minPrice?: number;
  maxPrice?: number;
  country?: string;
  searchTerm?: string;
  tags?: string[];
}

export interface GiftCatalogResponse {
  gifts: Gift[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GiftHistoryItem extends GiftTransaction {
  gift?: Gift;
  sender_name?: string;
  recipient_name?: string;
}

export const COUNTRY_CODES = {
  // Western Countries
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  ES: 'Spain',
  IT: 'Italy',
  NL: 'Netherlands',
  
  // Asian Countries (Philippines priority)
  PH: 'Philippines',
  JP: 'Japan',
  KR: 'South Korea',
  TH: 'Thailand',
  VN: 'Vietnam',
  SG: 'Singapore',
  MY: 'Malaysia',
  ID: 'Indonesia',
  TW: 'Taiwan',
} as const;

export const GIFT_CATEGORY_LABELS: Record<GiftCategory, string> = {
  virtual_romantic: 'Romantic Gifts',
  virtual_friendly: 'Friendly Gifts',
  virtual_premium: 'Premium Gifts',
  physical_flowers: 'Flowers & Bouquets',
  physical_jewelry: 'Jewelry & Accessories',
  physical_food: 'Food & Chocolates',
  physical_experience: 'Experience Gifts',
  physical_tech: 'Tech & Gadgets',
  physical_custom: 'Custom Gifts',
};

export const RELATIONSHIP_STATUS_ICONS: Record<string, string> = {
  talking: '💚',
  in_relationship: '❤️',
  engaged: '💍',
  married: '💑',
  friends_only: '👥',
  recently_single: '💔',
  single: '',
};

export const RELATIONSHIP_STATUS_COLORS: Record<string, string> = {
  talking: 'text-green-500',
  in_relationship: 'text-red-500',
  engaged: 'text-yellow-500',
  married: 'text-purple-500',
  friends_only: 'text-blue-500',
  recently_single: 'text-gray-500',
  single: 'text-gray-400',
};
