import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, X, Check, Settings, Info, 
  Mail, Smartphone, MessageSquare, AlertTriangle
} from 'lucide-react';
import Button from '../ui/Button';
import { 
  useNotifications, 
  NotificationType, 
  NotificationChannel 
} from '../../hooks/useNotifications';

interface NotificationPreferencesProps {
  userId: string;
  onClose: () => void;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  userId,
  onClose
}) => {
  const {
    preferences,
    notificationTypes,
    channels,
    updatePreference
  } = useNotifications(userId);
  
  const [userPreferences, setUserPreferences] = useState<Record<string, {
    isEnabled: boolean;
    channels: Record<string, boolean>;
  }>>({});
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Initialize user preferences
  useEffect(() => {
    const initialPreferences: Record<string, {
      isEnabled: boolean;
      channels: Record<string, boolean>;
    }> = {};
    
    // Initialize with default values from notification types
    notificationTypes.forEach(type => {
      initialPreferences[type.name] = {
        isEnabled: true,
        channels: {}
      };
      
      // Set default channels
      channels.forEach(channel => {
        initialPreferences[type.name].channels[channel.name] = 
          type.defaultChannels.includes(channel.name);
      });
    });
    
    // Override with user preferences
    preferences.forEach(pref => {
      if (initialPreferences[pref.notificationType]) {
        initialPreferences[pref.notificationType].isEnabled = pref.isEnabled;
        
        // Reset channels
        channels.forEach(channel => {
          initialPreferences[pref.notificationType].channels[channel.name] = 
            pref.channels.includes(channel.name);
        });
      }
    });
    
    setUserPreferences(initialPreferences);
    
    // Set initial active category
    if (notificationTypes.length > 0) {
      const categories = [...new Set(notificationTypes.map(type => type.category))];
      if (categories.length > 0) {
        setActiveCategory(categories[0]);
      }
    }
  }, [preferences, notificationTypes, channels]);

  // Get notification types by category
  const getTypesByCategory = (category: string) => {
    return notificationTypes.filter(type => type.category === category);
  };

  // Get unique categories
  const getCategories = () => {
    return [...new Set(notificationTypes.map(type => type.category))];
  };

  // Format category name
  const formatCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
  };

  // Handle toggle notification
  const handleToggleNotification = (typeName: string) => {
    setUserPreferences(prev => ({
      ...prev,
      [typeName]: {
        ...prev[typeName],
        isEnabled: !prev[typeName].isEnabled
      }
    }));
  };

  // Handle toggle channel
  const handleToggleChannel = (typeName: string, channelName: string) => {
    setUserPreferences(prev => ({
      ...prev,
      [typeName]: {
        ...prev[typeName],
        channels: {
          ...prev[typeName].channels,
          [channelName]: !prev[typeName].channels[channelName]
        }
      }
    }));
  };

  // Save preferences
  const handleSavePreferences = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // Save each preference
      const savePromises = Object.entries(userPreferences).map(([typeName, pref]) => {
        const enabledChannels = Object.entries(pref.channels)
          .filter(([_, isEnabled]) => isEnabled)
          .map(([channelName]) => channelName);
        
        return updatePreference(typeName, pref.isEnabled, enabledChannels);
      });
      
      await Promise.all(savePromises);
      
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setIsSaving(false);
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-4xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">Notification Preferences</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-blue-100">
            Customize how and when you receive notifications
          </p>
        </div>

        <div className="flex h-[calc(90vh-6rem)]">
          {/* Categories Sidebar */}
          <div className="w-64 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
              <div className="space-y-1">
                {getCategories().map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
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

          {/* Preferences Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeCategory && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {formatCategoryName(activeCategory)} Notifications
                </h3>
                
                <div className="space-y-6">
                  {getTypesByCategory(activeCategory).map(type => (
                    <div key={type.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div>
                          <h4 className="font-medium text-gray-900">{type.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h4>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                        
                        <div className="relative inline-block w-12 mr-2 align-middle select-none">
                          <input
                            type="checkbox"
                            id={`toggle-${type.name}`}
                            checked={userPreferences[type.name]?.isEnabled || false}
                            onChange={() => handleToggleNotification(type.name)}
                            className="sr-only"
                          />
                          <label
                            htmlFor={`toggle-${type.name}`}
                            className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                              userPreferences[type.name]?.isEnabled ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                                userPreferences[type.name]?.isEnabled ? 'translate-x-6' : 'translate-x-0'
                              }`}
                            ></span>
                          </label>
                        </div>
                      </div>
                      
                      {userPreferences[type.name]?.isEnabled && (
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
                                  checked={userPreferences[type.name]?.channels[channel.name] || false}
                                  onChange={() => handleToggleChannel(type.name, channel.name)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-green-600 flex items-center"
              >
                <Check className="w-4 h-4 mr-1" />
                Preferences saved successfully!
              </motion.div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePreferences}
              loading={isSaving}
            >
              <Settings className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NotificationPreferences;