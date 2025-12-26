import { supabase } from '../lib/supabase';
import type {
  UserLocation,
  LocationDetectionResult,
  LocationBlockedError,
} from '../types/cultureWall';

export const locationService = {
  // Detect location from IP
  async detectLocationFromIP(userId: string, ipAddress?: string): Promise<LocationDetectionResult> {
    const { data, error } = await supabase.functions.invoke('detect-location', {
      body: { userId, ipAddress },
    });

    // Check if country is blocked (403 error)
    if (error?.message?.includes('Access denied') || data?.error === 'Access denied') {
      const blockedError = data as LocationBlockedError;
      throw new Error(`Access denied: Service is not available in ${blockedError.country_name || 'your region'}`);
    }

    if (error) throw error;
    return data.location;
  },

  // Get user locations
  async getUserLocations(userId: string) {
    const { data, error } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });

    if (error) throw error;
    return data as UserLocation[];
  },

  // Get primary location
  async getPrimaryLocation(userId: string) {
    const { data, error } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as UserLocation | null;
  },

  // Create location
  async createLocation(location: Omit<UserLocation, 'id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_locations')
      .insert({
        user_id: user.id,
        ...location,
      })
      .select()
      .single();

    if (error) throw error;
    return data as UserLocation;
  },

  // Update location
  async updateLocation(locationId: string, updates: Partial<UserLocation>) {
    const { data, error } = await supabase
      .from('user_locations')
      .update(updates)
      .eq('id', locationId)
      .select()
      .single();

    if (error) throw error;
    return data as UserLocation;
  },

  // Set primary location
  async setPrimaryLocation(userId: string, locationId: string) {
    const { data, error } = await supabase.rpc('set_primary_location', {
      p_user_id: userId,
      p_location_id: locationId,
    });

    if (error) throw error;
    return data;
  },

  // Delete location
  async deleteLocation(locationId: string) {
    const { error } = await supabase
      .from('user_locations')
      .delete()
      .eq('id', locationId);

    if (error) throw error;
  },

  // Get IP location history
  async getIPHistory(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('ip_location_history')
      .select('*')
      .eq('user_id', userId)
      .order('detected_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Check if user is OFW
  async isOFW(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_locations')
      .select('is_ofw')
      .eq('user_id', userId)
      .eq('is_ofw', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  // Get OFW locations
  async getOFWLocations(hostCountry?: string) {
    let query = supabase
      .from('user_locations')
      .select('*')
      .eq('is_ofw', true);

    if (hostCountry) {
      query = query.eq('ofw_host_country', hostCountry);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as UserLocation[];
  },
};
