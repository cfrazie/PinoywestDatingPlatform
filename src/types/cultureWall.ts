// Culture Wall Types
export interface CultureWallPost {
  id: string;
  user_id: string;
  content: string;
  post_type: 'text' | 'photo' | 'video' | 'link' | 'poll' | 'story' | 'event';
  media_urls?: string[];
  category?: 'food' | 'traditions' | 'travel' | 'dating_tips' | 'language' | 'festivals' | 'success_story' | 'question' | 'advice' | 'cultural_challenge';
  culture_tags?: string[];
  location_tags?: string[];
  hashtags?: string[];
  visibility: 'public' | 'couples_only' | 'friends_only' | 'private';
  allow_comments: boolean;
  allow_shares: boolean;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  saves_count: number;
  is_featured: boolean;
  is_verified: boolean;
  is_reported: boolean;
  moderation_status: 'pending' | 'approved' | 'rejected' | 'flagged';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CultureWallComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  media_url?: string;
  likes_count: number;
  is_author_reply: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CultureWallReaction {
  id: string;
  user_id: string;
  post_id?: string;
  comment_id?: string;
  reaction_type: 'like' | 'love' | 'helpful' | 'insightful' | 'funny' | 'celebrate';
  created_at: string;
}

export interface CultureWallHashtag {
  id: string;
  tag: string;
  usage_count: number;
  category?: string;
  created_at: string;
}

export interface CultureWallSavedPost {
  id: string;
  user_id: string;
  post_id: string;
  collection_name?: string;
  created_at: string;
}

export interface CultureWallShare {
  id: string;
  user_id: string;
  post_id: string;
  shared_to: 'feed' | 'message' | 'external';
  message?: string;
  created_at: string;
}

export interface CultureWallReport {
  id: string;
  reporter_id: string;
  post_id?: string;
  comment_id?: string;
  reason: 'spam' | 'harassment' | 'inappropriate_content' | 'misinformation' | 'cultural_insensitivity' | 'fake_profile' | 'other';
  description?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  moderator_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

// Location Types
export interface UserLocation {
  id: string;
  user_id: string;
  location_type: 'home' | 'current' | 'work' | 'travel';
  is_primary: boolean;
  country: string;
  country_code: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  is_ofw: boolean;
  ofw_host_country?: string;
  ofw_home_country?: string;
  ofw_occupation?: string;
  ofw_visa_type?: string;
  ofw_return_date?: string;
  detected_from_ip?: string;
  ip_confidence?: number;
  manually_set: boolean;
  verified: boolean;
  verification_method?: 'ip' | 'gps' | 'manual' | 'document';
  verification_date?: string;
  created_at: string;
  updated_at: string;
}

export interface IPLocationHistory {
  id: string;
  user_id: string;
  ip_address: string;
  country?: string;
  country_code?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
  detected_at: string;
}

export interface LocationDetectionResult {
  country: string;
  country_code: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  timezone: string;
  confidence: number;
  has_existing_location?: boolean;
}

// Verification Types
export interface UserVerificationRequest {
  id: string;
  user_id: string;
  verification_type: 'photo' | 'id_document' | 'social_media' | 'video_selfie' | 'phone_camera';
  image_url: string;
  image_hash?: string;
  is_phone_camera: boolean;
  camera_metadata?: {
    device?: string;
    make?: string;
    model?: string;
    software?: string;
    date_time?: string;
    gps_latitude?: number;
    gps_longitude?: number;
  };
  capture_timestamp?: string;
  reverse_search_completed: boolean;
  reverse_search_results?: {
    google?: any[];
    tineye?: any[];
    pimeyes?: any[];
    total_matches: number;
  };
  found_on_platforms?: string[];
  is_stock_photo: boolean;
  is_celebrity: boolean;
  is_ai_generated: boolean;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  risk_factors?: string[];
  risk_score: number;
  status: 'pending' | 'processing' | 'verified' | 'rejected' | 'flagged';
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ImageMatchDetection {
  id: string;
  verification_request_id: string;
  platform: string;
  platform_category: 'social_media' | 'dating_app' | 'adult_content' | 'stock_photo' | 'ecommerce' | 'news' | 'other';
  match_url: string;
  profile_url?: string;
  profile_username?: string;
  similarity_score?: number;
  confidence?: number;
  detected_at: string;
}

export interface SocialMediaVerification {
  id: string;
  user_id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok';
  platform_user_id?: string;
  platform_username?: string;
  profile_url?: string;
  verification_method?: 'oauth' | 'manual' | 'api';
  account_creation_date?: string;
  followers_count?: number;
  posts_count?: number;
  profile_image_url?: string;
  verified: boolean;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

// Cultural Guidelines Types
export interface CulturalGuideline {
  id: string;
  country: string;
  region?: string;
  category: 'greetings' | 'dining' | 'dating' | 'family' | 'religion' | 'communication' | 'business' | 'public_behavior' | 'gifts' | 'taboos';
  guideline_type: 'do' | 'dont' | 'tip' | 'warning' | 'custom';
  title: string;
  description: string;
  importance_level?: 'critical' | 'important' | 'good_to_know' | 'optional';
  source: string;
  source_url?: string;
  last_updated?: string;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserCulturalInsights {
  id: string;
  user_id: string;
  home_country: string;
  current_country?: string;
  partner_country?: string;
  cultural_differences?: any;
  communication_tips?: any;
  dating_guidelines?: any;
  family_expectations?: any;
  last_generated: string;
}

export interface CulturalGuidelineFeedback {
  id: string;
  user_id: string;
  guideline_id: string;
  is_helpful: boolean;
  comment?: string;
  created_at: string;
}

export interface ContentModerationLog {
  id: string;
  post_id?: string;
  comment_id?: string;
  moderation_type: 'ai_auto' | 'manual_review' | 'user_report';
  inappropriate_content_score?: number;
  hate_speech_score?: number;
  spam_score?: number;
  cultural_insensitivity_score?: number;
  action_taken: 'approved' | 'flagged' | 'removed' | 'shadowban' | 'warning';
  moderator_id?: string;
  notes?: string;
  created_at: string;
}

// API Response Types
export interface CreatePostRequest {
  content: string;
  post_type: CultureWallPost['post_type'];
  media_urls?: string[];
  category?: CultureWallPost['category'];
  culture_tags?: string[];
  location_tags?: string[];
  hashtags?: string[];
  visibility?: CultureWallPost['visibility'];
}

export interface CreateCommentRequest {
  post_id: string;
  content: string;
  parent_comment_id?: string;
  media_url?: string;
}

export interface CreateReactionRequest {
  post_id?: string;
  comment_id?: string;
  reaction_type: CultureWallReaction['reaction_type'];
}

export interface ReportContentRequest {
  post_id?: string;
  comment_id?: string;
  reason: CultureWallReport['reason'];
  description?: string;
}

export interface VerificationStatusResponse {
  has_verification: boolean;
  status: UserVerificationRequest['status'];
  risk_level?: UserVerificationRequest['risk_level'];
  risk_score?: number;
  verified_at?: string;
  is_phone_camera?: boolean;
  found_on_platforms?: string[];
}
