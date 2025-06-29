import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface CompatibilityFactor {
  id: string;
  name: string;
  description: string;
  weight: number;
  category: string;
}

export interface CompatibilityPreference {
  factorId: string;
  importance: number; // 0-5 scale
}

export interface CompatibilityScore {
  userId: string;
  targetUserId: string;
  score: number;
  confidence: number;
  factors?: Record<string, number>;
  modelId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompatibilityExplanation {
  score: number;
  explanation: string;
  topFactors: Array<{
    factor: string;
    score: number;
    description: string;
  }>;
  improvementAreas: Array<{
    factor: string;
    score: number;
    suggestion: string;
  }>;
}

export interface CompatibilityInsight {
  type: 'strength' | 'challenge' | 'opportunity';
  title: string;
  description: string;
  score: number;
}

export const useCompatibilityScoring = (userId?: string) => {
  const [compatibilityFactors, setCompatibilityFactors] = useState<CompatibilityFactor[]>([]);
  const [userPreferences, setUserPreferences] = useState<CompatibilityPreference[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load compatibility factors
  const loadCompatibilityFactors = useCallback(async () => {
    if (!supabase) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('compatibility_factors')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        setCompatibilityFactors(data.map(factor => ({
          id: factor.id,
          name: factor.name,
          description: factor.description,
          weight: factor.weight,
          category: factor.category
        })));
      }
    } catch (err) {
      console.error('Error loading compatibility factors:', err);
      setError('Failed to load compatibility factors');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user preferences
  const loadUserPreferences = useCallback(async () => {
    if (!supabase || !userId) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('user_compatibility_preferences')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      if (data) {
        setUserPreferences(data.map(pref => ({
          factorId: pref.factor_id,
          importance: pref.importance
        })));
      }
    } catch (err) {
      console.error('Error loading user preferences:', err);
      setError('Failed to load your compatibility preferences');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Save user preference
  const saveUserPreference = useCallback(async (factorId: string, importance: number) => {
    if (!supabase || !userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_compatibility_preferences')
        .upsert({
          user_id: userId,
          factor_id: factorId,
          importance,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,factor_id'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      setUserPreferences(prev => {
        const existing = prev.findIndex(p => p.factorId === factorId);
        if (existing >= 0) {
          return [
            ...prev.slice(0, existing),
            { factorId, importance },
            ...prev.slice(existing + 1)
          ];
        } else {
          return [...prev, { factorId, importance }];
        }
      });
      
      return data;
    } catch (err) {
      console.error('Error saving user preference:', err);
      throw err;
    }
  }, [userId]);

  // Get compatibility score between current user and another user
  const getCompatibilityScore = useCallback(async (targetUserId: string): Promise<CompatibilityScore | null> => {
    if (!supabase || !userId) return null;
    
    try {
      // First check if we have a recent score
      const { data: existingScore, error: fetchError } = await supabase
        .from('compatibility_scores')
        .select('*')
        .eq('user_id', userId)
        .eq('target_user_id', targetUserId)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw fetchError;
      }
      
      // If we have a recent score (less than 7 days old), return it
      if (existingScore && new Date(existingScore.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        return {
          userId: existingScore.user_id,
          targetUserId: existingScore.target_user_id,
          score: existingScore.score,
          confidence: existingScore.confidence,
          factors: existingScore.factors,
          modelId: existingScore.model_id,
          createdAt: existingScore.created_at,
          updatedAt: existingScore.updated_at
        };
      }
      
      // Otherwise, calculate a new score
      const { data: newScore, error: calcError } = await supabase
        .rpc('calculate_compatibility_score', {
          p_user_id: userId,
          p_target_user_id: targetUserId
        });
      
      if (calcError) throw calcError;
      
      // Fetch the newly calculated score
      const { data: updatedScore, error: updatedError } = await supabase
        .from('compatibility_scores')
        .select('*')
        .eq('user_id', userId)
        .eq('target_user_id', targetUserId)
        .single();
      
      if (updatedError) throw updatedError;
      
      return {
        userId: updatedScore.user_id,
        targetUserId: updatedScore.target_user_id,
        score: updatedScore.score,
        confidence: updatedScore.confidence,
        factors: updatedScore.factors,
        modelId: updatedScore.model_id,
        createdAt: updatedScore.created_at,
        updatedAt: updatedScore.updated_at
      };
    } catch (err) {
      console.error('Error getting compatibility score:', err);
      return null;
    }
  }, [userId]);

  // Get compatibility explanation
  const getCompatibilityExplanation = useCallback(async (targetUserId: string): Promise<CompatibilityExplanation | null> => {
    if (!supabase || !userId) return null;
    
    try {
      // Get the compatibility score
      const score = await getCompatibilityScore(targetUserId);
      if (!score) return null;
      
      // Get explanation text
      const { data: explanation, error } = await supabase
        .rpc('get_compatibility_explanation', {
          p_user_id: userId,
          p_target_user_id: targetUserId
        });
      
      if (error) throw error;
      
      // Generate mock top factors and improvement areas
      // In a real implementation, this would come from the AI model
      const mockTopFactors = [
        {
          factor: 'Cultural Values',
          score: 92,
          description: 'You share many important cultural values and traditions'
        },
        {
          factor: 'Communication Style',
          score: 88,
          description: 'Your communication styles complement each other well'
        },
        {
          factor: 'Relationship Goals',
          score: 85,
          description: 'You have similar long-term relationship objectives'
        }
      ];
      
      const mockImprovementAreas = [
        {
          factor: 'Leisure Activities',
          score: 65,
          suggestion: 'Try exploring each other\'s favorite activities'
        },
        {
          factor: 'Conflict Resolution',
          score: 70,
          suggestion: 'Work on understanding each other\'s approach to resolving disagreements'
        }
      ];
      
      return {
        score: score.score,
        explanation: explanation || 'You have good compatibility with potential for a meaningful connection.',
        topFactors: mockTopFactors,
        improvementAreas: mockImprovementAreas
      };
    } catch (err) {
      console.error('Error getting compatibility explanation:', err);
      return null;
    }
  }, [userId, getCompatibilityScore]);

  // Get compatibility insights
  const getCompatibilityInsights = useCallback(async (targetUserId: string): Promise<CompatibilityInsight[] | null> => {
    if (!supabase || !userId) return null;
    
    try {
      // Get the compatibility score
      const score = await getCompatibilityScore(targetUserId);
      if (!score) return null;
      
      // Generate insights based on score
      // In a real implementation, this would use more sophisticated analysis
      const insights: CompatibilityInsight[] = [];
      
      // Add strengths
      if (score.score >= 80) {
        insights.push({
          type: 'strength',
          title: 'Strong Cultural Connection',
          description: 'You share important cultural values that can form a solid foundation for your relationship.',
          score: Math.min(100, score.score + 5)
        });
      }
      
      if (score.score >= 75) {
        insights.push({
          type: 'strength',
          title: 'Communication Compatibility',
          description: 'Your communication styles are well-matched, which can help prevent misunderstandings.',
          score: Math.min(100, score.score + 3)
        });
      }
      
      // Add challenges
      if (score.score < 70) {
        insights.push({
          type: 'challenge',
          title: 'Different Expectations',
          description: 'You may have different expectations about relationships that could require discussion.',
          score: Math.max(40, score.score - 10)
        });
      }
      
      // Add opportunities
      insights.push({
        type: 'opportunity',
        title: 'Cultural Exchange',
        description: 'Learning about each other\'s cultures can strengthen your bond and create shared experiences.',
        score: 85
      });
      
      return insights;
    } catch (err) {
      console.error('Error getting compatibility insights:', err);
      return null;
    }
  }, [userId, getCompatibilityScore]);

  // Get top compatible matches
  const getTopCompatibleMatches = useCallback(async (limit: number = 20, minScore: number = 70): Promise<Array<{userId: string; score: number}> | null> => {
    if (!supabase || !userId) return null;
    
    try {
      const { data, error } = await supabase
        .rpc('get_top_compatible_matches', {
          p_user_id: userId,
          p_limit: limit,
          p_min_score: minScore
        });
      
      if (error) throw error;
      
      return data?.map(match => ({
        userId: match.user_id,
        score: match.score
      })) || [];
    } catch (err) {
      console.error('Error getting top compatible matches:', err);
      return null;
    }
  }, [userId]);

  // Update all compatibility scores
  const updateAllCompatibilityScores = useCallback(async (): Promise<boolean> => {
    if (!supabase || !userId) return false;
    
    try {
      const { error } = await supabase
        .rpc('update_compatibility_scores', {
          p_user_id: userId
        });
      
      if (error) throw error;
      
      return true;
    } catch (err) {
      console.error('Error updating compatibility scores:', err);
      return false;
    }
  }, [userId]);

  // Load data on mount
  useEffect(() => {
    loadCompatibilityFactors();
    if (userId) {
      loadUserPreferences();
    }
  }, [loadCompatibilityFactors, loadUserPreferences, userId]);

  return {
    compatibilityFactors,
    userPreferences,
    isLoading,
    error,
    saveUserPreference,
    getCompatibilityScore,
    getCompatibilityExplanation,
    getCompatibilityInsights,
    getTopCompatibleMatches,
    updateAllCompatibilityScores,
    refreshData: () => {
      loadCompatibilityFactors();
      if (userId) {
        loadUserPreferences();
      }
    }
  };
};