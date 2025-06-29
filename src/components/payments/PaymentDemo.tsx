@@ .. @@
 import { motion } from 'framer-motion';
 import { 
   CreditCard, Shield, Lock, CheckCircle, Star, 
-  DollarSign, Calendar, Users, Zap, Award
+  DollarSign, Calendar, Users, Zap, Award, AlertTriangle
 } from 'lucide-react';
 import Button from '../ui/Button';
 import PaymentForm from '../payments/PaymentForm';
 import SubscriptionManager from '../payments/SubscriptionManager';
 import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
-import { PricingPlan } from '../../types/payments';
+import { redirectToCheckout } from '../../lib/stripe';
+import { stripeProducts } from '../../stripe-config';
 
 const PaymentDemo: React.FC = () => {
   const { elementRef, isIntersecting } = useIntersectionObserver();
   const [showPaymentForm, setShowPaymentForm] = useState(false);
   const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
-  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
+  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
   const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
+  const [isLoading, setIsLoading] = useState(false);
+  const [error, setError] = useState<string | null>(null);
 
-  const plans: PricingPlan[] = [
-    {
-      id: 'basic',
-      name: 'Basic',
-      description: 'Perfect for getting started',
-      monthlyPrice: 0,
-      yearlyPrice: 0,
-      features: [
-        'Create profile and browse members',
-        'Send up to 10 messages per day',
-        'Basic matching algorithm',
-        'Standard customer support',
-        'Mobile app access'
-      ]
-    },
-    {
-      id: 'premium',
-      name: 'Premium',
-      description: 'Most popular choice',
-      monthlyPrice: 14.99,
-      yearlyPrice: 149.99,
-      popular: true,
-      features: [
-        'Everything in Basic',
-        'Unlimited messaging',
-        'Advanced matching with cultural preferences',
-        'Video chat and virtual dates',
-        'Real-time translation',
-        'Priority customer support',
-        'See who viewed your profile',
-        'Advanced privacy controls'
-      ]
-    },
-    {
-      id: 'platinum',
-      name: 'Platinum',
-      description: 'For serious relationship seekers',
-      monthlyPrice: 29.99,
-      yearlyPrice: 299.99,
-      features: [
-        'Everything in Premium',
-        'Profile boost (3x more visibility)',
-        'Exclusive access to verified members',
-        'Personal relationship coach',
-        'Cultural exchange workshops',
-        'VIP customer support',
-        'Advanced compatibility reports',
-        'Travel planning assistance'
-      ]
-    }
-  ];
+  // Basic plan (free tier)
+  const basicPlan = {
+    id: 'basic',
+    name: 'Basic',
+    description: 'Perfect for getting started',
+    monthlyPrice: 0,
+    yearlyPrice: 0,
+    features: [
+      'Create profile and browse members',
+      'Send up to 10 messages per day',
+      'Basic matching algorithm',
+      'Standard customer support',
+      'Mobile app access'
+    ]
+  };
+
+  // Get monthly and yearly plans from stripe-config
+  const monthlyPlans = stripeProducts
+    .filter(product => !product.name.includes('Annually'))
+    .map(product => {
+      const price = parseFloat(product.description.match(/\$(\d+\.\d+)/)?.[1] || '0');
+      return {
+        id: product.id,
+        name: product.name,
+        description: product.name === 'Premium' ? 'Most popular choice' : 'For serious relationship seekers',
+        monthlyPrice: price,
+        yearlyPrice: 0, // Not used for monthly plans
+        priceId: product.priceId,
+        popular: product.name === 'Premium',
+        features: product.name === 'Premium' 
+          ? [
+              'Everything in Basic',
+              'Unlimited messaging',
+              'Advanced matching with cultural preferences',
+              'Video chat and virtual dates',
+              'Real-time translation',
+              'AI-powered compatibility scoring',
+              'Gift messaging points to Basic members (20 points/week)',
+              'Connect with up to 4 Basic members weekly via gifts',
+              'Priority customer support',
+              'See who viewed your profile',
+              'Advanced privacy controls',
+            ]
+          : [
+              'Everything in Premium',
+              'Profile boost (3x more visibility)',
+              'Exclusive access to verified members',
+              'Advanced AI compatibility insights',
+              'Personal relationship coach',
+              'Cultural exchange workshops',
+              'VIP customer support',
+              'Advanced compatibility reports',
+              'Travel planning assistance',
+            ]
+      };
+    });
+
+  const yearlyPlans = stripeProducts
+    .filter(product => product.name.includes('Annually'))
+    .map(product => {
+      const price = parseFloat(product.description.match(/\$(\d+\.\d+)/)?.[1] || '0');
+      const monthlyEquivalent = parseFloat(product.description.match(/\$(\d+\.\d+)\/month/)?.[1] || '0');
+      return {
+        id: product.id,
+        name: product.name.replace(' Annually', ''),
+        description: product.name.includes('Premium') ? 'Most popular choice' : 'For serious relationship seekers',
+        monthlyPrice: 0, // Not used for yearly plans
+        yearlyPrice: price,
+        monthlyEquivalent,
+        priceId: product.priceId,
+        popular: product.name.includes('Premium'),
+        features: product.name.includes('Premium')
+          ? [
+              'Everything in Basic',
+              'Unlimited messaging',
+              'Advanced matching with cultural preferences',
+              'Video chat and virtual dates',
+              'Real-time translation',
+              'AI-powered compatibility scoring',
+              'Gift messaging points to Basic members (20 points/week)',
+              'Connect with up to 4 Basic members weekly via gifts',
+              'Priority customer support',
+              'See who viewed your profile',
+              'Advanced privacy controls',
+            ]
+          : [
+              'Everything in Premium',
+              'Profile boost (3x more visibility)',
+              'Exclusive access to verified members',
+              'Advanced AI compatibility insights',
+              'Personal relationship coach',
+              'Cultural exchange workshops',
+              'VIP customer support',
+              'Advanced compatibility reports',
+              'Travel planning assistance',
+            ]
+      };
+    });
+
+  // Combine plans based on billing cycle
+  const plans = [
+    basicPlan,
+    ...(billingCycle === 'monthly' ? monthlyPlans : yearlyPlans)
+  ];
 
   const features = [
@@ .. @@
     },
   ];
 
