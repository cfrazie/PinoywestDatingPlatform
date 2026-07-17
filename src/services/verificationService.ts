import { supabase } from '../lib/supabase';
import type {
  UserVerificationRequest,
  SocialMediaVerification,
  VerificationStatusResponse,
} from '../types/cultureWall';

export const verificationService = {
  // Submit image for verification
  async submitImageVerification(
    imageUrl: string,
    verificationType: 'photo' | 'id_document' | 'video_selfie' | 'phone_camera',
    imageHash?: string
  ): Promise<UserVerificationRequest> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Call edge function to process image
    const { data, error } = await supabase.functions.invoke('verify-user-image', {
      body: {
        userId: user.id,
        imageUrl,
        imageHash,
        verificationType,
      },
    });

    if (error) throw error;
    return data.verification;
  },

  // Get verification requests
  async getVerificationRequests(userId: string, options: { limit?: number; offset?: number } = {}) {
    const { limit = 10, offset = 0 } = options;

    const { data, error } = await supabase
      .from('user_verification_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data as UserVerificationRequest[];
  },

  // Get latest verification request
  async getLatestVerification(userId: string): Promise<UserVerificationRequest | null> {
    const { data, error } = await supabase
      .from('user_verification_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as UserVerificationRequest | null;
  },

  // Get verification status
  async getVerificationStatus(userId: string): Promise<VerificationStatusResponse> {
    const { data, error } = await supabase.rpc('get_user_verification_status', {
      p_user_id: userId,
    });

    if (error) throw error;
    return data as VerificationStatusResponse;
  },

  // Get image match detections
  async getImageMatches(verificationRequestId: string) {
    const { data, error } = await supabase
      .from('image_match_detections')
      .select('*')
      .eq('verification_request_id', verificationRequestId)
      .order('similarity_score', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Social media verifications
  async getSocialVerifications(userId: string) {
    const { data, error } = await supabase
      .from('social_media_verifications')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data as SocialMediaVerification[];
  },

  async addSocialVerification(
    platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok',
    platformData: {
      platform_user_id?: string;
      platform_username?: string;
      profile_url?: string;
      verification_method?: 'oauth' | 'manual' | 'api';
      account_creation_date?: string;
      followers_count?: number;
      posts_count?: number;
      profile_image_url?: string;
    }
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('social_media_verifications')
      .upsert({
        user_id: user.id,
        platform,
        ...platformData,
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as SocialMediaVerification;
  },

  async removeSocialVerification(platform: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('social_media_verifications')
      .delete()
      .eq('user_id', user.id)
      .eq('platform', platform);

    if (error) throw error;
  },

  // Check if user has any verified social media
  async hasVerifiedSocialMedia(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('social_media_verifications')
      .select('id')
      .eq('user_id', userId)
      .eq('verified', true)
      .limit(1);

    if (error) throw error;
    return (data?.length || 0) > 0;
  },

  // Calculate verification score (0-100)
  async getVerificationScore(userId: string): Promise<number> {
    let score = 0;

    // Check latest image verification
    const latestVerification = await this.getLatestVerification(userId);
    if (latestVerification?.status === 'verified') {
      if (latestVerification.risk_level === 'low') {
        score += 40;
      } else if (latestVerification.risk_level === 'medium') {
        score += 30;
      } else if (latestVerification.risk_level === 'high') {
        score += 20;
      }

      if (latestVerification.is_phone_camera) {
        score += 10;
      }
    }

    // Check social media verifications
    const socialVerifications = await this.getSocialVerifications(userId);
    score += Math.min(socialVerifications.length * 10, 50);

    return Math.min(score, 100);
  },
};
