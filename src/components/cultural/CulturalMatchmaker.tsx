import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, Search, Filter, Heart, Star, Globe,
  Users, Calendar, Utensils, Activity, Building
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import OptimizedImage from '../ui/OptimizedImage';

interface CulturalPreference {
  id: string;
  category: string;
  preference: string;
  importance: 'low' | 'medium' | 'high';
}

interface CulturalMatch {
  id: string;
  name: string;
  age: number;
  location: string;
  avatar: string;
  compatibility: number;
  culturalHighlights: string[];
  sharedInterests: string[];
  culturalDifferences: string[];
  verified: boolean;
}

const CulturalMatchmaker: React.FC = () => {
  const [preferences, setPreferences] = useState<CulturalPreference[]>([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [ageRange, setAgeRange] = useState({ min: 25, max: 35 });
  const [culturalOpenness, setCulturalOpenness] = useState(5);

  const culturalCategories = [
    {
      id: 'food',
      name: 'Food & Cuisine',
      icon: Utensils,
      options: [
        'Loves trying new cuisines',
        'Enjoys cooking traditional dishes',
        'Interested in fusion cooking',
        'Prefers familiar foods',
        'Vegetarian/Vegan friendly'
      ]
    },
    {
      id: 'traditions',
      name: 'Traditions & Values',
      icon: Heart,
      options: [
        'Values family traditions',
        'Open to new customs',
        'Religious/Spiritual',
        'Celebrates cultural holidays',
        'Respects elder wisdom'
      ]
    },
    {
      id: 'activities',
      name: 'Activities & Lifestyle',
      icon: Activity,
      options: [
        'Enjoys cultural festivals',
        'Loves outdoor activities',
        'Prefers quiet gatherings',
        'Active in community',
        'Enjoys arts and music'
      ]
    },
    {
      id: 'communication',
      name: 'Communication Style',
      icon: Users,
      options: [
        'Direct communication',
        'Indirect/Subtle approach',
        'Multilingual',
        'Patient with language barriers',
        'Enjoys deep conversations'
      ]
    }
  ];

  const mockMatches: CulturalMatch[] = [
    {
      id: '1',
      name: 'Isabella Cruz',
      age: 28,
      location: 'Davao City, Philippines',
      avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg',
      compatibility: 94,
      culturalHighlights: [
        'Loves cooking traditional Filipino dishes',
        'Celebrates both Filipino and international holidays',
        'Fluent in English, Filipino, and Bisaya'
      ],
      sharedInterests: [
        'Outdoor adventures',
        'Cultural festivals',
        'Family values',
        'Trying new cuisines'
      ],
      culturalDifferences: [
        'More family-oriented gatherings',
        'Different holiday traditions',
        'Indirect communication style'
      ],
      verified: true
    },
    {
      id: '2',
      name: 'Carmen Santos',
      age: 26,
      location: 'Iloilo City, Philippines',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
      compatibility: 89,
      culturalHighlights: [
        'Active in local community events',
        'Teaches traditional Filipino dances',
        'Passionate about cultural preservation'
      ],
      sharedInterests: [
        'Arts and music',
        'Community involvement',
        'Cultural education',
        'Travel and exploration'
      ],
      culturalDifferences: [
        'Strong emphasis on respect for elders',
        'Different dating customs',
        'More collective decision-making'
      ],
      verified: true
    },
    {
      id: '3',
      name: 'Sophia Reyes',
      age: 30,
      location: 'Baguio City, Philippines',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      compatibility: 87,
      culturalHighlights: [
        'Grew up in multicultural environment',
        'Experienced in cross-cultural relationships',
        'Advocates for cultural understanding'
      ],
      sharedInterests: [
        'Mountain hiking',
        'Coffee culture',
        'Environmental awareness',
        'Photography'
      ],
      culturalDifferences: [
        'Different work-life balance priorities',
        'Unique regional traditions',
        'Different social gathering styles'
      ],
      verified: false
    }
  ];

  const handlePreferenceChange = (categoryId: string, option: string, importance: 'low' | 'medium' | 'high') => {
    const newPreference: CulturalPreference = {
      id: `${categoryId}_${option}`,
      category: categoryId,
      preference: option,
      importance
    };

    setPreferences(prev => {
      const filtered = prev.filter(p => p.id !== newPreference.id);
      return [...filtered, newPreference];
    });
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex p-3 bg-purple-100 rounded-full mb-6">
          <Globe className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Cultural Compatibility Matchmaker
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Find your perfect cross-cultural match based on shared values, 
          interests, and cultural compatibility preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preferences Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Your Cultural Preferences
            </h2>

            {/* Location Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Location
              </label>
              <Input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="City, Province, or Region"
                icon={<MapPin className="w-4 h-4 text-gray-400" />}
              />
            </div>

            {/* Age Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Range: {ageRange.min} - {ageRange.max}
              </label>
              <div className="flex space-x-4">
                <input
                  type="range"
                  min="18"
                  max="50"
                  value={ageRange.min}
                  onChange={(e) => setAgeRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="18"
                  max="50"
                  value={ageRange.max}
                  onChange={(e) => setAgeRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Cultural Openness */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cultural Openness: {culturalOpenness}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={culturalOpenness}
                onChange={(e) => setCulturalOpenness(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Traditional</span>
                <span>Very Open</span>
              </div>
            </div>

            {/* Cultural Categories */}
            <div className="space-y-6">
              {culturalCategories.map((category) => (
                <div key={category.id}>
                  <div className="flex items-center mb-3">
                    <category.icon className="w-5 h-5 text-purple-600 mr-2" />
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                  </div>
                  <div className="space-y-2">
                    {category.options.map((option) => (
                      <div key={option} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{option}</span>
                        <select
                          onChange={(e) => {
                            const importance = e.target.value as 'low' | 'medium' | 'high';
                            if (importance) {
                              handlePreferenceChange(category.id, option, importance);
                            }
                          }}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="">Not Important</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full mt-6">
              <Search className="w-4 h-4 mr-2" />
              Update Matches
            </Button>
          </div>
        </div>

        {/* Matches Results */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Your Cultural Matches ({mockMatches.length})
            </h2>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>Highest Compatibility</option>
                <option>Newest Members</option>
                <option>Most Active</option>
                <option>Recently Online</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {mockMatches.map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  {/* Profile Image */}
                  <div className="relative">
                    <OptimizedImage
                      src={match.avatar}
                      alt={match.name}
                      className="w-20 h-20 rounded-full"
                      width={80}
                      height={80}
                    />
                    {match.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Star className="w-3 h-3 text-white fill-current" />
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{match.name}, {match.age}</h3>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{match.location}</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCompatibilityColor(match.compatibility)}`}>
                        {match.compatibility}% Match
                      </div>
                    </div>

                    {/* Cultural Highlights */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Cultural Highlights</h4>
                      <div className="space-y-1">
                        {match.culturalHighlights.map((highlight, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <Star className="w-3 h-3 text-yellow-500 mr-2 flex-shrink-0" />
                            {highlight}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shared Interests & Differences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">Shared Interests</h4>
                        <div className="space-y-1">
                          {match.sharedInterests.map((interest, index) => (
                            <div key={index} className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                              {interest}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-700 mb-2">Cultural Differences</h4>
                        <div className="space-y-1">
                          {match.culturalDifferences.map((difference, index) => (
                            <div key={index} className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {difference}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Button variant="primary" size="sm">
                        <Heart className="w-4 h-4 mr-2" />
                        Show Interest
                      </Button>
                      <Button variant="outline" size="sm">
                        View Full Profile
                      </Button>
                      <Button variant="ghost" size="sm">
                        Learn About Culture
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline">
              Load More Matches
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CulturalMatchmaker;