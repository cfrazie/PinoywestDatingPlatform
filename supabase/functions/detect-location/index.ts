import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface DetectRequest {
  userId: string;
  ipAddress?: string;
}

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { userId, ipAddress: providedIp }: DetectRequest = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get IP address from request if not provided
    const ipAddress = providedIp || 
      req.headers.get('x-forwarded-for')?.split(',')[0] || 
      req.headers.get('x-real-ip') ||
      'unknown';

    // Call IP geolocation API (using ipapi.co as example)
    let locationData;
    try {
      // In production, use a paid service with better accuracy
      const geoResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`);
      
      if (geoResponse.ok) {
        locationData = await geoResponse.json();
      } else {
        // Fallback to default location
        locationData = {
          country_name: 'Philippines',
          country_code: 'PH',
          city: 'Manila',
          region: 'Metro Manila',
          latitude: 14.5995,
          longitude: 120.9842,
          timezone: 'Asia/Manila',
        };
      }
    } catch (error) {
      console.error('IP geolocation error:', error);
      // Use fallback data
      locationData = {
        country_name: 'Philippines',
        country_code: 'PH',
        city: 'Manila',
        region: 'Metro Manila',
        latitude: 14.5995,
        longitude: 120.9842,
        timezone: 'Asia/Manila',
      };
    }

    // Insert IP location history
    await supabase
      .from('ip_location_history')
      .insert({
        user_id: userId,
        ip_address: ipAddress,
        country: locationData.country_name,
        country_code: locationData.country_code,
        region: locationData.region,
        city: locationData.city,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        timezone: locationData.timezone,
        isp: locationData.org || null,
      });

    // Check if user already has a current location
    const { data: existingLocation } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_id', userId)
      .eq('location_type', 'current')
      .single();

    const result = {
      country: locationData.country_name,
      country_code: locationData.country_code,
      city: locationData.city,
      region: locationData.region,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      timezone: locationData.timezone,
      confidence: 0.85,
      has_existing_location: !!existingLocation,
      ip_address: ipAddress,
    };

    // Optionally auto-create location if none exists
    if (!existingLocation) {
      await supabase
        .from('user_locations')
        .insert({
          user_id: userId,
          location_type: 'current',
          is_primary: true,
          country: locationData.country_name,
          country_code: locationData.country_code,
          region: locationData.region,
          city: locationData.city,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          timezone: locationData.timezone,
          detected_from_ip: ipAddress,
          ip_confidence: 0.85,
          manually_set: false,
          verified: false,
          verification_method: 'ip',
        });
    }
    
    return new Response(JSON.stringify({
      success: true,
      location: result,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error: any) {
    console.error('Location detection error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});
