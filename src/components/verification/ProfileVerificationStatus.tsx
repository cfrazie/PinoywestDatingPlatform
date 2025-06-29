import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, CheckCircle, AlertTriangle, 
  Clock, Info, ExternalLink
} from 'lucide-react';
import Button from '../ui/Button';
import { VerificationStatus } from '../../hooks/useProfileVerification';

interface ProfileVerificationStatusProps {
  status: VerificationStatus | null;
  isOwnProfile?: boolean;
  onVerify?: () => void;
  onViewReport?: () => void;
  className?: string;
}

const ProfileVerificationStatus: React.FC<ProfileVerificationStatusProps> = ({
  status,
  isOwnProfile = false,
  onVerify,
  onViewReport,
  className = ''
}) => {
  const getStatusColor = () => {
    if (!status) return 'bg-gray-100 text-gray-600';
    
    switch (status.status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = () => {
    if (!status) return <Shield className="w-5 h-5 text-gray-500" />;
    
    switch (status.status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (!status) return 'Unverified Profile';
    
    switch (status.status) {
      case 'verified':
        return 'Verified Profile';
      case 'pending':
        return 'Verification Pending';
      case 'rejected':
        return 'Verification Failed';
      default:
        return 'Unverified Profile';
    }
  };

  const getStatusDescription = () => {
    if (!status) {
      return isOwnProfile 
        ? 'Your profile has not been verified. Verify your profile to build trust with potential matches.'
        : 'This profile has not been verified.';
    }
    
    switch (status.status) {
      case 'verified':
        return isOwnProfile
          ? 'Your profile has been verified. This helps build trust with potential matches.'
          : 'This profile has been verified for authenticity.';
      case 'pending':
        return 'Verification is in progress. This usually takes 24-48 hours.';
      case 'rejected':
        return isOwnProfile
          ? 'Your profile verification was unsuccessful. Please review and try again.'
          : 'This profile failed verification checks.';
      default:
        return isOwnProfile
          ? 'Your profile has not been verified. Verify your profile to build trust with potential matches.'
          : 'This profile has not been verified.';
    }
  };

  return (
    <div className={`rounded-lg overflow-hidden border ${className} ${
      status?.status === 'verified' ? 'border-green-200' :
      status?.status === 'pending' ? 'border-yellow-200' :
      status?.status === 'rejected' ? 'border-red-200' :
      'border-gray-200'
    }`}>
      <div className={`p-4 ${getStatusColor()}`}>
        <div className="flex items-center">
          {getStatusIcon()}
          <h3 className="font-medium ml-2">{getStatusText()}</h3>
          
          {status?.status === 'verified' && (
            <div className="ml-auto text-sm bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
              {status.verificationScore.toFixed(0)}% score
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-4">
          {getStatusDescription()}
        </p>
        
        {isOwnProfile && !status?.status && (
          <Button
            variant="primary"
            size="sm"
            onClick={onVerify}
            className="w-full"
          >
            <Shield className="w-4 h-4 mr-2" />
            Verify My Profile
          </Button>
        )}
        
        {isOwnProfile && status?.status === 'rejected' && (
          <Button
            variant="primary"
            size="sm"
            onClick={onVerify}
            className="w-full"
          >
            <Shield className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        
        {!isOwnProfile && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewReport}
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Verification Report
          </Button>
        )}
        
        {isOwnProfile && status?.status === 'verified' && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewReport}
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View My Verification
          </Button>
        )}
        
        {isOwnProfile && status?.status === 'pending' && (
          <div className="text-center text-sm text-yellow-600">
            <Clock className="w-4 h-4 inline mr-1" />
            Verification in progress...
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileVerificationStatus;