import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { userId, batchSize = 50 } = await req.json();

    // If userId provided, update for specific user
    if (userId) {
      const { error } = await supabaseClient.rpc('refresh_recommendations_cache', {
        p_user_id: userId,
      });

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Recommendations updated for user ${userId}`,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Otherwise, update for all active users (batch job)
    // Get active users (logged in within last 7 days)
    const { data: activeUsers, error: usersError } = await supabaseClient
      .from('user_engagement_patterns')
      .select('user_id')
      .gte('last_calculated', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(batchSize);

    if (usersError) {
      throw usersError;
    }

    if (!activeUsers || activeUsers.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active users to update',
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Update recommendations for each user
    const updatePromises = activeUsers.map((user) =>
      supabaseClient.rpc('refresh_recommendations_cache', {
        p_user_id: user.user_id,
      })
    );

    const results = await Promise.allSettled(updatePromises);

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Batch update completed`,
        stats: {
          total: activeUsers.length,
          successful,
          failed,
        },
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
