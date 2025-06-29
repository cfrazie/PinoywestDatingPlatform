import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface VerificationPlatform {
  id: string;
  name: string;
  icon: string;
  urlPattern: string;
  active: boolean;
}

export interface VerificationReport {
  id: string;
  userId: string;
  targetUserId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  verificationResult?: 'verified' | 'suspicious' | 'unverifiable' | 'fake';
  confidenceScore?: number;
  reportSummary?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  verifiedBy?: string;
}

export interface VerificationEvidence {
  id: string;
  reportId: string;
  platformName: string;
  evidenceType: 'image_match' | 'profile_link' | 'username_match' | 'creation_date' | 'location_match' | 'inconsistency' | 'stock_photo';
  evidenceData: any;
  confidenceScore: number;
  isRedFlag: boolean;
  createdAt: string;
}

export interface VerificationStatus {
  id: string;
  userId: string;
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  verificationScore: number;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImageSearchResult {
  url: string;
  similarity: number;
  platform?: string;
  creationDate?: string;
  isStockPhoto?: boolean;
}

export interface ProfileReference {
  platform: string;
  username: string;
  url: string;
  creationDate?: string;
  bioSimilarity?: number;
  locationMatch?: boolean;
}

export interface VerificationRequest {
  targetUserId: string;
  profileImageUrl: string;
  username?: string;
  location?: string;
  bio?: string;
  socialProfiles?: Array<{
    platform: string;
    username: string;
  }>;
}

export interface VerificationResult {
  reportId: string;
  status: 'completed' | 'failed';
  verificationResult?: 'verified' | 'suspicious' | 'unverifiable' | 'fake';
  confidenceScore?: number;
  summary?: string;
  evidence?: VerificationEvidence[];
  redFlags?: number;
  completedAt?: string;
}

export const useProfileVerification = (userId?: string) => {
  const [platforms, setPlatforms] = useState<VerificationPlatform[]>([]);
  const [reports, setReports] = useState<VerificationReport[]>([]);
  const [userStatus, setUserStatus] = useState<VerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load verification platforms
  const loadPlatforms = useCallback(async () => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('verification_platforms')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      
      if (data) {
        setPlatforms(data.map(platform => ({
          id: platform.id,
          name: platform.name,
          icon: platform.icon,
          urlPattern: platform.url_pattern,
          active: platform.active
        })));
      }
    } catch (err) {
      console.error('Error loading verification platforms:', err);
    }
  }, []);

  // Load user verification reports
  const loadUserReports = useCallback(async () => {
    if (!supabase || !userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('verification_reports')
        .select('*')
        .or(`user_id.eq.${userId},target_user_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setReports(data.map(report => ({
          id: report.id,
          userId: report.user_id,
          targetUserId: report.target_user_id,
          status: report.status,
          verificationResult: report.verification_result,
          confidenceScore: report.confidence_score,
          reportSummary: report.report_summary,
          createdAt: report.created_at,
          updatedAt: report.updated_at,
          completedAt: report.completed_at,
          verifiedBy: report.verified_by
        })));
      }
    } catch (err) {
      console.error('Error loading verification reports:', err);
      setError('Failed to load verification reports');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load user verification status
  const loadUserStatus = useCallback(async () => {
    if (!supabase || !userId) return;
    
    try {
      const { data, error } = await supabase
        .from('verification_statuses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }
      
      if (data) {
        setUserStatus({
          id: data.id,
          userId: data.user_id,
          status: data.status,
          verificationScore: data.verification_score,
          verifiedAt: data.verified_at,
          verifiedBy: data.verified_by,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        });
      } else {
        setUserStatus(null);
      }
    } catch (err) {
      console.error('Error loading verification status:', err);
    }
  }, [userId]);

  // Create verification report
  const createVerificationReport = useCallback(async (request: VerificationRequest): Promise<string | null> => {
    if (!supabase || !userId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create report
      const { data: reportData, error: reportError } = await supabase
        .from('verification_reports')
        .insert({
          user_id: userId,
          target_user_id: request.targetUserId,
          status: 'pending'
        })
        .select()
        .single();
      
      if (reportError) throw reportError;
      
      if (!reportData) {
        throw new Error('Failed to create verification report');
      }
      
      const reportId = reportData.id;
      
      // In a real implementation, this would trigger a serverless function to:
      // 1. Perform reverse image search
      // 2. Cross-reference profile information
      // 3. Add evidence to the report
      // 4. Generate the final report
      
      // For demo purposes, we'll simulate this process with a delay
      setTimeout(async () => {
        try {
          // Simulate adding evidence
          const evidenceItems = [
            {
              report_id: reportId,
              platform_name: 'Google Images',
              evidence_type: 'image_match',
              evidence_data: {
                matches: [
                  {
                    url: 'https://example.com/profile1',
                    similarity: 0.95,
                    platform: 'Facebook',
                    creation_date: '2023-01-15T00:00:00Z'
                  }
                ],
                is_stock_photo: false
              },
              confidence_score: 0.92,
              is_red_flag: false
            },
            {
              report_id: reportId,
              platform_name: 'Social Media',
              evidence_type: 'username_match',
              evidence_data: {
                username: request.username,
                matches: [
                  {
                    platform: 'Twitter',
                    username: request.username,
                    url: `https://twitter.com/${request.username}`,
                    creation_date: '2022-05-10T00:00:00Z',
                    bio_similarity: 0.78,
                    location_match: true
                  }
                ]
              },
              confidence_score: 0.85,
              is_red_flag: false
            }
          ];
          
          // Add evidence
          for (const item of evidenceItems) {
            await supabase
              .from('verification_evidence')
              .insert(item);
          }
          
          // Generate report
          await supabase
            .rpc('generate_verification_report', {
              p_report_id: reportId
            });
          
          // Refresh reports
          loadUserReports();
        } catch (err) {
          console.error('Error in verification process:', err);
        }
      }, 3000);
      
      return reportId;
    } catch (err) {
      console.error('Error creating verification report:', err);
      setError('Failed to create verification report');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, loadUserReports]);

  // Get verification report details
  const getVerificationReport = useCallback(async (reportId: string): Promise<VerificationResult | null> => {
    if (!supabase) return null;
    
    try {
      // Get report
      const { data: report, error: reportError } = await supabase
        .from('verification_reports')
        .select('*')
        .eq('id', reportId)
        .single();
      
      if (reportError) throw reportError;
      
      // Get evidence
      const { data: evidence, error: evidenceError } = await supabase
        .from('verification_evidence')
        .select('*')
        .eq('report_id', reportId);
      
      if (evidenceError) throw evidenceError;
      
      return {
        reportId,
        status: report.status,
        verificationResult: report.verification_result,
        confidenceScore: report.confidence_score,
        summary: report.report_summary,
        evidence: evidence?.map(item => ({
          id: item.id,
          reportId: item.report_id,
          platformName: item.platform_name,
          evidenceType: item.evidence_type,
          evidenceData: item.evidence_data,
          confidenceScore: item.confidence_score,
          isRedFlag: item.is_red_flag,
          createdAt: item.created_at
        })),
        redFlags: evidence?.filter(item => item.is_red_flag).length || 0,
        completedAt: report.completed_at
      };
    } catch (err) {
      console.error('Error getting verification report:', err);
      return null;
    }
  }, []);

  // Verify user's own profile
  const verifyOwnProfile = useCallback(async (profileImageUrl: string, socialProfiles?: Array<{platform: string; username: string}>): Promise<string | null> => {
    if (!supabase || !userId) return null;
    
    return createVerificationReport({
      targetUserId: userId, // Self-verification
      profileImageUrl,
      socialProfiles
    });
  }, [userId, createVerificationReport]);

  // Check if a user is verified
  const isUserVerified = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!supabase) return false;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('verification_status')
        .eq('user_id', targetUserId)
        .single();
      
      if (error) throw error;
      
      return data?.verification_status === 'verified';
    } catch (err) {
      console.error('Error checking user verification:', err);
      return false;
    }
  }, []);

  // Get user verification score
  const getUserVerificationScore = useCallback(async (targetUserId: string): Promise<number> => {
    if (!supabase) return 0;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('verification_score')
        .eq('user_id', targetUserId)
        .single();
      
      if (error) throw error;
      
      return data?.verification_score || 0;
    } catch (err) {
      console.error('Error getting user verification score:', err);
      return 0;
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadPlatforms();
    if (userId) {
      loadUserReports();
      loadUserStatus();
    }
  }, [loadPlatforms, loadUserReports, loadUserStatus, userId]);

  return {
    platforms,
    reports,
    userStatus,
    isLoading,
    error,
    createVerificationReport,
    getVerificationReport,
    verifyOwnProfile,
    isUserVerified,
    getUserVerificationScore,
    refreshReports: loadUserReports,
    refreshStatus: loadUserStatus
  };
};