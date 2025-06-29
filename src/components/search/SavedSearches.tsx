import React from 'react';
import { motion } from 'framer-motion';
import { 
  Save, Trash2, Calendar, Search, 
  Filter, ArrowRight, AlertCircle
} from 'lucide-react';
import Button from '../ui/Button';
import { SavedSearch, SearchFilters } from '../../hooks/useAdvancedSearch';

interface SavedSearchesProps {
  savedSearches: SavedSearch[];
  onLoad: (filters: SearchFilters) => void;
  onDelete: (id: string) => void;
}

const SavedSearches: React.FC<SavedSearchesProps> = ({
  savedSearches,
  onLoad,
  onDelete
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  if (savedSearches.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Save className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Searches</h3>
        <p className="text-gray-600 mb-4">
          Save your search filters to quickly access them later.
          Try creating a search and clicking the "Save" button.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center space-x-3">
            <Save className="w-6 h-6" />
            <h2 className="text-xl font-bold">Your Saved Searches</h2>
          </div>
          <p className="mt-2 text-blue-100">
            Quickly access your favorite search filters
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {savedSearches.map((search) => (
            <motion.div
              key={search.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{search.name}</h3>
                    <span className="ml-3 text-xs text-gray-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Saved on {formatDate(search.createdAt)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    {formatFilters(search.filters)}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {search.filters.culturalBackgrounds?.map((culture) => (
                      <span key={culture} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {culture}
                      </span>
                    ))}
                    
                    {search.filters.interests?.slice(0, 3).map((interest) => (
                      <span key={interest} className="bg-pink-50 text-pink-700 text-xs px-2 py-1 rounded-full">
                        {interest}
                      </span>
                    ))}
                    
                    {search.filters.interests && search.filters.interests.length > 3 && (
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        +{search.filters.interests.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLoad(search.filters)}
                  >
                    <Search className="w-4 h-4 mr-1" />
                    Load
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const confirmed = window.confirm('Are you sure you want to delete this saved search?');
                      if (confirmed) {
                        onDelete(search.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedSearches;