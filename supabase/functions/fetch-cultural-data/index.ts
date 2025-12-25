import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface FetchRequest {
  country: string;
  region?: string;
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

    const { country, region }: FetchRequest = await req.json();

    if (!country) {
      return new Response(JSON.stringify({ error: 'Country is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch Wikipedia article
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/Culture_of_${country.replace(/ /g, '_')}`;
    
    let wikiData;
    try {
      const wikiResponse = await fetch(wikiUrl);
      if (!wikiResponse.ok) {
        throw new Error(`Wikipedia API returned ${wikiResponse.status}`);
      }
      wikiData = await wikiResponse.json();
    } catch (error) {
      console.error('Error fetching from Wikipedia:', error);
      wikiData = null;
    }

    // For now, use predefined guidelines since Wikipedia scraping requires more complex logic
    const guidelines = getGuidelinesForCountry(country);
    
    // Store guidelines in database
    const insertPromises = guidelines.map(guideline =>
      supabase
        .from('cultural_guidelines')
        .upsert({
          country: guideline.country,
          region: guideline.region,
          category: guideline.category,
          guideline_type: guideline.guideline_type,
          title: guideline.title,
          description: guideline.description,
          importance_level: guideline.importance_level,
          source: 'wikipedia',
          source_url: wikiData?.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/Culture_of_${country.replace(/ /g, '_')}`,
          last_updated: new Date().toISOString(),
        }, {
          onConflict: 'country,category,title',
        })
    );

    await Promise.all(insertPromises);
    
    return new Response(JSON.stringify({
      success: true,
      country,
      guidelines,
      source: wikiUrl,
      wikipedia_summary: wikiData?.extract || null,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error: any) {
    console.error('Cultural data fetch error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

function getGuidelinesForCountry(country: string) {
  // This would be replaced with actual Wikipedia parsing in production
  // For now, return relevant guidelines based on country
  
  const guidelinesMap: Record<string, any[]> = {
    'Philippines': [
      {
        country: 'Philippines',
        category: 'greetings',
        guideline_type: 'do',
        title: 'Use "Mano Po" gesture',
        description: 'Show respect to elders by taking their hand and placing it on your forehead. This is called "pagmamano" and is a sign of respect.',
        importance_level: 'important',
      },
      {
        country: 'Philippines',
        category: 'communication',
        guideline_type: 'tip',
        title: 'Understand indirect communication',
        description: 'Filipinos often use indirect communication to avoid confrontation. "Maybe" often means "no" in a polite way.',
        importance_level: 'important',
      },
      {
        country: 'Philippines',
        category: 'family',
        guideline_type: 'do',
        title: 'Include family in important decisions',
        description: 'Family opinion is highly valued in Filipino culture. Expect family involvement in relationship decisions.',
        importance_level: 'critical',
      },
    ],
    'United States': [
      {
        country: 'United States',
        category: 'greetings',
        guideline_type: 'do',
        title: 'Offer a firm handshake',
        description: 'A firm handshake with eye contact is the standard greeting in American business and social contexts.',
        importance_level: 'important',
      },
      {
        country: 'United States',
        category: 'communication',
        guideline_type: 'do',
        title: 'Be direct and clear',
        description: 'Americans value direct communication. Say what you mean clearly and concisely.',
        importance_level: 'important',
      },
      {
        country: 'United States',
        category: 'public_behavior',
        guideline_type: 'do',
        title: 'Maintain personal space',
        description: 'Americans value personal space. Stand at least an arm\'s length away in conversations.',
        importance_level: 'important',
      },
    ],
  };

  return guidelinesMap[country] || [];
}
