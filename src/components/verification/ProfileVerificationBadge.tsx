import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, AlertTriangle, Info } from 'lucide-react';
import { useProfileVerification } from '../../hooks/useProfileVerification';

interface ProfileVerificationBadgeProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
  onClick?: () => void;
}

const ProfileVerificationBadge: React.FC<ProfileVerificationBadgeProps> = ({
  userId,
  size = 'md',
  showTooltip = true,
  className = '',
  onClick
}) => {
  const [isVerified, setIsVerified] = React.useState<boolean | null>(null);
  const [score, setScore] = React.useState<number>(0);
  const [isHovered, setIsHovered] = React.useState(false);
  
  const { isUserVerified, getUserVerificationScore } = useProfileVerification();
  
  React.useEffect(() => {
    const checkVerification = async () => {
      const verified = await isUserVerified(userId);
      setIsVerified(verified);
      
      if (verified) {
        const verificationScore = await getUserVerificationScore(userId);
        setScore(verificationScore);
      }
    };
    
    checkVerification();
  }, [userId, isUserVerified, getUserVerificationScore]);
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };
  
  if (isVerified === null) {
    return null; // Loading state
  }
  
  if (!isVerified) {
    return null; // Don't show badge for unverified profiles
  }
  
  return (
    <div 
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={`${getSizeClasses()} text-blue-600 cursor-pointer`}
      >
        <CheckCircle className="w-full h-full fill-blue-600 text-white" />
      </motion.div>
      
      {showTooltip && isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-white rounded-lg shadow-lg text-xs z-10"
        >
          <div className="text-center">
            <p className="font-medium text-gray-900 mb-1">Verified Profile</p>
            <div className="flex items-center justify-center mb-1">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>
            <p className="text-gray-600">
              {score >= 90 ? 'Highest verification level' :
               score >= 75 ? 'Strong verification' :
               'Basic verification'}
            </p>
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white"></div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfileVerificationBadge;