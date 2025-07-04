// Stripe product configuration
export const stripeProducts = [
  {
    id: 'prod_SaM1erWmdtIKxT',
    name: 'Platinum',
    priceId: 'price_1RfBJUAxEddEOHWCkoxxgbM7',
    description: 'For serious relationship seekers $29.99/month. Everything in Premium, plus: Profile boost (3x more visibility), Exclusive access to verified members, Advanced AI compatibility insights, Personal relationship coach, Cultural exchange workshops, VIP customer support, Advanced compatibility reports, Travel planning assistance, Success story features',
    mode: 'subscription'
  },
  {
    id: 'prod_SaLyUKs2auXcof',
    name: 'Premium',
    priceId: 'price_1RfBGZAxEddEOHWCFEp7sfrE',
    description: 'Most popular choice $14.99/month. Everything in Basic, plus: Unlimited messaging, Advanced matching with cultural preferences, Video chat and virtual dates, Real-time translation, AI-powered compatibility scoring, Gift messaging points to Basic members (20 points/week), Connect with up to 4 Basic members weekly via gifts, Priority customer support, See who viewed your profile, Advanced privacy controls',
    mode: 'subscription'
  },
  {
    id: 'prod_SaM68f1eFfwu0b',
    name: 'Premium Annually',
    priceId: 'price_1RfBOlAxEddEOHWCmT4aLzu7',
    description: 'Most popular choice $149.99/year ($12.50/month billed annually). Everything in Basic, plus: Unlimited messaging, Advanced matching with cultural preferences, Video chat and virtual dates, Real-time translation, AI-powered compatibility scoring, Gift messaging points to Basic members (20 points/week), Connect with up to 4 Basic members weekly via gifts, Priority customer support, See who viewed your profile, Advanced privacy controls',
    mode: 'subscription'
  },
  {
    id: 'prod_SaMGZX1lVfKeRW',
    name: 'Platinum Annually',
    priceId: 'price_1RfBXlAxEddEOHWCLv9xRoyi',
    description: 'For serious relationship seekers $299.99/year ($25.00/month billed annually). Everything in Premium, plus: Profile boost (3x more visibility), Exclusive access to verified members, Advanced AI compatibility insights, Personal relationship coach, Cultural exchange workshops, VIP customer support, Advanced compatibility reports, Travel planning assistance, Success story features',
    mode: 'subscription'
  }
];

// Find a product by price ID
export const findProductByPriceId = (priceId: string) => {
  return stripeProducts.find(product => product.priceId === priceId);
};

// Get all subscription products
export const getSubscriptionProducts = () => {
  return stripeProducts.filter(product => product.mode === 'subscription');
};

// Get monthly subscription products
export const getMonthlySubscriptionProducts = () => {
  return stripeProducts.filter(
    product => product.mode === 'subscription' && !product.name.includes('Annually')
  );
};

// Get yearly subscription products
export const getYearlySubscriptionProducts = () => {
  return stripeProducts.filter(
    product => product.mode === 'subscription' && product.name.includes('Annually')
  );
};