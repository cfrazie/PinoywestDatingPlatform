import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Settings, Mail, Smartphone, MessageSquare,
  Check, X, Info, AlertTriangle, Save
} from 'lucide-react';
import Button from '../ui/Button';
import { 
  useNotifications, 
  NotificationType, 
  NotificationChannel,
  NotificationPreference
} from '../../hooks/useNotifications';

interface NotificationSettingsProps {
  userId: string;
  className?: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  userId,
  className = ''
}) => {
  const {
    notificationTypes,
    channels,
    preferences,
    updatePreference,
    isLoading,
    error
  } = useNotifications(userId);
  
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Group notification types by category
  const notificationsByCategory = notificationTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, NotificationType[]>);
  
  // Set initial active category
  useEffect(() => {
    if (Object.keys(notificationsByCategory).length > 0 && !activeCategory) {
      setActiveCategory(Object.keys(notificationsByCategory)[0]);
    }
  }, [notificationsByCategory, activeCategory]);
  
  // Get user preference for a notification type
  const getUserPreference = (typeName: string): NotificationPreference | undefined => {
    return preferences.find(p => p.notificationType === typeName);
  };
  
  // Check if a channel is enabled for a notification type
  const isChannelEnabled = (typeName: string, channelName: string): boolean => {
    const pref = getUserPreference(typeName);
    return pref ? pref.channels.includes(channelName) : false;
  };
  
  // Format category name
  const formatCategoryName = (category: string): string => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Handle toggle notification
  const handleToggleNotification = async (typeName: string, isEnabled: boolean) => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const pref = getUserPreference(typeName);
      const channels = pref?.channels || 
        notificationTypes.find(t => t.name === typeName)?.defaultChannels || [];
      
      await updatePreference(typeName, isEnabled, channels);
      
      setSaveMessage({
        type: 'success',
        text: `${isEnabled ? 'Enabled' : 'Disabled'} ${typeName} notifications`
      });
    } catch (err) {
      console.error('Error updating notification preference:', err);
      setSaveMessage({
        type: 'error',
        text: 'Failed to update preference'
      });
    } finally {
      setIsSaving(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    }
  };
  
  // Handle toggle channel
  const handleToggleChannel = async (typeName: string, channelName: string) => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const pref = getUserPreference(typeName);
      const isEnabled = pref?.isEnabled ?? true;
      
      let channels = [...(pref?.channels || [])];
      
      if (channels.includes(channelName)) {
        channels = channels.filter(c => c !== channelName);
      } else {
        channels.push(channelName);
      }
      
      await updatePreference(typeName, isEnabled, channels);
      
      setSaveMessage({
        type: 'success',
        text: `Updated channel preferences for ${typeName}`
      });
    } catch (err) {
      console.error('Error updating channel preference:', err);
      setSaveMessage({
        type: 'error',
        text: 'Failed to update channel preference'
      });
    } finally {
      setIsSaving(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    }
  };
  
  // Get channel icon
  const getChannelIcon = (channelName: string) => {
    switch (channelName) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'push':
        return <Smartphone className="w-4 h-4" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      case 'in_app':
        return <Bell className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-center h-32 text-center">
          <div>
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-gray-600">Failed to load notification settings</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <div className="flex items-center space-x-3">
          <Bell className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Notification Settings</h2>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Categories */}
        <div className="md:w-48 border-r border-gray-200">
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-3 text-sm">Categories</h3>
            <div className="space-y-1">
              {Object.keys(notificationsByCategory).map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                    activeCategory === category
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {formatCategoryName(category)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Settings */}
        <div className="flex-1 p-4">
          {activeCategory && notificationsByCategory[activeCategory] && (
            <>
              <h3 className="font-medium text-gray-900 mb-4">
                {formatCategoryName(activeCategory)} Notifications
              </h3>
              
              <div className="space-y-4">
                {notificationsByCategory[activeCategory].map(type => {
                  const userPref = getUserPreference(type.name);
                  const isEnabled = userPref?.isEnabled ?? true;
                  
                  return (
                    <div key={type.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {type.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </h4>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                        
                        <div className="relative inline-block w-12 mr-2 align-middle select-none">
                          <input
                            type="checkbox"
                            id={`toggle-${type.name}`}
                            checked={isEnabled}
                            onChange={() => handleToggleNotification(type.name, !isEnabled)}
                            className="sr-only"
                          />
                          <label
                            htmlFor={`toggle-${type.name}`}
                            className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                              isEnabled ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                                isEnabled ? 'translate-x-6' : 'translate-x-0'
                              }`}
                            ></span>
                          </label>
                        </div>
                      </div>
                      
                      {isEnabled && (
                        <div className="p-4 border-t border-gray-200">
                          <h5 className="text-sm font-medium text-gray-700 mb-3">Notification Channels</h5>
                          <div className="space-y-2">
                            {channels.map(channel => (
                              <label
                                key={channel.id}
                                className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center">
                                  {getChannelIcon(channel.name)}
                                  <span className="ml-2 text-sm text-gray-700 capitalize">{channel.name}</span>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={isChannelEnabled(type.name, channel.name)}
                                  onChange={() => handleToggleChannel(type.name, channel.name)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
          
          {/* Save message */}
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-lg ${
                saveMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              <div className="flex items-center">
                {saveMessage.type === 'success' ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mr-2" />
                )}
                <span>{saveMessage.text}</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;