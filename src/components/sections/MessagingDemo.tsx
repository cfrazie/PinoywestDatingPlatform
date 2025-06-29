import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Heart, Zap, Shield, Globe } from 'lucide-react';
import Button from '../ui/Button';
import MessagingDashboard from '../messaging/MessagingDashboard';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { ChatUser } from '../../types/messaging';

const MessagingDemo: React.FC = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver();
  const [showMessaging, setShowMessaging] = useState(false);

  // Mock current user
  const currentUser: ChatUser = {
    id: 'current_user',
    name: 'You',
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
    isOnline: true,
    lastSeen: 'Online'
  };

  const features = [
    {
      icon: MessageCircle,
      title: 'Real-time Messaging',
      description: 'Instant message delivery with read receipts and typing indicators',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Globe,
      title: 'Auto Translation',
      description: 'Break language barriers with real-time message translation',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Heart,
      title: 'Rich Media Sharing',
      description: 'Share photos, voice messages, and files seamlessly',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      icon: Shield,
      title: 'End-to-End Encryption',
      description: 'Your conversations are private and secure',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Users,
      title: 'Smart Matching',
      description: 'Connect with compatible people based on your preferences',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized for speed with offline message sync',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <>
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
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Connect Through Meaningful Conversations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Experience our advanced messaging system designed specifically for 
              cross-cultural relationships. Break down barriers and build lasting connections.
            </p>
            
            <Button
              size="lg"
              onClick={() => setShowMessaging(true)}
              className="group"
            >
              <MessageCircle className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Try Live Demo
            </Button>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className={`inline-flex p-3 rounded-lg ${feature.bgColor} mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
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

          {/* Demo Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              See It In Action
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Experience our messaging platform with a live interactive demo. 
              See how easy it is to connect with people from different cultures 
              and backgrounds.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Instant Messaging</h4>
                <p className="text-sm text-gray-600">Real-time chat with typing indicators</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Auto Translation</h4>
                <p className="text-sm text-gray-600">Communicate in any language</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-8 h-8 text-pink-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Media Sharing</h4>
                <p className="text-sm text-gray-600">Photos, voice, and files</p>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => setShowMessaging(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Launch Interactive Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Messaging Dashboard Modal */}
      {showMessaging && (
        <MessagingDashboard
          currentUser={currentUser}
          onClose={() => setShowMessaging(false)}
          onMinimize={() => setShowMessaging(false)}
        />
      )}
    </>
  );
};

export default MessagingDemo;