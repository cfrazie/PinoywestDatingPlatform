import { supabase } from './supabase';
import { stripeProducts } from '../stripe-config';

export interface CheckoutOptions {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  mode?: 'payment' | 'subscription';
}

export async function createCheckoutSession(options: CheckoutOptions) {
  const { priceId, successUrl, cancelUrl, mode = 'subscription' } = options;

  try {
    // Get the current user's JWT token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('You must be logged in to make a purchase');
    }

    // Call the Supabase Edge Function to create a checkout session
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        price_id: priceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        mode,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    throw new Error(error.message || 'Failed to create checkout session');
  }
}

export async function redirectToCheckout(priceId: string) {
  try {
    // Find the product by price ID
    const product = findProductByPriceId(priceId);
    
    if (!product) {
      console.error('Product not found for priceId:', priceId);
      throw new Error(`Invalid product selected. Price ID: ${priceId}`);
    }
    
    console.log('Redirecting to checkout with product:', product);

    // Create the checkout session
    const { url } = await createCheckoutSession({
      priceId,
      successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/checkout/canceled`,
      mode: product.mode as 'payment' | 'subscription',
    });

    // Redirect to the checkout page
    if (url) {
      console.log('Redirecting to checkout URL:', url);
      window.location.href = url;
    } else {
      throw new Error('No checkout URL returned');
    }
  } catch (error: any) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
}

export async function getUserSubscription() {
  try {
    const { data, error } = await supabase
      .from('stripe_user_subscriptions')
      .select('*')
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
}

export async function getUserOrders() {
  try {
    const { data, error } = await supabase
      .from('stripe_user_orders')
      .select('*')
      .order('order_date', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

export function getSubscriptionStatus(status: string) {
  switch (status) {
    case 'active':
      return { label: 'Active', color: 'green' };
    case 'trialing':
      return { label: 'Trial', color: 'blue' };
    case 'past_due':
      return { label: 'Past Due', color: 'yellow' };
    case 'canceled':
      return { label: 'Canceled', color: 'red' };
    case 'incomplete':
      return { label: 'Incomplete', color: 'orange' };
    case 'incomplete_expired':
      return { label: 'Expired', color: 'gray' };
    case 'unpaid':
      return { label: 'Unpaid', color: 'red' };
    case 'paused':
      return { label: 'Paused', color: 'purple' };
    default:
      return { label: 'Unknown', color: 'gray' };
  }
}

export function getProductNameFromPriceId(priceId: string) {
  const product = stripeProducts.find(p => p.priceId === priceId);
  return product ? product.name : 'Unknown Product';
}

// Get deployment status
export async function getDeploymentStatus(deployId?: string) {
  try {
    if (!supabase) {
      return null;
    }

    let query = supabase
      .from('deployment_status')
      .select('*');

    if (deployId) {
      query = query.eq('deploy_id', deployId);
    } else {
      // Get the most recent deployment
      query = query.order('created_at', { ascending: false }).limit(1);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching deployment status:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getDeploymentStatus:', error);
    return null;
  }
}