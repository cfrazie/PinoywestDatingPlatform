import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface SearchFilters {
  ageRange: [number, number];
  distance: number;
  heightRange?: [number, number];
  bodyTypes?: string[];
  educationLevels?: string[];
  religions?: string[];
  hasChildren?: boolean;
  wantsChildren?: string[];
  smokingPreferences?: string[];
  drinkingPreferences?: string[];
  languages?: string[];
  culturalBackgrounds?: string[];
  interests?: string[];
  personalityTraits?: string[];
  onlineNow?: boolean;
  hasPhoto?: boolean;
  verifiedOnly?: boolean;
  sortBy: 'relevance' | 'newest' | 'distance' | 'age_asc' | 'age_desc';
  locationPreferences?: {
    country?: string;
    region?: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface SearchResult {
  userId: string;
  username: string;
  age: number;
  location: string;
  distance: number;
  compatibilityScore: number;
  photoUrl: string;
  onlineStatus: boolean;
  verified: boolean;
  lastActive: string;
  culturalBackground: string;
  interests: string[];
  languages: string[];
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: string;
}

export interface SearchHistoryItem {
  id: string;
  filters: SearchFilters;
  resultsCount: number;
  executedAt: string;
}

export const useAdvancedSearch = (userId?: string) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);

  // Default filters
  const defaultFilters: SearchFilters = {
    ageRange: [18, 65],
    distance: 100,
    hasPhoto: true,
    verifiedOnly: false,
    sortBy: 'relevance'
  };

  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);

  // Load saved searches
  const loadSavedSearches = useCallback(async () => {
    if (!userId || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('user_saved_searches')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setSavedSearches(data.map(item => ({
          id: item.id,
          name: item.name,
          filters: item.search_params,
          createdAt: item.created_at
        })));
      }
    } catch (err) {
      console.error('Error loading saved searches:', err);
    }
  }, [userId]);

  // Load search history
  const loadSearchHistory = useCallback(async () => {
    if (!userId || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('user_search_history')
        .select('*')
        .eq('user_id', userId)
        .order('executed_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        setSearchHistory(data.map(item => ({
          id: item.id,
          filters: item.search_params,
          resultsCount: item.results_count,
          executedAt: item.executed_at
        })));
      }
    } catch (err) {
      console.error('Error loading search history:', err);
    }
  }, [userId]);

  // Execute search
  const executeSearch = useCallback(async (searchFilters: SearchFilters = filters, page: number = 1) => {
    if (!supabase) {
      // Mock search for demo
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock results
        const mockResults: SearchResult[] = Array.from({ length: 10 }).map((_, index) => ({
          userId: `user_${Date.now()}_${index}`,
          username: ['Maria', 'Ana', 'Sofia', 'Isabella', 'Carmen'][Math.floor(Math.random() * 5)] + ' ' +
                   ['Santos', 'Garcia', 'Cruz', 'Reyes', 'Rodriguez'][Math.floor(Math.random() * 5)],
          age: Math.floor(Math.random() * 15) + 25, // 25-40
          location: ['Manila, Philippines', 'Cebu City, Philippines', 'Davao City, Philippines'][Math.floor(Math.random() * 3)],
          distance: Math.floor(Math.random() * 1000) + 500, // 500-1500 km
          compatibilityScore: Math.floor(Math.random() * 30) + 70, // 70-100
          photoUrl: `https://images.pexels.com/photos/${[774909, 762020, 415829, 1239291, 1065084][Math.floor(Math.random() * 5)]}/pexels-photo-774909.jpeg`,
          onlineStatus: Math.random() > 0.5,
          verified: Math.random() > 0.3,
          lastActive: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)).toISOString(), // Last 7 days
          culturalBackground: 'Filipino',
          interests: ['Cooking', 'Travel', 'Music', 'Reading', 'Dancing'].sort(() => 0.5 - Math.random()).slice(0, 3),
          languages: ['Filipino', 'English', 'Cebuano'].sort(() => 0.5 - Math.random()).slice(0, 2)
        }));
        
        setSearchResults(mockResults);
        setTotalResults(120); // Mock total
        setCurrentPage(page);
        
        return {
          results: mockResults,
          total: 120
        };
      } catch (err) {
        setError('Search failed. Please try again.');
        console.error('Search error:', err);
        return {
          results: [],
          total: 0
        };
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * resultsPerPage;

      // Call the search_users function
      const { data, error } = await supabase.rpc('search_users', {
        p_user_id: userId,
        p_age_min: searchFilters.ageRange[0],
        p_age_max: searchFilters.ageRange[1],
        p_distance_max: searchFilters.distance,
        p_height_min: searchFilters.heightRange?.[0],
        p_height_max: searchFilters.heightRange?.[1],
        p_body_types: searchFilters.bodyTypes,
        p_education_levels: searchFilters.educationLevels,
        p_religions: searchFilters.religions,
        p_has_children: searchFilters.hasChildren,
        p_wants_children: searchFilters.wantsChildren,
        p_smoking_preferences: searchFilters.smokingPreferences,
        p_drinking_preferences: searchFilters.drinkingPreferences,
        p_languages: searchFilters.languages,
        p_cultural_backgrounds: searchFilters.culturalBackgrounds,
        p_interests: searchFilters.interests,
        p_personality_traits: searchFilters.personalityTraits,
        p_location_preferences: searchFilters.locationPreferences,
        p_online_now: searchFilters.onlineNow,
        p_has_photo: searchFilters.hasPhoto,
        p_verified_only: searchFilters.verifiedOnly,
        p_sort_by: searchFilters.sortBy,
        p_limit: resultsPerPage,
        p_offset: offset
      });

      if (error) throw error;

      if (data) {
        const formattedResults: SearchResult[] = data.map(item => ({
          userId: item.user_id,
          username: item.username,
          age: item.age,
          location: item.location,
          distance: item.distance,
          compatibilityScore: item.compatibility_score,
          photoUrl: item.photo_url,
          onlineStatus: item.online_status,
          verified: item.verified,
          lastActive: item.last_active,
          culturalBackground: item.cultural_background,
          interests: item.interests,
          languages: item.languages
        }));

        setSearchResults(formattedResults);
        setTotalResults(data[0]?.total_count || 0);
        setCurrentPage(page);

        return {
          results: formattedResults,
          total: data[0]?.total_count || 0
        };
      }

      return {
        results: [],
        total: 0
      };
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
      return {
        results: [],
        total: 0
      };
    } finally {
      setIsLoading(false);
    }
  }, [userId, filters, resultsPerPage]);

  // Save search
  const saveSearch = useCallback(async (name: string, searchFilters: SearchFilters = filters) => {
    if (!userId || !supabase) return null;

    try {
      const { data, error } = await supabase
        .from('user_saved_searches')
        .insert({
          user_id: userId,
          name,
          search_params: searchFilters
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newSavedSearch: SavedSearch = {
          id: data.id,
          name: data.name,
          filters: data.search_params,
          createdAt: data.created_at
        };

        setSavedSearches(prev => [newSavedSearch, ...prev]);
        return newSavedSearch;
      }

      return null;
    } catch (err) {
      console.error('Error saving search:', err);
      throw err;
    }
  }, [userId, filters]);

  // Delete saved search
  const deleteSavedSearch = useCallback(async (searchId: string) => {
    if (!userId || !supabase) return false;

    try {
      const { error } = await supabase
        .from('user_saved_searches')
        .delete()
        .eq('id', searchId)
        .eq('user_id', userId);

      if (error) throw error;

      setSavedSearches(prev => prev.filter(search => search.id !== searchId));
      return true;
    } catch (err) {
      console.error('Error deleting saved search:', err);
      return false;
    }
  }, [userId]);

  // Clear search history
  const clearSearchHistory = useCallback(async () => {
    if (!userId || !supabase) return false;

    try {
      const { error } = await supabase
        .from('user_search_history')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setSearchHistory([]);
      return true;
    } catch (err) {
      console.error('Error clearing search history:', err);
      return false;
    }
  }, [userId]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  // Load saved searches and history on mount
  useEffect(() => {
    if (userId) {
      loadSavedSearches();
      loadSearchHistory();
    }
  }, [userId, loadSavedSearches, loadSearchHistory]);

  return {
    searchResults,
    savedSearches,
    searchHistory,
    isLoading,
    error,
    totalResults,
    currentPage,
    resultsPerPage,
    filters,
    executeSearch,
    saveSearch,
    deleteSavedSearch,
    clearSearchHistory,
    updateFilters,
    resetFilters,
    setResultsPerPage
  };
};