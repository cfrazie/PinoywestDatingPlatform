import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Star, MapPin, Globe, Languages, Zap,
  MessageCircle, Calendar, Clock, AlertCircle, Shield
} from 'lucide-react';
import Button from '../ui/Button';
import OptimizedImage from '../ui/OptimizedImage';
import CompatibilityScore from '../compatibility/CompatibilityScore';
import ProfileVerificationBadge from '../verification/ProfileVerificationBadge';
import VerificationRequestButton from '../verification/VerificationRequestButton';
import { SearchResult } from '../../hooks/useAdvancedSearch';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  totalResults: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isLoading,
  error,
  totalResults,
  currentPage,
  onPageChange
}) => {
  const resultsPerPage = 20;
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  const formatLastActive = (lastActive: string) => {
    const date = new Date(lastActive);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Searching for your perfect match...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Search Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => onPageChange(1)}>Try Again</Button>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Found</h3>
        <p className="text-gray-600 mb-4">Try adjusting your search filters to see more results.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {totalResults} {totalResults === 1 ? 'Match' : 'Matches'} Found
            </h2>
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * resultsPerPage + 1}-{Math.min(currentPage * resultsPerPage, totalResults)} of {totalResults}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                // Update sort and trigger search
              }}
            >
              <option value="relevance">Compatibility</option>
              <option value="newest">Newest Members</option>
              <option value="distance">Distance</option>
              <option value="age_asc">Age (Youngest First)</option>
              <option value="age_desc">Age (Oldest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="space-y-6">
        {results.map((result) => (
          <motion.div
            key={result.userId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="flex flex-col md:flex-row">
              {/* Profile Image */}
              <div className="md:w-1/3 relative">
                <OptimizedImage
                  src={result.photoUrl}
                  alt={result.username}
                  className="w-full h-64 md:h-full object-cover"
                  width={300}
                  height={400}
                />
                <div className="absolute top-4 left-4 flex space-x-2">
                  {result.verified && (
                    <ProfileVerificationBadge
                      userId={result.userId}
                      size="sm"
                      showTooltip={false}
                    />
                  )}
                  {result.onlineStatus && (
                    <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                      Online Now
                    </div>
                  )}
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCompatibilityColor(result.compatibilityScore)}`}>
                    <CompatibilityScore score={result.compatibilityScore} size="sm" />
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="md:w-2/3 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{result.username}, {result.age}</h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{result.location}</span>
                      <span className="mx-2">•</span>
                      <span>{result.distance} km away</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>Active {formatLastActive(result.lastActive)}</span>
                    </div>
                  </div>
                </div>

                {/* Cultural Background */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Globe className="w-4 h-4 text-blue-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Cultural Background</h4>
                  </div>
                  <p className="text-gray-700">{result.culturalBackground}</p>
                </div>

                {/* Languages */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Languages className="w-4 h-4 text-green-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Languages</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.languages.map((language) => (
                      <span key={language} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded">
                        {language}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <Heart className="w-4 h-4 text-red-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Interests</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.interests.map((interest) => (
                      <span key={interest} className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button variant="primary">
                    <Zap className="w-4 h-4 mr-2" />
                    Compatibility
                  </Button>
                  <VerificationRequestButton
                    userId="current_user"
                    targetUserId={result.userId}
                    targetUserName={result.username}
                    isVerified={result.verified}
                  />
                  <Button variant="ghost">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              size="sm"
            >
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'primary' : 'outline'}
                  onClick={() => onPageChange(pageNum)}
                  size="sm"
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;