import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import ProfileVerificationModal from './ProfileVerificationModal';
import ProfileVerificationBadge from './ProfileVerificationBadge';
import { useProfileVerification } from '../../hooks/useProfileVerification';

interface VerificationRequestButtonProps {
  userId: string;
  targetUserId: string;
  targetUserName: string;
  isVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost';
  className?: string;
}

const VerificationRequestButton: React.FC<VerificationRequestButtonProps> = ({
  userId,
  targetUserId,
  targetUserName,
  isVerified,
  size = 'md',
  variant = 'outline',
  className = ''
}) => {
  const [showModal, setShowModal] = useState(false);
  const [hasCheckedVerification, setHasCheckedVerification] = useState(false);
  const [userVerified, setUserVerified] = useState(isVerified);
  
  const { isUserVerified } = useProfileVerification(userId);
  
  // Check verification status if not provided
  React.useEffect(() => {
    if (isVerified === undefined && !hasCheckedVerification) {
      const checkVerification = async () => {
        const verified = await isUserVerified(targetUserId);
        setUserVerified(verified);
        setHasCheckedVerification(true);
      };
      
      checkVerification();
    }
  }, [isVerified, targetUserId, isUserVerified, hasCheckedVerification]);
  
  return (
    <>
      <div className="flex items-center">
        {userVerified && (
          <ProfileVerificationBadge
            userId={targetUserId}
            size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
            className="mr-2"
            onClick={() => setShowModal(true)}
          />
        )}
        
        <Button
          variant={variant}
          size={size}
          onClick={() => setShowModal(true)}
          className={className}
        >
          <Shield className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} mr-2`} />
          {userVerified ? 'View Verification' : 'Verify Profile'}
        </Button>
      </div>
      
      {showModal && (
        <ProfileVerificationModal
          userId={userId}
          targetUserId={targetUserId}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default VerificationRequestButton;