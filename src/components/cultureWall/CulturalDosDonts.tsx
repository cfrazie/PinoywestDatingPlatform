import React, { useState, useEffect } from 'react';
import { culturalService } from '../../services/culturalService';
import type { CulturalGuideline } from '../../types/cultureWall';
import { CheckCircle, XCircle, AlertTriangle, Info, ThumbsUp, ThumbsDown, Filter, Search } from 'lucide-react';

interface CulturalDosDontsProps {
  country: string;
  partnerCountry?: string;
}

export const CulturalDosDonts: React.FC<CulturalDosDontsProps> = ({ country, partnerCountry }) => {
  const [guidelines, setGuidelines] = useState<CulturalGuideline[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadGuidelines();
  }, [country, partnerCountry, selectedCategory, selectedType]);

  const loadGuidelines = async () => {
    setLoading(true);
    try {
      let data: CulturalGuideline[];
      
      if (partnerCountry) {
        data = await culturalService.getGuidelinesForCountryPair(country, partnerCountry);
      } else {
        data = await culturalService.getGuidelines({
          country,
          category: selectedCategory || undefined,
          guidelineType: selectedType || undefined,
        });
      }

      setGuidelines(data);
    } catch (error) {
      console.error('Error loading guidelines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadGuidelines();
      return;
    }

    setLoading(true);
    try {
      const results = await culturalService.searchGuidelines(searchQuery, country);
      setGuidelines(results);
    } catch (error) {
      console.error('Error searching guidelines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (guidelineId: string, isHelpful: boolean) => {
    try {
      await culturalService.submitGuidelineFeedback(guidelineId, isHelpful);
      // Update local state
      setGuidelines(prev =>
        prev.map(g =>
          g.id === guidelineId
            ? {
                ...g,
                helpful_count: isHelpful ? g.helpful_count + 1 : g.helpful_count,
                not_helpful_count: !isHelpful ? g.not_helpful_count + 1 : g.not_helpful_count,
              }
            : g
        )
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'do':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'dont':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'tip':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'do':
        return 'border-green-200 bg-green-50';
      case 'dont':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-orange-200 bg-orange-50';
      case 'tip':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getImportanceBadge = (level?: string) => {
    if (!level) return null;
    
    const colors = {
      critical: 'bg-red-100 text-red-800',
      important: 'bg-orange-100 text-orange-800',
      good_to_know: 'bg-blue-100 text-blue-800',
      optional: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level as keyof typeof colors]}`}>
        {level.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  const categories = [
    'greetings',
    'dining',
    'dating',
    'family',
    'religion',
    'communication',
    'business',
    'public_behavior',
    'gifts',
    'taboos',
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Cultural Do's & Don'ts: {country}
        </h1>
        {partnerCountry && (
          <p className="text-gray-600">Comparing with {partnerCountry}</p>
        )}

        {/* Search and Filters */}
        <div className="mt-6 space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search guidelines..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
            >
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Filter className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="do">Do's</option>
                <option value="dont">Don'ts</option>
                <option value="tip">Tips</option>
                <option value="warning">Warnings</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">Loading guidelines...</p>
        </div>
      ) : guidelines.length > 0 ? (
        <div className="space-y-4">
          {guidelines.map(guideline => (
            <div
              key={guideline.id}
              className={`rounded-lg border-2 p-5 ${getColorForType(guideline.guideline_type)}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getIconForType(guideline.guideline_type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{guideline.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {guideline.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                    {getImportanceBadge(guideline.importance_level)}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{guideline.description}</p>
                  
                  {/* Source */}
                  {guideline.source_url && (
                    <a
                      href={guideline.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-pink-600 hover:text-pink-700 mt-2 inline-block"
                    >
                      Learn more →
                    </a>
                  )}

                  {/* Feedback */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleFeedback(guideline.id, true)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Helpful ({guideline.helpful_count})</span>
                    </button>
                    <button
                      onClick={() => handleFeedback(guideline.id, false)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>Not helpful ({guideline.not_helpful_count})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-600 text-lg">No guidelines found for the selected filters.</p>
        </div>
      )}
    </div>
  );
};
