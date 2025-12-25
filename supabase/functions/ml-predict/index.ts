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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT token
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { userId, targetUserId } = await req.json();

    // Validate input
    if (!userId || !targetUserId) {
      throw new Error('Missing required parameters: userId and targetUserId');
    }

    // Call the predict_match_success function
    const { data: prediction, error: predictionError } = await supabaseClient
      .rpc('predict_match_success', {
        p_user_id: userId,
        p_target_user_id: targetUserId,
      });

    if (predictionError) {
      throw predictionError;
    }

    // Get ML model predictions if available
    const { data: mlPredictions, error: mlError } = await supabaseClient
      .from('ml_predictions')
      .select('*')
      .eq('user_id', userId)
      .eq('target_user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(1);

    // Combine predictions
    const result = {
      success: true,
      prediction,
      mlPrediction: mlPredictions && mlPredictions.length > 0 ? mlPredictions[0] : null,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
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
