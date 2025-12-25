// Gift Service
// Handles all gift store operations

import { supabase } from '../lib/supabase';
import type {
  Gift,
  GiftTransaction,
  ShippingAddress,
  DeliveryTracking,
  GiftFilters,
  GiftCatalogResponse,
  SendGiftRequest,
  GiftValidationResult,
} from '../types/gift.types';

/**
 * Get all active gifts from the catalog
 */
export async function getGiftCatalog(
  filters?: GiftFilters,
  page: number = 1,
  pageSize: number = 20
): Promise<GiftCatalogResponse> {
  if (!supabase) throw new Error('Supabase client not initialized');

  let query = supabase
    .from('gift_catalog')
    .select('*', { count: 'exact' })
    .eq('is_active', true);

  // Apply filters
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.minPrice !== undefined) {
    query = query.gte('price_usd', filters.minPrice);
  }
  if (filters?.maxPrice !== undefined) {
    query = query.lte('price_usd', filters.maxPrice);
  }
  if (filters?.country) {
    query = query.contains('available_countries', [filters.country]);
  }
  if (filters?.searchTerm) {
    query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
  }
  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  // Order by price
  query = query.order('price_usd', { ascending: true });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching gift catalog:', error);
    throw error;
  }

  return {
    gifts: data || [],
    total: count || 0,
    page,
    pageSize,
  };
}

/**
 * Get a single gift by ID
 */
export async function getGiftById(giftId: string): Promise<Gift | null> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('gift_catalog')
    .select('*')
    .eq('id', giftId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching gift:', error);
    throw error;
  }

  return data;
}

/**
 * Validate if a user can send a gift to another user
 */
export async function validateGiftSending(
  fromUserId: string,
  toUserId: string,
  giftId: string
): Promise<GiftValidationResult> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .rpc('validate_gift_sending', {
      p_from_user_id: fromUserId,
      p_to_user_id: toUserId,
      p_gift_id: giftId,
    });

  if (error) {
    console.error('Error validating gift sending:', error);
    throw error;
  }

  return data as GiftValidationResult;
}

/**
 * Send a gift to another user
 */
export async function sendGift(
  fromUserId: string,
  request: SendGiftRequest
): Promise<GiftTransaction> {
  if (!supabase) throw new Error('Supabase client not initialized');

  // First validate the gift can be sent
  const validation = await validateGiftSending(fromUserId, request.to_user_id, request.gift_id);
  
  if (!validation.allowed) {
    throw new Error(validation.reason);
  }

  // Get gift details
  const gift = await getGiftById(request.gift_id);
  if (!gift) {
    throw new Error('Gift not found');
  }

  // Create the transaction
  const { data, error } = await supabase
    .from('gift_transactions')
    .insert({
      gift_id: request.gift_id,
      from_user_id: fromUserId,
      to_user_id: request.to_user_id,
      gift_type: gift.type,
      amount_usd: gift.price_usd,
      currency: 'USD',
      message: request.message,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating gift transaction:', error);
    throw error;
  }

  return data;
}

/**
 * Get gifts sent by a user
 */
export async function getSentGifts(userId: string): Promise<GiftTransaction[]> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('gift_transactions')
    .select(`
      *,
      gift:gift_id (*)
    `)
    .eq('from_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sent gifts:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get gifts received by a user
 */
export async function getReceivedGifts(userId: string): Promise<GiftTransaction[]> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('gift_transactions')
    .select(`
      *,
      gift:gift_id (*)
    `)
    .eq('to_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching received gifts:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a specific gift transaction
 */
export async function getGiftTransaction(transactionId: string): Promise<GiftTransaction | null> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('gift_transactions')
    .select(`
      *,
      gift:gift_id (*)
    `)
    .eq('id', transactionId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching transaction:', error);
    throw error;
  }

  return data;
}

/**
 * Update gift transaction status
 */
export async function updateGiftTransactionStatus(
  transactionId: string,
  status: string
): Promise<void> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { error } = await supabase
    .from('gift_transactions')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', transactionId);

  if (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
}

/**
 * Get shipping addresses for a user
 */
export async function getShippingAddresses(userId: string): Promise<ShippingAddress[]> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('shipping_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching shipping addresses:', error);
    throw error;
  }

  return data || [];
}

/**
 * Add a new shipping address
 */
export async function addShippingAddress(
  userId: string,
  address: Omit<ShippingAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<ShippingAddress> {
  if (!supabase) throw new Error('Supabase client not initialized');

  // If this is the default address, unset other defaults
  if (address.is_default) {
    await supabase
      .from('shipping_addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
  }

  const { data, error } = await supabase
    .from('shipping_addresses')
    .insert({
      ...address,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding shipping address:', error);
    throw error;
  }

  return data;
}

/**
 * Update a shipping address
 */
export async function updateShippingAddress(
  addressId: string,
  updates: Partial<ShippingAddress>
): Promise<ShippingAddress> {
  if (!supabase) throw new Error('Supabase client not initialized');

  // If setting as default, unset other defaults for this user
  if (updates.is_default) {
    const { data: address } = await supabase
      .from('shipping_addresses')
      .select('user_id')
      .eq('id', addressId)
      .single();

    if (address) {
      await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('user_id', address.user_id);
    }
  }

  const { data, error } = await supabase
    .from('shipping_addresses')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', addressId)
    .select()
    .single();

  if (error) {
    console.error('Error updating shipping address:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a shipping address
 */
export async function deleteShippingAddress(addressId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { error } = await supabase
    .from('shipping_addresses')
    .delete()
    .eq('id', addressId);

  if (error) {
    console.error('Error deleting shipping address:', error);
    throw error;
  }
}

/**
 * Get delivery tracking for a transaction
 */
export async function getDeliveryTracking(transactionId: string): Promise<DeliveryTracking | null> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('delivery_tracking')
    .select('*')
    .eq('transaction_id', transactionId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching delivery tracking:', error);
    throw error;
  }

  return data;
}

/**
 * Subscribe to gift transaction updates
 */
export function subscribeToGiftTransaction(
  transactionId: string,
  callback: (transaction: GiftTransaction) => void
) {
  if (!supabase) throw new Error('Supabase client not initialized');

  return supabase
    .channel(`gift_transaction:${transactionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'gift_transactions',
        filter: `id=eq.${transactionId}`,
      },
      (payload) => {
        callback(payload.new as GiftTransaction);
      }
    )
    .subscribe();
}

/**
 * Subscribe to delivery tracking updates
 */
export function subscribeToDeliveryTracking(
  transactionId: string,
  callback: (tracking: DeliveryTracking) => void
) {
  if (!supabase) throw new Error('Supabase client not initialized');

  return supabase
    .channel(`delivery_tracking:${transactionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'delivery_tracking',
        filter: `transaction_id=eq.${transactionId}`,
      },
      (payload) => {
        callback(payload.new as DeliveryTracking);
      }
    )
    .subscribe();
}
