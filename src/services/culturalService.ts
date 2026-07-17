import { supabase } from '../lib/supabase';
import type {
  CulturalGuideline,
  UserCulturalInsights,
} from '../types/cultureWall';

export const culturalService = {
  // Fetch cultural guidelines from Wikipedia
  async fetchGuidelinesFromWikipedia(country: string, region?: string) {
    const { data, error } = await supabase.functions.invoke('fetch-cultural-data', {
      body: { country, region },
    });

    if (error) throw error;
    return data;
  },

  // Get cultural guidelines
  async getGuidelines(options: {
    country?: string;
    category?: string;
    guidelineType?: string;
    importanceLevel?: string;
    limit?: number;
  } = {}) {
    const { country, category, guidelineType, importanceLevel, limit = 50 } = options;

    let query = supabase
      .from('cultural_guidelines')
      .select('*')
      .order('importance_level', { ascending: true })
      .order('helpful_count', { ascending: false })
      .limit(limit);

    if (country) {
      query = query.eq('country', country);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (guidelineType) {
      query = query.eq('guideline_type', guidelineType);
    }

    if (importanceLevel) {
      query = query.eq('importance_level', importanceLevel);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as CulturalGuideline[];
  },

  // Get guidelines by country pair (for cross-cultural dating)
  async getGuidelinesForCountryPair(country1: string, country2: string) {
    const { data, error } = await supabase
      .from('cultural_guidelines')
      .select('*')
      .in('country', [country1, country2])
      .order('importance_level', { ascending: true });

    if (error) throw error;
    return data as CulturalGuideline[];
  },

  // Submit guideline feedback
  async submitGuidelineFeedback(guidelineId: string, isHelpful: boolean, comment?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('cultural_guideline_feedback')
      .upsert({
        user_id: user.id,
        guideline_id: guidelineId,
        is_helpful: isHelpful,
        comment,
      });

    if (error) throw error;
  },

  // Get user cultural insights
  async getUserInsights(userId: string): Promise<UserCulturalInsights | null> {
    const { data, error } = await supabase
      .from('user_cultural_insights')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as UserCulturalInsights | null;
  },

  // Generate cultural insights
  async generateInsights(userId: string) {
    const { data, error } = await supabase.rpc('generate_cultural_insights', {
      p_user_id: userId,
    });

    if (error) throw error;
    return data;
  },

  // Update user insights
  async updateUserInsights(
    userId: string,
    insights: {
      home_country: string;
      current_country?: string;
      partner_country?: string;
      cultural_differences?: any;
      communication_tips?: any;
      dating_guidelines?: any;
      family_expectations?: any;
    }
  ) {
    const { data, error } = await supabase
      .from('user_cultural_insights')
      .upsert({
        user_id: userId,
        ...insights,
        last_generated: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as UserCulturalInsights;
  },

  // Get guidelines by category
  async getGuidelinesByCategory(country: string, category: string) {
    const { data, error } = await supabase
      .from('cultural_guidelines')
      .select('*')
      .eq('country', country)
      .eq('category', category)
      .order('importance_level', { ascending: true });

    if (error) throw error;
    return data as CulturalGuideline[];
  },

  // Get do's and don'ts separately
  async getDosAndDonts(country: string) {
    const { data, error } = await supabase
      .from('cultural_guidelines')
      .select('*')
      .eq('country', country)
      .in('guideline_type', ['do', 'dont'])
      .order('importance_level', { ascending: true });

    if (error) throw error;

    const dos = data?.filter(g => g.guideline_type === 'do') || [];
    const donts = data?.filter(g => g.guideline_type === 'dont') || [];

    return { dos, donts };
  },

  // Get tips and warnings
  async getTipsAndWarnings(country: string) {
    const { data, error } = await supabase
      .from('cultural_guidelines')
      .select('*')
      .eq('country', country)
      .in('guideline_type', ['tip', 'warning'])
      .order('importance_level', { ascending: true });

    if (error) throw error;

    const tips = data?.filter(g => g.guideline_type === 'tip') || [];
    const warnings = data?.filter(g => g.guideline_type === 'warning') || [];

    return { tips, warnings };
  },

  // Search guidelines
  async searchGuidelines(query: string, country?: string) {
    let dbQuery = supabase
      .from('cultural_guidelines')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('helpful_count', { ascending: false })
      .limit(20);

    if (country) {
      dbQuery = dbQuery.eq('country', country);
    }

    const { data, error } = await dbQuery;

    if (error) throw error;
    return data as CulturalGuideline[];
  },

  // Get most helpful guidelines
  async getMostHelpfulGuidelines(country: string, limit = 10) {
    const { data, error } = await supabase
      .from('cultural_guidelines')
      .select('*')
      .eq('country', country)
      .order('helpful_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as CulturalGuideline[];
  },
};
