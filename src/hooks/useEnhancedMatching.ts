import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface MLRecommendation {
  targetUserId: string;
  compatibilityScore: number;
  successProbability: number;
  predictionConfidence: number;
  rank: number;
}

interface SuccessPrediction {
  messageSuccessProbability: number;
  dateSuccessProbability: number;
  relationshipSuccessProbability: number;
  longTermCompatibilityScore: number;
  predictedSatisfactionRating: number;
  ghostingRisk: number;
  conflictLikelihood: number;
  predictionConfidence: number;
  dataSufficiency: number;
  interactionCount: number;
}

interface BehavioralInsight {
  avgSessionDuration?: number;
  sessionsPerWeek?: number;
  avgProfilesViewedPerSession?: number;
  likeRate?: number;
  skipRate?: number;
  messageResponseRate?: number;
  messageResponseTimeAvg?: number;
  preferredActivityTimes?: Record<string, number>;
  preferredDays?: string[];
  swipeVelocity?: number;
  engagementScore?: number;
}

interface LearnedPreference {
  preferenceType: string;
  preferenceValue: any;
  confidence: number;
  sampleSize: number;
  learnedFrom: string;
}

export const useEnhancedMatching = (userId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get ML-powered recommendations
  const getMLRecommendations = useCallback(async (
    limit: number = 20,
    minScore: number = 60,
    useCache: boolean = true
  ): Promise<MLRecommendation[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('get_ml_recommendations', {
        p_user_id: userId,
        p_limit: limit,
        p_min_score: minScore,
        p_use_cache: useCache
      });

      if (error) throw error;

      return data.map((rec: any) => ({
        targetUserId: rec.target_user_id,
        compatibilityScore: rec.compatibility_score,
        successProbability: rec.success_probability,
        predictionConfidence: rec.prediction_confidence,
        rank: rec.rank
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to get recommendations');
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Get success prediction for a specific match
  const getSuccessPrediction = useCallback(async (
    targetUserId: string
  ): Promise<SuccessPrediction | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('predict_match_success', {
        p_user_id: userId,
        p_target_user_id: targetUserId
      });

      if (error) throw error;

      return {
        messageSuccessProbability: data.message_success_probability,
        dateSuccessProbability: data.date_success_probability,
        relationshipSuccessProbability: data.relationship_success_probability,
        longTermCompatibilityScore: data.long_term_compatibility_score,
        predictedSatisfactionRating: data.predicted_satisfaction_rating,
        ghostingRisk: data.ghosting_risk,
        conflictLikelihood: data.conflict_likelihood,
        predictionConfidence: data.prediction_confidence,
        dataSufficiency: data.data_sufficiency,
        interactionCount: data.interaction_count
      };
    } catch (err: any) {
      setError(err.message || 'Failed to get success prediction');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Generate UUID (cross-browser compatible)
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback UUID v4 generation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Track user interaction
  const trackInteraction = useCallback(async (
    targetUserId: string,
    interactionType: string,
    context?: Record<string, any>,
    sessionId?: string
  ): Promise<void> => {
    try {
      const { error } = await supabase.from('user_interactions').insert({
        user_id: userId,
        target_user_id: targetUserId,
        interaction_type: interactionType,
        interaction_context: context || {},
        session_id: sessionId || generateUUID(),
        created_at: new Date().toISOString()
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Failed to track interaction:', err);
    }
  }, [userId]);

  // Get behavioral insights
  const getBehavioralInsights = useCallback(async (): Promise<BehavioralInsight | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('user_engagement_patterns')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return {
        avgSessionDuration: data.avg_session_duration,
        sessionsPerWeek: data.sessions_per_week,
        avgProfilesViewedPerSession: data.avg_profiles_viewed_per_session,
        likeRate: data.like_rate,
        skipRate: data.skip_rate,
        messageResponseRate: data.message_response_rate,
        messageResponseTimeAvg: data.message_response_time_avg,
        preferredActivityTimes: data.preferred_activity_times,
        preferredDays: data.preferred_days,
        swipeVelocity: data.swipe_velocity,
        engagementScore: data.engagement_score
      };
    } catch (err: any) {
      setError(err.message || 'Failed to get behavioral insights');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Get learned preferences
  const getLearnedPreferences = useCallback(async (): Promise<LearnedPreference[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('learned_user_preferences')
        .select('*')
        .eq('user_id', userId)
        .order('confidence', { ascending: false });

      if (error) throw error;

      return data.map((pref: any) => ({
        preferenceType: pref.preference_type,
        preferenceValue: pref.preference_value,
        confidence: pref.confidence,
        sampleSize: pref.sample_size,
        learnedFrom: pref.learned_from
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to get learned preferences');
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Refresh recommendations cache
  const refreshRecommendations = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.rpc('refresh_recommendations_cache', {
        p_user_id: userId
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to refresh recommendations');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Update engagement patterns
  const updateEngagementPatterns = useCallback(async (): Promise<void> => {
    try {
      const { error } = await supabase.rpc('update_engagement_patterns', {
        p_user_id: userId
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Failed to update engagement patterns:', err);
    }
  }, [userId]);

  return {
    loading,
    error,
    getMLRecommendations,
    getSuccessPrediction,
    trackInteraction,
    getBehavioralInsights,
    getLearnedPreferences,
    refreshRecommendations,
    updateEngagementPatterns
  };
};
