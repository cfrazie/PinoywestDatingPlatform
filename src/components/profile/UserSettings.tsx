@@ .. @@
 import { motion } from 'framer-motion';
 import { 
   User, Lock, Bell, CreditCard, Shield, 
-  Globe, Smartphone, LogOut, Save, Check
+  Globe, Smartphone, LogOut, Save, Check, Settings
 } from 'lucide-react';
 import Button from '../ui/Button';
+import NotificationSettings from '../notifications/NotificationSettings';
@@ .. @@
           {activeTab === 'notifications' && (
             <motion.div
               key="notifications"
-              initial={{ opacity: 0, x: 20 }}
-              animate={{ opacity: 1, x: 0 }}
-              exit={{ opacity: 0, x: -20 }}
-              className="space-y-6"
+              initial={{ opacity: 0 }}
+              animate={{ opacity: 1 }}
+              exit={{ opacity: 0 }}
             >
-              <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Settings</h2>
-              
-              {/* Notification settings would go here */}
-              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
-                <div className="flex items-center">
-                  <Bell className="w-5 h-5 text-yellow-600 mr-2" />
-                  <p className="text-yellow-700">
-                    Notification settings will be implemented here.
-                  </p>
-                </div>
-              </div>
+              <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
+              <NotificationSettings userId={userId} />
             </motion.div>
           )}