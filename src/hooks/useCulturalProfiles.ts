import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface CulturalLandmark {
  name: string;
  significance: string;
  image?: string;
}

interface CulturalEvent {
  name: string;
  description: string;
  season: string;
}

interface CulturalDish {
  dish: string;
  description: string;
  specialty: boolean;
}

interface CulturalIndustry {
  industry: string;
  description: string;
}

interface CulturalTradition {
  name: string;
  description: string;
}

interface CulturalProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  location: {
    city: string;
    state: string;
    country: string;
    population: string;
    demographics: string[];
  };
  landmarks: CulturalLandmark[];
  events: CulturalEvent[];
  cuisine: CulturalDish[];
  activities: string[];
  economy: CulturalIndustry[];
  traditions: CulturalTradition[];
}

interface CulturalMatch {
  american: CulturalProfile;
  filipino: CulturalProfile;
}

interface ConversationStarter {
  id: string;
  category: string;
  question: string;
  culture?: string;
  difficulty: string;
}

export const useCulturalProfiles = (userId?: string) => {
  const [culturalMatches, setCulturalMatches] = useState<CulturalMatch[]>([]);
  const [userProfile, setUserProfile] = useState<CulturalProfile | null>(null);
  const [conversationStarters, setConversationStarters] = useState<ConversationStarter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cultural profiles
  const loadCulturalProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (supabase) {
        // Load user's profile
        if (userId) {
          const { data: userProfileData, error: userProfileError } = await supabase
            .from('cultural_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (userProfileError && userProfileError.code !== 'PGRST116') {
            // PGRST116 is "no rows returned" which is fine if user hasn't created a profile
            throw userProfileError;
          }

          if (userProfileData) {
            setUserProfile({
              id: userProfileData.id,
              userId: userProfileData.user_id,
              name: userProfileData.name || 'Your Profile',
              avatar: userProfileData.avatar || 'https://via.placeholder.com/150',
              location: {
                city: userProfileData.location_name.split(',')[0],
                state: userProfileData.region || '',
                country: userProfileData.country,
                population: userProfileData.population || '',
                demographics: userProfileData.demographics || []
              },
              landmarks: userProfileData.landmarks || [],
              events: userProfileData.events || [],
              cuisine: userProfileData.cuisine || [],
              activities: userProfileData.activities || [],
              economy: userProfileData.economy || [],
              traditions: userProfileData.traditions || []
            });
          }
        }

        // Load sample profiles for matches
        const { data: profilesData, error: profilesError } = await supabase
          .from('cultural_profiles')
          .select('*')
          .limit(10);

        if (profilesError) throw profilesError;

        if (profilesData && profilesData.length > 0) {
          // Group profiles into American and Filipino matches
          const americanProfiles = profilesData.filter(p => 
            p.country === 'United States' && p.user_id !== userId
          );
          
          const filipinoProfiles = profilesData.filter(p => 
            p.country === 'Philippines' && p.user_id !== userId
          );

          // Create matches
          const matches: CulturalMatch[] = [];
          const maxMatches = Math.min(americanProfiles.length, filipinoProfiles.length);
          
          for (let i = 0; i < maxMatches; i++) {
            const americanProfile = americanProfiles[i];
            const filipinoProfile = filipinoProfiles[i];
            
            matches.push({
              american: {
                id: americanProfile.id,
                userId: americanProfile.user_id,
                name: americanProfile.name || 'American Partner',
                avatar: americanProfile.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
                location: {
                  city: americanProfile.location_name.split(',')[0],
                  state: americanProfile.region || '',
                  country: americanProfile.country,
                  population: americanProfile.population || '',
                  demographics: americanProfile.demographics || []
                },
                landmarks: americanProfile.landmarks || [],
                events: americanProfile.events || [],
                cuisine: americanProfile.cuisine || [],
                activities: americanProfile.activities || [],
                economy: americanProfile.economy || [],
                traditions: americanProfile.traditions || []
              },
              filipino: {
                id: filipinoProfile.id,
                userId: filipinoProfile.user_id,
                name: filipinoProfile.name || 'Filipino Partner',
                avatar: filipinoProfile.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
                location: {
                  city: filipinoProfile.location_name.split(',')[0],
                  state: filipinoProfile.region || '',
                  country: filipinoProfile.country,
                  population: filipinoProfile.population || '',
                  demographics: filipinoProfile.demographics || []
                },
                landmarks: filipinoProfile.landmarks || [],
                events: filipinoProfile.events || [],
                cuisine: filipinoProfile.cuisine || [],
                activities: filipinoProfile.activities || [],
                economy: filipinoProfile.economy || [],
                traditions: filipinoProfile.traditions || []
              }
            });
          }
          
          setCulturalMatches(matches);
        } else {
          // Use mock data if no profiles found
          console.log('No profiles found, using mock data');
        }

        // Load conversation starters
        const { data: startersData, error: startersError } = await supabase
          .from('cultural_conversation_starters')
          .select('*');

        if (startersError) throw startersError;

        if (startersData) {
          setConversationStarters(startersData.map(starter => ({
            id: starter.id,
            category: starter.category,
            question: starter.question,
            culture: starter.culture,
            difficulty: starter.difficulty
          })));
        }
      } else {
        // Use mock data if Supabase is not available
        console.log('Using mock cultural profile data');
      }
    } catch (err) {
      console.error('Error loading cultural profiles:', err);
      setError('Failed to load cultural profile data');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Create or update user's cultural profile
  const updateCulturalProfile = useCallback(async (profileData: Partial<CulturalProfile>) => {
    if (!userId || !supabase) return null;

    try {
      const formattedData = {
        user_id: userId,
        name: profileData.name,
        avatar: profileData.avatar,
        location_name: profileData.location?.city && profileData.location?.state 
          ? `${profileData.location.city}, ${profileData.location.state}`
          : undefined,
        country: profileData.location?.country,
        region: profileData.location?.state,
        population: profileData.location?.population,
        demographics: profileData.location?.demographics,
        landmarks: profileData.landmarks,
        events: profileData.events,
        cuisine: profileData.cuisine,
        activities: profileData.activities,
        economy: profileData.economy,
        traditions: profileData.traditions,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('cultural_profiles')
        .upsert(formattedData, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      if (data) {
        setUserProfile({
          id: data.id,
          userId: data.user_id,
          name: data.name || 'Your Profile',
          avatar: data.avatar || 'https://via.placeholder.com/150',
          location: {
            city: data.location_name?.split(',')[0] || '',
            state: data.region || '',
            country: data.country || '',
            population: data.population || '',
            demographics: data.demographics || []
          },
          landmarks: data.landmarks || [],
          events: data.events || [],
          cuisine: data.cuisine || [],
          activities: data.activities || [],
          economy: data.economy || [],
          traditions: data.traditions || []
        });
      }

      return data;
    } catch (err) {
      console.error('Error updating cultural profile:', err);
      throw err;
    }
  }, [userId]);

  // Get conversation starters by category
  const getConversationStartersByCategory = useCallback((category: string) => {
    return conversationStarters.filter(starter => starter.category === category);
  }, [conversationStarters]);

  // Get random conversation starters
  const getRandomConversationStarters = useCallback((count: number = 3) => {
    const shuffled = [...conversationStarters].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }, [conversationStarters]);

  // Load data on mount
  useEffect(() => {
    loadCulturalProfiles();
  }, [loadCulturalProfiles]);

  return {
    culturalMatches,
    userProfile,
    conversationStarters,
    isLoading,
    error,
    updateCulturalProfile,
    getConversationStartersByCategory,
    getRandomConversationStarters,
    refreshData: loadCulturalProfiles
  };
};