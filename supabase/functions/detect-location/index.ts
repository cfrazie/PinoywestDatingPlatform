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

interface LocationData {
  country_name: string;
  country_code: string;
  country?: string;
  city: string;
  region: string;
  region_code?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  org?: string;
}

// Normalize response from different APIs to a common format
function normalizeLocationData(data: any, provider: string): LocationData {
  switch (provider) {
    case 'ipapi':
      // ipapi.co format
      return {
        country_name: data.country_name,
        country_code: data.country || data.country_code,
        city: data.city,
        region: data.region,
        region_code: data.region_code,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        org: data.org || data.asn,
      };
    
    case 'ip-api':
      // ip-api.com format
      return {
        country_name: data.country,
        country_code: data.countryCode,
        city: data.city,
        region: data.regionName,
        region_code: data.region,
        latitude: data.lat,
        longitude: data.lon,
        timezone: data.timezone,
        org: data.org || data.isp,
      };
    
    case 'ipwho':
      // ipwho.is format
      return {
        country_name: data.country,
        country_code: data.country_code,
        city: data.city,
        region: data.region,
        region_code: data.region_code,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone?.id || data.timezone,
        org: data.connection?.org || data.connection?.isp,
      };
    
    default:
      return data;
  }
}

// Try multiple IP geolocation APIs with fallback
async function detectLocationWithFallback(ipAddress: string): Promise<LocationData> {
  const apis = [
    {
      name: 'ipapi',
      url: `https://ipapi.co/${ipAddress}/json/`,
      headers: { 'User-Agent': 'PinoywestDatingPlatform/1.0' },
    },
    {
      name: 'ip-api',
      url: `http://ip-api.com/json/${ipAddress}?fields=status,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org`,
      headers: {},
    },
    {
      name: 'ipwho',
      url: `https://ipwho.is/${ipAddress}`,
      headers: {},
    },
  ];

  // Try each API in order
  for (const api of apis) {
    try {
      console.log(`Trying ${api.name} API...`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(api.url, {
        headers: api.headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      
      if (response.ok) {
        const data = await response.json();
        
        // Check for API-specific error responses
        if (api.name === 'ip-api' && data.status === 'fail') {
          console.error(`${api.name} returned error:`, data.message);
          continue;
        }
        
        if (api.name === 'ipwho' && data.success === false) {
          console.error(`${api.name} returned error:`, data.message);
          continue;
        }
        
        const normalized = normalizeLocationData(data, api.name);
        console.log(`Successfully fetched location from ${api.name}`);
        return normalized;
      } else {
        console.error(`${api.name} returned status ${response.status}`);
      }
    } catch (error) {
      console.error(`${api.name} error:`, error instanceof Error ? error.message : error);
      // Continue to next API
    }
  }

  // All APIs failed, return default Philippines location
  console.log('All geolocation APIs failed, using default location');
  return {
    country_name: 'Philippines',
    country_code: 'PH',
    city: 'Manila',
    region: 'Metro Manila',
    latitude: 14.5995,
    longitude: 120.9842,
    timezone: 'Asia/Manila',
  };
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

    // Try multiple APIs with automatic fallback
    const locationData = await detectLocationWithFallback(ipAddress);

    // Check if country is blocked using database
    const { data: blockedCheck } = await supabase.rpc('is_country_blocked', {
      p_country_code: locationData.country_code
    });

    if (blockedCheck === true) {
      // Log the blocked access attempt
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

      return new Response(JSON.stringify({
        error: 'Access denied',
        message: 'Service is not available in your region',
        country_code: locationData.country_code,
        country_name: locationData.country_name,
      }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
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
