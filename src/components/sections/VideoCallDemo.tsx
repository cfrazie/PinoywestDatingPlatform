import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, Phone, Users, Shield, Globe, Zap, 
  Heart, Calendar, MessageCircle, Gift
} from 'lucide-react';
import Button from '../ui/Button';
import VideoCallInterface from '../video/VideoCallInterface';
import VideoCallButton from '../video/VideoCallButton';
import CallHistory from '../video/CallHistory';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { ChatUser } from '../../types/messaging';

const VideoCallDemo: React.FC = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver();
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [activeDemo, setActiveDemo] = useState<'call' | 'history' | null>(null);

  // Mock users
  const currentUser: ChatUser = {
    id: 'current_user',
    name: 'You',
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
    isOnline: true,
    lastSeen: 'Online'
  };

  const otherUser: ChatUser = {
    id: 'user_2',
    name: 'Maria Santos',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    isOnline: true,
    lastSeen: 'Online',
    location: 'Manila, Philippines',
    age: 28,
    verified: true
  };

  const features = [
    {
      icon: Video,
      title: 'HD Video Calling',
      description: 'Crystal clear video calls with adaptive quality based on connection',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Globe,
      title: 'Global Connectivity',
      description: 'Connect with people worldwide with optimized routing for best quality',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'End-to-end encrypted calls with advanced security protocols',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Users,
      title: 'Group Video Calls',
      description: 'Host virtual dates with friends or family members',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Calendar,
      title: 'Scheduled Calls',
      description: 'Plan video dates across different time zones with smart scheduling',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      icon: Zap,
      title: 'Smart Features',
      description: 'Background effects, real-time translation, and virtual gifts',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  const handleStartVideoCall = () => {
    setShowVideoCall(true);
    setActiveDemo('call');
  };

  const handleShowCallHistory = () => {
    setShowCallHistory(true);
    setActiveDemo('history');
  };

  const handleCloseDemo = () => {
    setShowVideoCall(false);
    setShowCallHistory(false);
    setActiveDemo(null);
  };

  return (
    <>
      <section ref={elementRef} className="py-20 bg-white">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex p-3 bg-blue-100 rounded-full mb-6">
              <Video className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Face-to-Face Connections
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Experience the next generation of video calling designed specifically for 
              cross-cultural dating. See, hear, and feel the connection like never before.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                size="lg"
                onClick={handleStartVideoCall}
                className="group"
              >
                <Video className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Try Video Call Demo
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleShowCallHistory}
                className="group"
              >
                <Phone className="w-5 h-5 mr-2" />
                View Call History
              </Button>
            </div>
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

          {/* Interactive Demo Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  Experience Video Dating
                </h3>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Video className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">HD video quality with smart optimization</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Globe className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Real-time language translation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-pink-600" />
                    </div>
                    <span className="text-gray-700">Virtual gifts and reactions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-gray-700">Secure and private conversations</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <VideoCallButton
                    currentUser={currentUser}
                    otherUser={otherUser}
                    variant="video"
                    size="lg"
                  />
                  
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={handleShowCallHistory}
                      className="flex items-center space-x-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call History</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat First</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-xl shadow-2xl p-6">
                  <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Video className="w-12 h-12 mx-auto mb-2 opacity-80" />
                        <p className="text-sm opacity-90">Video Call Preview</p>
                      </div>
                    </div>
                    
                    {/* Mock video call UI elements */}
                    <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      HD Quality
                    </div>
                    <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      00:45
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <Phone className="w-4 h-4 text-white" />
                      </div>
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <Phone className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="w-20 h-3 bg-gray-200 rounded mb-1"></div>
                        <div className="w-16 h-2 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-20 bg-gray-900 rounded-2xl p-8 md:p-12 text-white"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Trusted by Thousands
              </h3>
              <p className="text-gray-300 text-lg">
                Join the growing community of successful cross-cultural relationships
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2 text-blue-400">25K+</div>
                <div className="text-gray-300">Video Calls Daily</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2 text-green-400">98%</div>
                <div className="text-gray-300">Call Quality Rating</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2 text-pink-400">150+</div>
                <div className="text-gray-300">Countries Connected</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-2 text-yellow-400">45min</div>
                <div className="text-gray-300">Average Call Duration</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Call Demo Modal */}
      {showVideoCall && (
        <VideoCallInterface
          callId="demo_call"
          currentUser={currentUser}
          otherUser={otherUser}
          onEndCall={handleCloseDemo}
        />
      )}

      {/* Call History Modal */}
      {showCallHistory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Call History Demo</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseDemo}
              >
                ×
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <CallHistory
                userId={currentUser.id}
                onStartCall={(userId, callType) => {
                  console.log('Starting call with:', userId, callType);
                  handleCloseDemo();
                  setShowVideoCall(true);
                }}
                onSendMessage={(userId) => {
                  console.log('Sending message to:', userId);
                  handleCloseDemo();
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default VideoCallDemo;