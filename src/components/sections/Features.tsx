import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Shield, Globe, MessageCircle, Video, Star, Zap,
  Users, Award, Lock, Smartphone, HeadphonesIcon
} from 'lucide-react';
import OptimizedImage from '../ui/OptimizedImage';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { curatedImages, imageDimensions } from '../../utils/imageOptimization';

const Features: React.FC = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver();

  const features = [
    {
      icon: Heart,
      title: 'AI-Powered Compatibility',
      description: 'Our advanced AI analyzes 50+ compatibility factors to find your most meaningful connections.',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      icon: Shield, 
      title: 'Advanced Profile Verification',
      description: 'Our comprehensive verification system uses reverse image search and cross-platform analysis to verify authenticity.',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: Globe,
      title: 'Cultural Bridge',
      description: 'Learn about different cultures, traditions, and languages through our integrated cultural exchange features.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Video,
      title: 'Live Video Chat',
      description: 'Connect face-to-face with high-quality video calls and virtual dates from anywhere in the world.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: MessageCircle,
      title: 'Real-time Translation',
      description: 'Break language barriers with instant translation in over 50 languages for seamless communication.',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: Star,
      title: 'Success Stories',
      description: 'Join thousands of couples who found love through our platform and share your own success story.',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section id="features" ref={elementRef} className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose PinoyWest?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We've built the most comprehensive platform for Filipino-Western connections, 
            combining cutting-edge technology with cultural sensitivity.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isIntersecting ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
            >
              <div className={`inline-flex p-3 rounded-lg ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
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

        {/* Additional features showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 bg-gradient-to-r from-blue-50 to-pink-50 rounded-2xl p-8 md:p-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Advanced Features for Modern Dating
              </h3>
              <div className="space-y-4">
                {[
                  { icon: Smartphone, text: 'Mobile-first design for dating on the go' },
                  { icon: Lock, text: 'End-to-end encryption for all private data' },
                  { icon: Zap, text: 'AI-powered matching with 95% accuracy' },
                  { icon: HeadphonesIcon, text: '24/7 customer support in multiple languages' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                      <item.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <OptimizedImage
                src={curatedImages.features.main}
                alt="Modern dating features"
                className="w-full h-80 rounded-xl shadow-lg"
                width={imageDimensions.feature.width}
                height={imageDimensions.feature.height}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;