import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

// Prefer anon key for user-scoped operations; switch if you truly require service role:
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: { name: 'Bolt Integration', version: '1.0.0' },
});

// Helper: CORS
function corsResponse(body: string | object | null, status = 200, origin?: string | null) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': origin && origin !== 'null' ? origin : '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Vary': 'Origin'
  };

  if (status === 204) return new Response(null, { status, headers });

  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin');

  try {
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204, origin);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405, origin);
    }

    // Auth: accept 'Authorization: Bearer <token>' (case-insensitive)
    const rawAuth = req.headers.get('Authorization') ?? req.headers.get('authorization');
    if (!rawAuth?.toLowerCase().startsWith('bearer ')) {
      return corsResponse({ error: 'Missing or invalid authorization header' }, 401, origin);
    }
    const token = rawAuth.slice(7).trim();
    if (!token) {
      return corsResponse({ error: 'Empty bearer token' }, 401, origin);
    }

    // Parse & validate inputs first (avoid substring on undefined)
    const payload = await req.json().catch(() => ({}));
    const { price_id, success_url, cancel_url, mode } = payload ?? {};

    const error = validateParameters(
      { price_id, success_url, cancel_url, mode },
      {
        cancel_url: 'string',
        price_id: 'string',
        success_url: 'string',
        mode: { values: ['payment', 'subscription'] },
      },
    );
    if (error) return corsResponse({ error }, 400, origin);

    // Safe logging after validation
    const safe = (s: string) => (typeof s === 'string' ? (s.length > 50 ? s.slice(0, 50) + '...' : s) : '');
    console.log(`[checkout] price_id=${price_id} mode=${mode}`);
    console.log(`[checkout] success_url=${safe(success_url)} cancel_url=${safe(cancel_url)}`);

    // Authenticate user
    const { data: userRes, error: getUserError } = await supabase.auth.getUser(token);
    if (getUserError) return corsResponse({ error: 'Failed to authenticate user' }, 401, origin);
    const user = userRes?.user;
    if (!user) return corsResponse({ error: 'User not found' }, 404, origin);

    // Validate price exists & matches mode
    let price;
    try {
      price = await stripe.prices.retrieve(price_id, { expand: ['product'] });
    } catch (priceError) {
      console.error(`Error retrieving price ${price_id}`, priceError);
      return corsResponse({ error: 'Invalid price ID' }, 400, origin);
    }
    if (!price?.active) {
      return corsResponse({ error: 'Invalid or inactive price ID' }, 400, origin);
    }
    if (mode === 'subscription') {
      if (!('recurring' in price) || !price.recurring) {
        return corsResponse({ error: 'Price must be recurring for subscription mode' }, 400, origin);
      }
    } else if (mode === 'payment') {
      if (price.type !== 'one_time') {
        return corsResponse({ error: 'Price must be one_time for payment mode' }, 400, origin);
      }
    }

    // Find or create customer mapping
    const { data: customer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (getCustomerError) {
      console.error('DB error fetching customer', getCustomerError);
      return corsResponse({ error: 'Failed to fetch customer information' }, 500, origin);
    }

    let customerId: string;

    if (!customer?.customer_id) {
      const newCustomer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { userId: user.id },
      });
      console.log(`Created Stripe customer ${newCustomer.id} for user ${user.id}`);

      const { error: createCustomerError } = await supabase
        .from('stripe_customers')
        .insert({ user_id: user.id, customer_id: newCustomer.id });

      if (createCustomerError) {
        console.error('Failed to save customer mapping', createCustomerError);
        // Best-effort cleanup
        try { await stripe.customers.del(newCustomer.id); } catch (_) {}
        return corsResponse({ error: 'Failed to create customer mapping' }, 500, origin);
      }

      if (mode === 'subscription') {
        const { error: createSubError } = await supabase
          .from('stripe_subscriptions')
          .insert({ customer_id: newCustomer.id, status: 'not_started' });
        if (createSubError) {
          console.error('Failed to save subscription row', createSubError);
          try { await stripe.customers.del(newCustomer.id); } catch (_) {}
          return corsResponse({ error: 'Unable to save the subscription in the database' }, 500, origin);
        }
      }

      customerId = newCustomer.id;
    } else {
      customerId = customer.customer_id;

      if (mode === 'subscription') {
        const { data: subscription, error: getSubErr } = await supabase
          .from('stripe_subscriptions')
          .select('status')
          .eq('customer_id', customerId)
          .maybeSingle();
        if (getSubErr) {
          console.error('DB error fetching subscription', getSubErr);
          return corsResponse({ error: 'Failed to fetch subscription information' }, 500, origin);
        }
        if (!subscription) {
          const { error: createSubErr } = await supabase
            .from('stripe_subscriptions')
            .insert({ customer_id: customerId, status: 'not_started' });
          if (createSubErr) {
            console.error('DB error creating subscription row', createSubErr);
            return corsResponse({ error: 'Failed to create subscription record for existing customer' }, 500, origin);
          }
        }
      }
    }

    // Create Checkout Session (Stripe recommends omitting payment_method_types for Checkout)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: price_id, quantity: 1 }],
      mode,
      success_url,
      cancel_url,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    if (!session?.url) {
      console.error('Checkout session created without URL', session?.id);
      return corsResponse({ error: 'Failed to create checkout session' }, 500, origin);
    }

    console.log(`Checkout session ${session.id} for customer ${customerId} → ${session.url.slice(0, 50)}...`);
    return corsResponse({ sessionId: session.id, url: session.url }, 200, origin);
  } catch (error: any) {
    console.error(`Checkout error: ${error?.message ?? error}`);
    return corsResponse({ error: error?.message ?? 'Internal error' }, 500, origin);
  }
});

type ExpectedType = 'string' | { values: string[] };
type Expectations<T> = { [K in keyof T]: ExpectedType };

function validateParameters<T extends Record<string, any>>(values: T, expected: Expectations<T>): string | undefined {
  for (const parameter in values) {
    const expectation = expected[parameter];
    const value = values[parameter];

    if (expectation === 'string') {
      if (value == null) return `Missing required parameter ${parameter}`;
      if (typeof value !== 'string') return `Expected parameter ${parameter} to be a string got ${JSON.stringify(value)}`;
    } else {
      if (!expectation.values.includes(value)) {
        return `Expected parameter ${parameter} to be one of ${expectation.values.join(', ')}`;
      }
    }
  }
  return undefined;
}