-  const handlePlanSelect = (plan: PricingPlan) => {
-    if (plan.monthlyPrice === 0) {
+  const handlePlanSelect = async (plan: any) => {
+    if (plan.id === 'basic') {
       alert('🎉 Welcome to PinoyWest! Your free Basic plan is ready to use!');
       return;
     }
     
-    setSelectedPlan(plan);
-    setShowPaymentForm(true);
-  };
-
-  const handlePaymentSuccess = (paymentResult: any) => {
-    setShowPaymentForm(false);
-    alert(`🎉 Payment successful! Welcome to ${selectedPlan?.name} plan!`);
-    console.log('Payment result:', paymentResult);
+    if (!plan.priceId) {
+      alert('Invalid product selected. Please try again.');
+      return;
+    }
+    
+    try {
+      setIsLoading(true);
+      setError(null);
+      await redirectToCheckout(plan.priceId);
+    } catch (error: any) {
+      console.error('Error during checkout:', error);
+      setError(error.message || 'There was an error processing your request. Please try again.');
+    } finally {
+      setIsLoading(false);
+    }
   };
 
   const handleShowSubscriptionManager = () => {
@@ .. @@
             <div className="text-center mb-8">
               <h3 className="text-2xl font-bold text-gray-900 mb-4">
                 Try Our Payment System
               </h3>
-              <p className="text-gray-600 mb-6">
+              <p className="text-gray-600 mb-4">
                 Select a plan to experience our secure checkout process
               </p>
+              
+              {error && (
+                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
+                  <div className="flex items-center text-red-700">
+                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
+                    <p>{error}</p>
+                  </div>
+                </div>
+              )}
 
               {/* Billing Toggle */}
               <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
@@ .. @@
                     <Button
                       variant={plan.popular ? 'primary' : 'outline'}
                       size="lg"
+                      loading={isLoading}
                       className="w-full"
                       onClick={() => handlePlanSelect(plan)}
                     >
@@ .. @@
                 <Button
                   variant="primary"
                   onClick={handleShowSubscriptionManager}
+                  disabled={isLoading}
                   className="flex items-center"
                 >
                   <Star className="w-4 h-4 mr-2" />
@@ .. @@
                 <Button
                   variant="outline"
-                  onClick={() => handlePlanSelect(plans[1])}
+                  onClick={() => handlePlanSelect(monthlyPlans[0])}
+                  disabled={isLoading}
                   className="flex items-center"
                 >
                   <CreditCard className="w-4 h-4 mr-2" />
@@ .. @@
         </div>
       </section>
 
-      {/* Payment Form Modal */}
-      {showPaymentForm && selectedPlan && (
-        <motion.div
-          initial={{ opacity: 0 }}
-          animate={{ opacity: 1 }}
-          exit={{ opacity: 0 }}
-          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
-        >
-          <motion.div
-            initial={{ scale: 0.9, opacity: 0 }}
-            animate={{ scale: 1, opacity: 1 }}
-            exit={{ scale: 0.9, opacity: 0 }}
-            className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
-          >
-            <PaymentForm
-              plan={selectedPlan}
-              billingCycle={billingCycle}
-              onSuccess={handlePaymentSuccess}
-              onCancel={() => setShowPaymentForm(false)}
-            />
-          </motion.div>
-        </motion.div>
-      )}
-
       {/* Subscription Manager Modal */}
       {showSubscriptionManager && (
         <motion.div