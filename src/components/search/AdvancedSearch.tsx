import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Sliders, Heart, Star, MapPin, Zap,
  Calendar, Ruler, BookOpen, Users, Smile, Globe,
  Coffee, Wine, Cigarette, Baby, Languages, Activity,
  Save, History, RefreshCw, X, Check, ChevronDown, ChevronUp
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAdvancedSearch, SearchFilters } from '../../hooks/useAdvancedSearch';
import SearchResults from './SearchResults';
import SavedSearches from './SavedSearches';
import SearchHistory from './SearchHistory';

interface AdvancedSearchProps {
  userId?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'history'>('search');
  const [showFilters, setShowFilters] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    appearance: false,
    background: false,
    lifestyle: false,
    interests: false
  });

  const {
    searchResults,
    savedSearches,
    searchHistory,
    isLoading,
    error,
    totalResults,
    currentPage,
    filters,
    executeSearch,
    saveSearch,
    deleteSavedSearch,
    clearSearchHistory,
    updateFilters,
    resetFilters
  } = useAdvancedSearch(userId);

  // Execute search on mount with default filters
  useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSearch = () => {
    executeSearch(filters, 1);
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) return;
    
    try {
      await saveSearch(searchName, filters);
      setSearchName('');
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  };

  const handleLoadSavedSearch = (filters: SearchFilters) => {
    updateFilters(filters);
    executeSearch(filters, 1);
    setActiveTab('search');
  };

  const handleResetFilters = () => {
    resetFilters();
    executeSearch(undefined, 1);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Match</h1>
        <p className="text-gray-600">
          Use our advanced search to find exactly who you're looking for
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white p-1 rounded-lg shadow-lg">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'search'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'saved'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Saved Searches</span>
              {savedSearches.length > 0 && (
                <span className="ml-1 bg-gray-200 text-gray-800 text-xs rounded-full px-2 py-0.5">
                  {savedSearches.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Filters Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5" />
                    <h2 className="font-bold">Search Filters</h2>
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                  >
                    {showFilters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Filters Content */}
              {showFilters && (
                <div className="p-4 space-y-6">
                  {/* Basic Filters Section */}
                  <div>
                    <button
                      onClick={() => toggleSection('basic')}
                      className="flex items-center justify-between w-full mb-2"
                    >
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <h3 className="font-medium text-gray-900">Basic Filters</h3>
                      </div>
                      {expandedSections.basic ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </button>

                    {expandedSections.basic && (
                      <div className="space-y-4 mt-3">
                        {/* Age Range */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}
                          </label>
                          <div className="flex space-x-4">
                            <input
                              type="range"
                              min="18"
                              max="80"
                              value={filters.ageRange[0]}
                              onChange={(e) => updateFilters({ ageRange: [parseInt(e.target.value), filters.ageRange[1]] })}
                              className="flex-1"
                            />
                            <input
                              type="range"
                              min="18"
                              max="80"
                              value={filters.ageRange[1]}
                              onChange={(e) => updateFilters({ ageRange: [filters.ageRange[0], parseInt(e.target.value)] })}
                              className="flex-1"
                            />
                          </div>
                        </div>

                        {/* Distance */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Distance: {filters.distance} km
                          </label>
                          <input
                            type="range"
                            min="5"
                            max="5000"
                            step="5"
                            value={filters.distance}
                            onChange={(e) => updateFilters({ distance: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        {/* Location */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                          </label>
                          <Input
                            type="text"
                            placeholder="City, Region, or Country"
                            icon={<MapPin className="w-4 h-4 text-gray-400" />}
                            value={filters.locationPreferences?.city || ''}
                            onChange={(e) => updateFilters({ 
                              locationPreferences: { 
                                ...filters.locationPreferences,
                                city: e.target.value 
                              } 
                            })}
                          />
                        </div>

                        {/* Online Now */}
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">
                            Online Now
                          </label>
                          <div className="relative inline-block w-10 mr-2 align-middle select-none">
                            <input
                              type="checkbox"
                              id="toggle-online"
                              checked={filters.onlineNow || false}
                              onChange={(e) => updateFilters({ onlineNow: e.target.checked })}
                              className="sr-only"
                            />
                            <label
                              htmlFor="toggle-online"
                              className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                                filters.onlineNow ? 'bg-blue-600' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                                  filters.onlineNow ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              ></span>
                            </label>
                          </div>
                        </div>

                        {/* Has Photo */}
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">
                            Has Photo
                          </label>
                          <div className="relative inline-block w-10 mr-2 align-middle select-none">
                            <input
                              type="checkbox"
                              id="toggle-photo"
                              checked={filters.hasPhoto || false}
                              onChange={(e) => updateFilters({ hasPhoto: e.target.checked })}
                              className="sr-only"
                            />
                            <label
                              htmlFor="toggle-photo"
                              className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                                filters.hasPhoto ? 'bg-blue-600' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                                  filters.hasPhoto ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              ></span>
                            </label>
                          </div>
                        </div>

                        {/* Verified Only */}
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">
                            Verified Only
                          </label>
                          <div className="relative inline-block w-10 mr-2 align-middle select-none">
                            <input
                              type="checkbox"
                              id="toggle-verified"
                              checked={filters.verifiedOnly || false}
                              onChange={(e) => updateFilters({ verifiedOnly: e.target.checked })}
                              className="sr-only"
                            />
                            <label
                              htmlFor="toggle-verified"
                              className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                                filters.verifiedOnly ? 'bg-blue-600' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                                  filters.verifiedOnly ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              ></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Appearance Section */}
                  <div>
                    <button
                      onClick={() => toggleSection('appearance')}
                      className="flex items-center justify-between w-full mb-2"
                    >
                      <div className="flex items-center space-x-2">
                        <Ruler className="w-4 h-4 text-purple-600" />
                        <h3 className="font-medium text-gray-900">Appearance</h3>
                      </div>
                      {expandedSections.appearance ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </button>

                    {expandedSections.appearance && (
                      <div className="space-y-4 mt-3">
                        {/* Height Range */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Height Range: {filters.heightRange?.[0] || 140} - {filters.heightRange?.[1] || 200} cm
                          </label>
                          <div className="flex space-x-4">
                            <input
                              type="range"
                              min="140"
                              max="200"
                              value={filters.heightRange?.[0] || 140}
                              onChange={(e) => updateFilters({ 
                                heightRange: [parseInt(e.target.value), filters.heightRange?.[1] || 200] 
                              })}
                              className="flex-1"
                            />
                            <input
                              type="range"
                              min="140"
                              max="200"
                              value={filters.heightRange?.[1] || 200}
                              onChange={(e) => updateFilters({ 
                                heightRange: [filters.heightRange?.[0] || 140, parseInt(e.target.value)] 
                              })}
                              className="flex-1"
                            />
                          </div>
                        </div>

                        {/* Body Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Body Type
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {['slim', 'athletic', 'average', 'curvy', 'plus-size'].map((type) => (
                              <label key={type} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={filters.bodyTypes?.includes(type) || false}
                                  onChange={(e) => {
                                    const current = filters.bodyTypes || [];
                                    const updated = e.target.checked
                                      ? [...current, type]
                                      : current.filter(t => t !== type);
                                    updateFilters({ bodyTypes: updated });
                                  }}
                                  className="rounded text-blue-600"
                                />
                                <span className="text-sm text-gray-700 capitalize">{type}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Background Section */}
                  <div>
                    <button
                      onClick={() => toggleSection('background')}
                      className="flex items-center justify-between w-full mb-2"
                    >
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-green-600" />
                        <h3 className="font-medium text-gray-900">Background</h3>
                      </div>
                      {expandedSections.background ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </button>

                    {expandedSections.background && (
                      <div className="space-y-4 mt-3">
                        {/* Cultural Background */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cultural Background
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {['American', 'Filipino', 'European', 'Asian', 'Hispanic', 'African'].map((culture) => (
                              <label key={culture} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={filters.culturalBackgrounds?.includes(culture) || false}
                                  onChange={(e) => {
                                    const current = filters.culturalBackgrounds || [];
                                    const updated = e.target.checked
                                      ? [...current, culture]
                                      : current.filter(c => c !== culture);
                                    updateFilters({ culturalBackgrounds: updated });
                                  }}
                                  className="rounded text-blue-600"
                                />
                                <span className="text-sm text-gray-700">{culture}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Languages */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Languages
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {['English', 'Filipino', 'Spanish', 'Chinese', 'Japanese', 'Korean'].map((language) => (
                              <label key={language} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={filters.languages?.includes(language) || false}
                                  onChange={(e) => {
                                    const current = filters.languages || [];
                                    const updated = e.target.checked
                                      ? [...current, language]
                                      : current.filter(l => l !== language);
                                    updateFilters({ languages: updated });
                                  }}
                                  className="rounded text-blue-600"
                                />
                                <span className="text-sm text-gray-700">{language}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Education */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Education Level
                          </label>
                          <div className="grid grid-cols-1 gap-2">
                            {['high_school', 'some_college', 'associates', 'bachelors', 'masters', 'doctorate'].map((edu) => (
                              <label key={edu} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={filters.educationLevels?.includes(edu) || false}
                                  onChange={(e) => {
                                    const current = filters.educationLevels || [];
                                    const updated = e.target.checked
                                      ? [...current, edu]
                                      : current.filter(e => e !== edu);
                                    updateFilters({ educationLevels: updated });
                                  }}
                                  className="rounded text-blue-600"
                                />
                                <span className="text-sm text-gray-700 capitalize">
                                  {edu.replace('_', ' ')}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Religion */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Religion
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {['Christian', 'Catholic', 'Buddhist', 'Hindu', 'Muslim', 'Jewish', 'Spiritual', 'Agnostic', 'Atheist'].map((religion) => (
                              <label key={religion} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={filters.religions?.includes(religion) || false}
                                  onChange={(e) => {
                                    const current = filters.religions || [];
                                    const updated = e.target.checked
                                      ? [...current, religion]
                                      : current.filter(r => r !== religion);
                                    updateFilters({ religions: updated });
                                  }}
                                  className="rounded text-blue-600"
                                />
                                <span className="text-sm text-gray-700">{religion}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lifestyle Section */}
                  <div>
                    <button
                      onClick={() => toggleSection('lifestyle')}
                      className="flex items-center justify-between w-full mb-2"
                    >
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-orange-600" />
                        <h3 className="font-medium text-gray-900">Lifestyle</h3>
                      </div>
                      {expandedSections.lifestyle ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </button>

                    {expandedSections.lifestyle && (
                      <div className="space-y-4 mt-3">
                        {/* Smoking */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Smoking
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {['never', 'occasionally', 'regularly', 'trying_to_quit'].map((option) => (
                              <label key={option} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={filters.smokingPreferences?.includes(option) || false}
                                  onChange={(e) => {
                                    const current = filters.smokingPreferences || [];
                                    const updated = e.target.checked
                                      ? [...current, option]
                                      : current.filter(o => o !== option);
                                    updateFilters({ smokingPreferences: updated });
                                  }}
                                  className="rounded text-blue-600"
                                />
                                <span className="text-sm text-gray-700 capitalize">
                                  {option.replace('_', ' ')}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Drinking */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Drinking
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {['never', 'socially', 'regularly'].map((option) => (
                              <label key={option} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={filters.drinkingPreferences?.includes(option) || false}
                                  onChange={(e) => {
                                    const current = filters.drinkingPreferences || [];
                                    const updated = e.target.checked
                                      ? [...current, option]
                                      : current.filter(o => o !== option);
                                    updateFilters({ drinkingPreferences: updated });
                                  }}
                                  className="rounded text-blue-600"
                                />
                                <span className="text-sm text-gray-700 capitalize">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Has Children */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Has Children
                          </label>
                          <div className="flex space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                checked={filters.hasChildren === true}
                                onChange={() => updateFilters({ hasChildren: true })}
                                className="text-blue-600"
                              />
                              <span className="text-sm text-gray-700">Yes</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                checked={filters.hasChildren === false}
                                onChange={() => updateFilters({ hasChildren: false })}
                                className="text-blue-600"
                              />
                              <span className="text-sm text-gray-700">No</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                checked={filters.hasChildren === undefined}
                                onChange={() => updateFilters({ hasChildren: undefined })}
                                className="text-blue-600"
                              />
                              <span className="text-sm text-gray-700">Any</span>
                            </label>
                          </div>
                        </div>

                        {/* Wants Children */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Wants Children
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {['yes', 'no', 'maybe', 'undecided'].map((option) => (
                              <label key={option} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={filters.wantsChildren?.includes(option) || false}
                                  onChange={(e) => {
                                    const current = filters.wantsChildren || [];
                                    const updated = e.target.checked
                                      ? [...current, option]
                                      : current.filter(o => o !== option);
                                    updateFilters({ wantsChildren: updated });
                                  }}
                                  className="rounded text-blue-600"
                                />
                                <span className="text-sm text-gray-700 capitalize">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interests Section */}
                  <div>
                    <button
                      onClick={() => toggleSection('interests')}
                      className="flex items-center justify-between w-full mb-2"
                    >
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-purple-600" />
                        <h3 className="font-medium text-gray-900">Interests & Personality</h3>
                      </div>
                      {expandedSections.interests ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </button>

                    {expandedSections.interests && (
                      <div className="space-y-4 mt-3">
                        {/* Interests */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Interests
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {['Travel', 'Cooking', 'Music', 'Sports', 'Reading', 'Movies', 'Art', 'Technology', 'Fitness', 'Nature', 'Photography', 'Dancing'].map((interest) => (
                              <label key={interest} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={filters.interests?.includes(interest) || false}
                                  onChange={(e) => {
                                    const current = filters.interests || [];
                                    const updated = e.target.checked
                                      ? [...current, interest]
                                      : current.filter(i => i !== interest);
                                    updateFilters({ interests: updated });
                                  }}
                                  className="rounded text-blue-600"
                                />
                                <span className="text-sm text-gray-700">{interest}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Personality Traits */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Personality Traits
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {['Outgoing', 'Introverted', 'Adventurous', 'Calm', 'Creative', 'Analytical', 'Spontaneous', 'Organized', 'Ambitious', 'Laid-back', 'Traditional', 'Progressive'].map((trait) => (
                              <label key={trait} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={filters.personalityTraits?.includes(trait) || false}
                                  onChange={(e) => {
                                    const current = filters.personalityTraits || [];
                                    const updated = e.target.checked
                                      ? [...current, trait]
                                      : current.filter(t => t !== trait);
                                    updateFilters({ personalityTraits: updated });
                                  }}
                                  className="rounded text-blue-600"
                                />
                                <span className="text-sm text-gray-700">{trait}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <Button
                      onClick={handleSearch}
                      loading={isLoading}
                      className="w-full"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={handleResetFilters}
                        className="flex-1"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => setShowSaveDialog(true)}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Search Dialog */}
            {showSaveDialog && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200"
              >
                <h3 className="font-medium text-gray-900 mb-3">Save This Search</h3>
                <Input
                  type="text"
                  placeholder="Enter a name for this search"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="mb-3"
                />
                <div className="flex space-x-2">
                  <Button
                    variant="primary"
                    onClick={handleSaveSearch}
                    disabled={!searchName.trim()}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveDialog(false)}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            <SearchResults
              results={searchResults}
              isLoading={isLoading}
              error={error}
              totalResults={totalResults}
              currentPage={currentPage}
              onPageChange={(page) => executeSearch(filters, page)}
            />
          </div>
        </div>
      )}

      {/* Saved Searches Tab */}
      {activeTab === 'saved' && (
        <SavedSearches
          savedSearches={savedSearches}
          onLoad={handleLoadSavedSearch}
          onDelete={deleteSavedSearch}
        />
      )}

      {/* Search History Tab */}
      {activeTab === 'history' && (
        <SearchHistory
          searchHistory={searchHistory}
          onLoad={(filters) => {
            updateFilters(filters);
            executeSearch(filters, 1);
            setActiveTab('search');
          }}
          onClear={clearSearchHistory}
        />
      )}
    </div>
  );
};

export default AdvancedSearch;