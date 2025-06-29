@@ .. @@
 import OptimizedImage from '../ui/OptimizedImage';
 import ProfileVerificationBadge from '../verification/ProfileVerificationBadge';
 import VerificationRequestButton from '../verification/VerificationRequestButton';
+import NotificationSettings from '../notifications/NotificationSettings';
 import CompatibilityScore from '../compatibility/CompatibilityScore';
 import CompatibilityInsights from '../compatibility/CompatibilityInsights';
@@ .. @@
+            <div className="mb-6">
+              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
+              <NotificationSettings userId={currentUserId} />
+            </div>
+            
             {/* Verification Status */}
             <div className="mb-6">
               <h2 className="text-lg font-semibold text-gray-900 mb-3">Verification Status</h2>