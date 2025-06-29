import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, MessageCircle, MapPin, Calendar, 
  Star, Globe, Languages, User, Shield
} from 'lucide-react';
import Button from '../ui/Button';
import OptimizedImage from '../ui/OptimizedImage';
import ProfileVerificationBadge from '../verification/ProfileVerificationBadge';
import VerificationRequestButton from '../verification/VerificationRequestButton';
import CompatibilityScore from '../compatibility/CompatibilityScore';

interface UserProfileCardProps {
  userId: string;
  name: string;
  age: number;
  location: string;
  bio?: string;
  photoUrl: string;
  isVerified?: boolean;
  isOnline?: boolean;
  lastActive?: string;
  compatibilityScore?: number;
  onViewProfile?: () => void;
  onSendMessage?: () => void;
  onLike?: () => void;
  onVerify?: () => void;
  className?: string;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  userId,
  name,
  age,
  location,
  bio,
  photoUrl,
  isVerified = false,
  isOnline = false,
  lastActive,
  compatibilityScore,
  onViewProfile,
  onSendMessage,
  onLike,
  onVerify,
  className = ''
}) => {
  const formatLastActive = () => {
    if (isOnline) return 'Online now';
    if (!lastActive) return 'Recently active';
    
    const date = new Date(lastActive);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {/* Profile Image */}
      <div className="relative">
        <OptimizedImage
          src={photoUrl}
          alt={name}
          className="w-full h-64 object-cover"
          width={400}
          height={300}
        />
        
        {/* Status Indicators */}
        <div className="absolute top-4 left-4 flex space-x-2">
          {isVerified && (
            <ProfileVerificationBadge
              userId={userId}
              size="sm"
              showTooltip={false}
            />
          )}
          
          {isOnline && (
            <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
              Online Now
            </div>
          )}
        </div>
        
        {/* Compatibility Score */}
        {compatibilityScore && (
          <div className="absolute bottom-4 left-4">
            <CompatibilityScore score={compatibilityScore} size="sm" />
          </div>
        )}
      </div>
      
      {/* Profile Info */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">{name}, {age}</h3>
          <div className="text-sm text-gray-500">
            {formatLastActive()}
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{location}</span>
        </div>
        
        {bio && (
          <p className="text-gray-700 mb-6 line-clamp-2">{bio}</p>
        )}
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="primary"
            onClick={onLike}
          >
            <Heart className="w-4 h-4 mr-2" />
            Like
          </Button>
          
          <Button
            variant="outline"
            onClick={onSendMessage}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
          
          <VerificationRequestButton
            userId="current_user"
            targetUserId={userId}
            targetUserName={name}
            isVerified={isVerified}
            variant="ghost"
            size="sm"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfileCard;