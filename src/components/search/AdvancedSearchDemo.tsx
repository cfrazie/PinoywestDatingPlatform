import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Sliders, Heart, Star, MapPin, 
  Calendar, Ruler, BookOpen, Users, Smile, Globe, Zap,
  Coffee, Wine, Cigarette, Baby, Languages, Activity,
  Save, History, RefreshCw, X, Check, ChevronDown, ChevronUp
} from 'lucide-react';
import Button from '../ui/Button';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import AdvancedSearch from './AdvancedSearch';

const AdvancedSearchDemo: React.FC = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver();
  const [showFullSearch, setShowFullSearch] = useState(false);

  const features = [
    {
      icon: Filter,
      title: 'Advanced Filtering',
      description: 'Filter by age, height, education, religion, and more to find your ideal match',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Zap,
      title: 'AI Compatibility Scoring',
      description: 'Our AI analyzes 50+ factors to calculate your true compatibility with potential matches',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Languages,
      title: 'Language Preferences',
      description: 'Connect with people who speak your preferred languages for better communication',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Heart,
      title: 'Interest-Based Matching',
      description: 'Find people who share your hobbies, passions, and lifestyle preferences',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: Save,
      title: 'Save Your Searches',
      description: 'Save your favorite search criteria for quick access in the future',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: Star,
      title: 'Personalized Insights',
      description: 'Get AI-powered insights about your compatibility strengths and growth opportunities',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
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
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Advanced Search & Filtering
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Find your perfect cross-cultural match with our powerful search tools.
              Filter by cultural background, interests, values, and more.
            </p>
            
            <Button
              size="lg"
              onClick={() => setShowFullSearch(true)}
              className="group"
            >
              <Filter className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Try Advanced Search
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

          {/* Search Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-16"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Find Your Perfect Match
              </h3>
              <p className="text-gray-600 mb-6">
                Try our powerful search tools to find exactly who you're looking for
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              {/* Basic Search Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    I'm looking for
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Filipino Women</option>
                    <option>Filipino Men</option>
                    <option>American Women</option>
                    <option>American Men</option>
                    <option>Anyone</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age Range
                  </label>
                  <div className="flex items-center space-x-2">
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {Array.from({ length: 63 }, (_, i) => i + 18).map(age => (
                        <option key={age} value={age}>{age}</option>
                      ))}
                    </select>
                    <span>to</span>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {Array.from({ length: 63 }, (_, i) => i + 18).map(age => (
                        <option key={age} value={age} selected={age === 35}>{age}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="City, Region, or Country"
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowFullSearch(true)}
                  className="flex items-center"
                >
                  <Sliders className="w-4 h-4 mr-2" />
                  Advanced Filters
                </Button>
                
                <Button
                  onClick={() => setShowFullSearch(true)}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Now
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">
                Find Your Perfect Match Today
              </h3>
              <p className="text-blue-100 text-lg">
                Join thousands of successful cross-cultural relationships
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-white mb-2">50K+</div>
                <div className="text-blue-100">Active Members</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">85%</div>
                <div className="text-blue-100">Match Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">12K+</div>
                <div className="text-blue-100">Success Stories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">150+</div>
                <div className="text-blue-100">Countries Connected</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Full Search Modal */}
      {showFullSearch && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-50 rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Advanced Search</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullSearch(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              <AdvancedSearch userId="demo_user" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default AdvancedSearchDemo;