// Relationship Service
// Handles all relationship status operations

import { supabase } from '../lib/supabase';
import type {
  RelationshipStatusRecord,
  RelationshipHistory,
  RelationshipRequest,
  RelationshipStatusUpdate,
  EndRelationshipData,
  RelationshipStatus,
} from '../types/relationship.types';

/**
 * Get the current relationship status for a user
 */
export async function getRelationshipStatus(userId: string): Promise<RelationshipStatusRecord | null> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('relationship_statuses')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching relationship status:', error);
    throw error;
  }

  return data;
}

/**
 * Get relationship status with partner information
 */
export async function getRelationshipStatusWithPartner(userId: string) {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('relationship_statuses')
    .select(`
      *,
      partner:partner_id (
        id,
        email,
        profiles (
          full_name,
          avatar_url
        )
      )
    `)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching relationship status with partner:', error);
    throw error;
  }

  return data;
}

/**
 * Update relationship status
 */
export async function updateRelationshipStatus(
  userId: string,
  update: RelationshipStatusUpdate
): Promise<RelationshipStatusRecord> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('relationship_statuses')
    .upsert({
      user_id: userId,
      ...update,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating relationship status:', error);
    throw error;
  }

  return data;
}

/**
 * Send a relationship request to another user
 */
export async function sendRelationshipRequest(
  fromUserId: string,
  toUserId: string,
  requestedStatus: RelationshipStatus,
  message?: string
): Promise<RelationshipRequest> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('relationship_requests')
    .insert({
      from_user_id: fromUserId,
      to_user_id: toUserId,
      requested_status: requestedStatus,
      message,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending relationship request:', error);
    throw error;
  }

  return data;
}

/**
 * Get pending relationship requests for a user
 */
export async function getPendingRequests(userId: string): Promise<RelationshipRequest[]> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('relationship_requests')
    .select('*')
    .eq('to_user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending requests:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get sent relationship requests
 */
export async function getSentRequests(userId: string): Promise<RelationshipRequest[]> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('relationship_requests')
    .select('*')
    .eq('from_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sent requests:', error);
    throw error;
  }

  return data || [];
}

/**
 * Accept a relationship request
 */
export async function acceptRelationshipRequest(requestId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase client not initialized');

  // First, get the request details
  const { data: request, error: fetchError } = await supabase
    .from('relationship_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (fetchError) {
    console.error('Error fetching request:', fetchError);
    throw fetchError;
  }

  // Update request status
  const { error: updateError } = await supabase
    .from('relationship_requests')
    .update({
      status: 'accepted',
      responded_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (updateError) {
    console.error('Error updating request:', updateError);
    throw updateError;
  }

  // Update both users' relationship statuses
  const now = new Date().toISOString();
  
  // Update requester's status
  await supabase
    .from('relationship_statuses')
    .upsert({
      user_id: request.from_user_id,
      partner_id: request.to_user_id,
      status: request.requested_status,
      started_at: now,
      confirmed_by_partner: true,
      confirmed_at: now,
      is_public: true,
    });

  // Update receiver's status
  await supabase
    .from('relationship_statuses')
    .upsert({
      user_id: request.to_user_id,
      partner_id: request.from_user_id,
      status: request.requested_status,
      started_at: now,
      confirmed_by_partner: true,
      confirmed_at: now,
      is_public: true,
    });
}

/**
 * Decline a relationship request
 */
export async function declineRelationshipRequest(requestId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { error } = await supabase
    .from('relationship_requests')
    .update({
      status: 'declined',
      responded_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) {
    console.error('Error declining request:', error);
    throw error;
  }
}

/**
 * Cancel a sent relationship request
 */
export async function cancelRelationshipRequest(requestId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { error } = await supabase
    .from('relationship_requests')
    .update({
      status: 'cancelled',
    })
    .eq('id', requestId);

  if (error) {
    console.error('Error cancelling request:', error);
    throw error;
  }
}

/**
 * End a relationship
 */
export async function endRelationship(
  userId: string,
  endData: EndRelationshipData
): Promise<void> {
  if (!supabase) throw new Error('Supabase client not initialized');

  // Get current relationship status
  const { data: currentStatus, error: fetchError } = await supabase
    .from('relationship_statuses')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (fetchError) {
    console.error('Error fetching current status:', fetchError);
    throw fetchError;
  }

  const partnerId = currentStatus.partner_id;
  const previousStatus = currentStatus.status;

  // Add to relationship history
  await supabase
    .from('relationship_history')
    .insert({
      user_id: userId,
      partner_id: partnerId,
      previous_status: previousStatus,
      new_status: 'recently_single',
      ended_at: new Date().toISOString(),
      ended_by: userId,
      end_reason: endData.end_reason,
      breakup_date: endData.breakup_date,
      notes: endData.notes,
    });

  // Update user's status to recently_single
  await supabase
    .from('relationship_statuses')
    .update({
      status: 'recently_single',
      partner_id: null,
      confirmed_by_partner: false,
      confirmed_at: null,
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  // Update partner's status to recently_single if they exist
  if (partnerId) {
    await supabase
      .from('relationship_statuses')
      .update({
        status: 'recently_single',
        partner_id: null,
        confirmed_by_partner: false,
        confirmed_at: null,
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', partnerId);
  }
}

/**
 * Get relationship history for a user
 */
export async function getRelationshipHistory(userId: string): Promise<RelationshipHistory[]> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('relationship_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching relationship history:', error);
    throw error;
  }

  return data || [];
}

/**
 * Check if two users are connected (partners or friends)
 */
export async function areUsersConnected(userId1: string, userId2: string): Promise<boolean> {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('relationship_statuses')
    .select('id')
    .or(`and(user_id.eq.${userId1},partner_id.eq.${userId2},confirmed_by_partner.eq.true),and(user_id.eq.${userId2},partner_id.eq.${userId1},confirmed_by_partner.eq.true)`)
    .limit(1);

  if (error) {
    console.error('Error checking connection:', error);
    return false;
  }

  return (data?.length || 0) > 0;
}

/**
 * Calculate relationship duration
 */
export function calculateRelationshipDuration(startedAt: string): string {
  const start = new Date(startedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    if (remainingMonths > 0) {
      return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
}

/**
 * Subscribe to relationship status changes
 */
export function subscribeToRelationshipStatus(
  userId: string,
  callback: (status: RelationshipStatusRecord) => void
) {
  if (!supabase) throw new Error('Supabase client not initialized');

  return supabase
    .channel(`relationship_status:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'relationship_statuses',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as RelationshipStatusRecord);
      }
    )
    .subscribe();
}
