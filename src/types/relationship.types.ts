// Relationship Status Types

export type RelationshipStatus = 
  | 'single' 
  | 'talking' 
  | 'in_relationship' 
  | 'engaged' 
  | 'married' 
  | 'friends_only' 
  | 'recently_single';

export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface RelationshipStatusRecord {
  id: string;
  user_id: string;
  partner_id: string | null;
  status: RelationshipStatus;
  status_display_name: string | null;
  started_at: string;
  confirmed_by_partner: boolean;
  confirmed_at: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface RelationshipHistory {
  id: string;
  user_id: string;
  partner_id: string | null;
  previous_status: string | null;
  new_status: string;
  ended_at: string | null;
  ended_by: string | null;
  end_reason: string | null;
  breakup_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface RelationshipRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  requested_status: RelationshipStatus;
  message: string | null;
  status: RequestStatus;
  created_at: string;
  responded_at: string | null;
}

export interface RelationshipBadgeData {
  status: RelationshipStatus;
  statusDisplayName: string;
  partnerName?: string;
  partnerAvatar?: string;
  partnerId?: string;
  duration?: string;
  breakupDate?: string;
  isConfirmed: boolean;
}

export interface RelationshipStatusUpdate {
  status: RelationshipStatus;
  partner_id?: string | null;
  status_display_name?: string;
  is_public?: boolean;
}

export interface EndRelationshipData {
  breakup_date: string;
  end_reason?: string;
  notes?: string;
}

export interface RelationshipValidation {
  isValid: boolean;
  errors: string[];
  canSendGifts: boolean;
}
