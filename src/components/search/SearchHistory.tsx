import React from 'react';
import { motion } from 'framer-motion';
import { 
  History, Trash2, Calendar, Search, 
  Filter, ArrowRight, AlertCircle
} from 'lucide-react';
import Button from '../ui/Button';
import { SearchHistoryItem, SearchFilters } from '../../hooks/useAdvancedSearch';

interface SearchHistoryProps {
  searchHistory: SearchHistoryItem[];
  onLoad: (filters: SearchFilters) => void;
  onClear: () => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({
  searchHistory,
  onLoad,
  onClear
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFilters = (filters: SearchFilters) => {
    const parts = [];

    if (filters.ageRange) {
      parts.push(`Age: ${filters.ageRange[0]}-${filters.ageRange[1]}`);
    }

    if (filters.distance) {
      parts.push(`Distance: ${filters.distance} km`);
    }

    if (filters.culturalBackgrounds && filters.culturalBackgrounds.length > 0) {
      parts.push(`Culture: ${filters.culturalBackgrounds.join(', ')}`);
    }

    if (filters.interests && filters.interests.length > 0) {
      parts.push(`Interests: ${filters.interests.length} selected`);
    }

    if (filters.languages && filters.languages.length > 0) {
      parts.push(`Languages: ${filters.languages.join(', ')}`);
    }

    if (filters.verifiedOnly) {
      parts.push('Verified only');
    }

    return parts.join(' • ');
  };

  if (searchHistory.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <History className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Search History</h3>
        <p className="text-gray-600 mb-4">
          Your search history will appear here after you perform searches.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <History className="w-6 h-6" />
              <h2 className="text-xl font-bold">Your Search History</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const confirmed = window.confirm('Are you sure you want to clear your entire search history?');
                if (confirmed) {
                  onClear();
                }
              }}
              className="bg-white bg-opacity-20 text-white border-white border-opacity-30 hover:bg-opacity-30"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear History
            </Button>
          </div>
          <p className="mt-2 text-blue-100">
            View and reuse your recent searches
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {searchHistory.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-xs text-gray-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(item.executedAt)}
                    </span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {item.resultsCount} {item.resultsCount === 1 ? 'result' : 'results'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    {formatFilters(item.filters)}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {item.filters.culturalBackgrounds?.map((culture) => (
                      <span key={culture} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {culture}
                      </span>
                    ))}
                    
                    {item.filters.interests?.slice(0, 3).map((interest) => (
                      <span key={interest} className="bg-pink-50 text-pink-700 text-xs px-2 py-1 rounded-full">
                        {interest}
                      </span>
                    ))}
                    
                    {item.filters.interests && item.filters.interests.length > 3 && (
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        +{item.filters.interests.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLoad(item.filters)}
                >
                  <Search className="w-4 h-4 mr-1" />
                  Search Again
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchHistory;