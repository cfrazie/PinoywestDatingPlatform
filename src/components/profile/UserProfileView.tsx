import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, MessageCircle, MapPin, Calendar, 
  Star, Globe, Languages, User, Image,
  Cake, Briefcase, GraduationCap, Music,
  Film, Book, Coffee, Utensils, Activity,
  X, ChevronLeft, ChevronRight, Shield
} from 'lucide-react';
import Button from '../ui/Button';
import OptimizedImage from '../ui/OptimizedImage';
import ProfileVerificationBadge from '../verification/ProfileVerificationBadge';
import VerificationRequestButton from '../verification/VerificationRequestButton';
import CompatibilityScore from '../compatibility/CompatibilityScore';
import CompatibilityInsights from '../compatibility/CompatibilityInsights';

interface UserProfileViewProps {
  userId: string;
  currentUserId: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  photos: string[];
  isVerified: boolean;
  isOnline: boolean;
  lastActive: string;
  compatibilityScore?: number;
  details: {
    height?: string;
    bodyType?: string;
    ethnicity?: string;
    religion?: string;
    education?: string;
    occupation?: string;
    languages: string[];
    interests: string[];
    lookingFor: string;
  };
  onClose?: () => void;
  onSendMessage?: () => void;
  onLike?: () => void;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({
  userId,
  currentUserId,
  name,
  age,
  location,
  bio,
  photos,
  isVerified,
  isOnline,
  lastActive,
  compatibilityScore,
  details,
  onClose,
  onSendMessage,
  onLike
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  const formatLastActive = () => {
    if (isOnline) return 'Online now';
    
    const date = new Date(lastActive);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `Active ${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `Active ${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
      return 'Active yesterday';
    } else if (diffInDays < 7) {
      return `Active ${diffInDays} days ago`;
    } else {
      return `Active on ${date.toLocaleDateString()}`;
    }
  };
  
  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };
  
  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-4xl mx-auto">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      
      <div className="flex flex-col md:flex-row">
        {/* Photos Section */}
        <div className="md:w-1/2 relative">
          <div className="relative h-96 md:h-full">
            <OptimizedImage
              src={photos[currentPhotoIndex]}
              alt={`${name}'s photo ${currentPhotoIndex + 1}`}
              className="w-full h-full object-cover"
              width={600}
              height={800}
            />
            
            {/* Photo navigation */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {/* Photo indicators */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* Status Indicators */}
            <div className="absolute top-4 left-4 flex space-x-2">
              {isVerified && (
                <ProfileVerificationBadge
                  userId={userId}
                  size="md"
                />
              )}
              
              {isOnline && (
                <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                  Online Now
                </div>
              )}
            </div>
            
            {/* Photo count */}
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
              {currentPhotoIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
        
        {/* Profile Info Section */}
        <div className="md:w-1/2 p-6 overflow-y-auto max-h-[80vh]">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{name}, {age}</h1>
              {compatibilityScore && (
                <CompatibilityScore score={compatibilityScore} />
              )}
            </div>
            
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{location}</span>
            </div>
            
            <div className="text-sm text-gray-500 mb-4">
              {formatLastActive()}
            </div>
            
            <p className="text-gray-700 mb-6">{bio}</p>
            
            {/* Action Buttons */}
            <div className="flex space-x-3 mb-6">
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
                userId={currentUserId}
                targetUserId={userId}
                targetUserName={name}
                isVerified={isVerified}
                variant="ghost"
                size="sm"
              />
            </div>
          </div>
          
          {/* Compatibility Insights */}
          {compatibilityScore && (
            <div className="mb-6">
              <CompatibilityInsights
                userId={currentUserId}
                targetUserId={userId}
                userName="You"
                targetUserName={name}
              />
            </div>
          )}
          
          {/* Profile Details */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About {name.split(' ')[0]}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {details.height && (
                <div className="flex items-center text-gray-700">
                  <User className="w-4 h-4 text-gray-400 mr-2" />
                  <span>Height: {details.height}</span>
                </div>
              )}
              
              {details.bodyType && (
                <div className="flex items-center text-gray-700">
                  <User className="w-4 h-4 text-gray-400 mr-2" />
                  <span>Body Type: {details.bodyType}</span>
                </div>
              )}
              
              {details.ethnicity && (
                <div className="flex items-center text-gray-700">
                  <Globe className="w-4 h-4 text-gray-400 mr-2" />
                  <span>Ethnicity: {details.ethnicity}</span>
                </div>
              )}
              
              {details.religion && (
                <div className="flex items-center text-gray-700">
                  <Star className="w-4 h-4 text-gray-400 mr-2" />
                  <span>Religion: {details.religion}</span>
                </div>
              )}
              
              {details.education && (
                <div className="flex items-center text-gray-700">
                  <GraduationCap className="w-4 h-4 text-gray-400 mr-2" />
                  <span>Education: {details.education}</span>
                </div>
              )}
              
              {details.occupation && (
                <div className="flex items-center text-gray-700">
                  <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
                  <span>Occupation: {details.occupation}</span>
                </div>
              )}
              
              <div className="flex items-center text-gray-700">
                <Heart className="w-4 h-4 text-gray-400 mr-2" />
                <span>Looking for: {details.lookingFor}</span>
              </div>
            </div>
          </div>
          
          {/* Languages */}
          {details.languages.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Languages</h2>
              <div className="flex flex-wrap gap-2">
                {details.languages.map((language, index) => (
                  <div key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {language}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Interests */}
          {details.interests.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {details.interests.map((interest, index) => (
                  <div key={index} className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-sm">
                    {interest}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Verification Status */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Verification Status</h2>
            <div className={`p-4 rounded-lg ${isVerified ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center">
                {isVerified ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <h3 className="font-medium text-green-800">Verified Profile</h3>
                      <p className="text-sm text-green-700">This profile has been verified for authenticity.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 text-gray-500 mr-2" />
                    <div>
                      <h3 className="font-medium text-gray-800">Unverified Profile</h3>
                      <p className="text-sm text-gray-600">This profile has not been verified yet.</p>
                    </div>
                  </>
                )}
              </div>
              
              {!isVerified && (
                <div className="mt-3">
                  <VerificationRequestButton
                    userId={currentUserId}
                    targetUserId={userId}
                    targetUserName={name}
                    isVerified={isVerified}
                    size="sm"
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;