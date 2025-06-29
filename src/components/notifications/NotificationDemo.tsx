import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, MessageCircle, Heart, Shield, 
  Zap, Video, Calendar, CreditCard, 
  Settings, Send, RefreshCw
} from 'lucide-react';
import Button from '../ui/Button';
import { useNotificationContext } from './NotificationProvider';
import { notificationService } from '../../services/notificationService';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

const NotificationDemo: React.FC = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver();
  const { showNotification, unreadCount } = useNotificationContext();
  const [selectedType, setSelectedType] = useState('new_message');
  const [isLoading, setIsLoading] = useState(false);

  const notificationTypes = [
    { id: 'new_message', name: 'New Message', icon: MessageCircle, color: 'text-blue-500' },
    { id: 'new_match', name: 'New Match', icon: Heart, color: 'text-pink-500' },
    { id: 'verification_complete', name: 'Verification Complete', icon: Shield, color: 'text-green-500' },
    { id: 'compatibility_update', name: 'Compatibility Update', icon: Zap, color: 'text-purple-500' },
    { id: 'video_call_invitation', name: 'Video Call Invitation', icon: Video, color: 'text-blue-500' },
    { id: 'scheduled_call_reminder', name: 'Call Reminder', icon: Calendar, color: 'text-orange-500' },
    { id: 'payment_failed', name: 'Payment Failed', icon: CreditCard, color: 'text-red-500' }
  ];

  const getNotificationData = (type: string) => {
    switch (type) {
      case 'new_message':
        return {
          title: 'New message from Maria',
          body: 'Maria sent you a new message',
          data: {
            sender_name: 'Maria Santos',
            message_preview: 'Hey there! How are you doing today?',
            sender_id: 'user_123'
          },
          notificationType: 'new_message'
        };
      case 'new_match':
        return {
          title: 'New match!',
          body: 'You matched with David',
          data: {
            match_name: 'David Chen',
            compatibility_score: 92,
            match_id: 'user_456'
          },
          notificationType: 'new_match'
        };
      case 'verification_complete':
        return {
          title: 'Profile verification complete',
          body: 'Your profile has been successfully verified',
          data: {
            verification_result: 'verified',
            verification_score: 95,
            report_id: 'report_789'
          },
          notificationType: 'verification_complete'
        };
      case 'compatibility_update':
        return {
          title: 'Compatibility score updated',
          body: 'Your compatibility with Sarah has increased',
          data: {
            user_name: 'Sarah Johnson',
            old_score: 85,
            new_score: 92,
            user_id: 'user_789'
          },
          notificationType: 'compatibility_update'
        };
      case 'video_call_invitation':
        return {
          title: 'Video call invitation',
          body: 'Carlos is calling you',
          data: {
            caller_name: 'Carlos Rodriguez',
            call_id: 'call_123',
            caller_id: 'user_321'
          },
          notificationType: 'video_call_invitation'
        };
      case 'scheduled_call_reminder':
        return {
          title: 'Scheduled call reminder',
          body: 'Your call with Jennifer starts in 15 minutes',
          data: {
            contact_name: 'Jennifer Kim',
            call_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            call_id: 'call_456'
          },
          notificationType: 'scheduled_call_reminder'
        };
      case 'payment_failed':
        return {
          title: 'Payment failed',
          body: 'Your recent payment for Premium subscription failed',
          data: {
            subscription_id: 'sub_123',
            amount: 14.99,
            retry_url: '/settings/billing'
          },
          notificationType: 'payment_failed'
        };
      default:
        return {
          title: 'Notification',
          body: 'You have a new notification',
          data: {},
          notificationType: 'system_announcement'
        };
    }
  };

  const handleSendNotification = async () => {
    setIsLoading(true);
    
    try {
      const notificationData = getNotificationData(selectedType);
      
      // In a real app, this would create a notification in the database
      // For demo purposes, we'll just show the notification toast
      showNotification({
        id: `demo_${Date.now()}`,
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data,
        isRead: false,
        createdAt: new Date().toISOString(),
        notificationType: notificationData.notificationType
      });
      
      // Simulate creating a notification in the database
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error('Error sending notification:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section ref={elementRef} className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex p-3 bg-blue-100 rounded-full mb-6">
            <Bell className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Real-time Notification System
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Keep users engaged with our comprehensive notification system supporting
            multiple channels and personalized preferences.
          </p>
        </motion.div>

        {/* Demo Interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto"
        >
          <div className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Try the Notification System</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Notification Types */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Select Notification Type</h4>
                <div className="space-y-3">
                  {notificationTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`w-full flex items-center p-3 rounded-lg border transition-colors ${
                        selectedType === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`p-2 rounded-full mr-3 ${
                        selectedType === type.id ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <type.icon className={`w-5 h-5 ${type.color}`} />
                      </div>
                      <span className={selectedType === type.id ? 'font-medium' : ''}>
                        {type.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Preview & Send */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Notification Preview</h4>
                <div className="p-4 border border-gray-200 rounded-lg mb-6">
                  <div className="flex items-start mb-4">
                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                      {notificationTypes.find(t => t.id === selectedType)?.icon && 
                        React.createElement(
                          notificationTypes.find(t => t.id === selectedType)!.icon,
                          { className: `w-5 h-5 ${notificationTypes.find(t => t.id === selectedType)!.color}` }
                        )
                      }
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">
                        {getNotificationData(selectedType).title}
                      </h5>
                      <p className="text-sm text-gray-600 mt-1">
                        {getNotificationData(selectedType).body}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <p className="font-medium">Additional Data:</p>
                    <pre className="mt-1 p-2 bg-gray-50 rounded overflow-auto">
                      {JSON.stringify(getNotificationData(selectedType).data, null, 2)}
                    </pre>
                  </div>
                </div>
                
                <Button
                  onClick={handleSendNotification}
                  loading={isLoading}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Test Notification
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
        >
          {[
            {
              icon: Bell,
              title: 'Multi-Channel Delivery',
              description: 'Send notifications via email, push, SMS, and in-app channels based on user preferences.'
            },
            {
              icon: Settings,
              title: 'Preference Management',
              description: 'Let users customize which notifications they receive and through which channels.'
            },
            {
              icon: RefreshCw,
              title: 'Reliable Delivery',
              description: 'Built-in retry logic, delivery tracking, and comprehensive logging for reliability.'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="inline-flex p-3 rounded-lg bg-blue-50 mb-4">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default NotificationDemo;