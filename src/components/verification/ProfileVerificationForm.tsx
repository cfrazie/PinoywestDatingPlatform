import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Search, Image, User, MapPin, 
  Link, Facebook, Twitter, Instagram, Linkedin, 
  Plus, Trash2, Upload, X, Info, Check
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useProfileVerification } from '../../hooks/useProfileVerification';

interface SocialProfile {
  platform: string;
  username: string;
}

interface ProfileVerificationFormProps {
  userId: string;
  targetUserId: string;
  onComplete: (reportId: string) => void;
  onCancel?: () => void;
}

const ProfileVerificationForm: React.FC<ProfileVerificationFormProps> = ({
  userId,
  targetUserId,
  onComplete,
  onCancel
}) => {
  const [step, setStep] = useState(1);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [socialProfiles, setSocialProfiles] = useState<SocialProfile[]>([]);
  const [newPlatform, setNewPlatform] = useState('Facebook');
  const [newUsername, setNewUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createVerificationReport } = useProfileVerification(userId);

  const handleAddSocialProfile = () => {
    if (!newPlatform || !newUsername) return;
    
    setSocialProfiles([...socialProfiles, { platform: newPlatform, username: newUsername }]);
    setNewPlatform('Facebook');
    setNewUsername('');
  };

  const handleRemoveSocialProfile = (index: number) => {
    setSocialProfiles(socialProfiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const reportId = await createVerificationReport({
        targetUserId,
        profileImageUrl,
        username,
        location,
        bio,
        socialProfiles
      });
      
      if (reportId) {
        onComplete(reportId);
      } else {
        throw new Error('Failed to create verification report');
      }
    } catch (err) {
      console.error('Error submitting verification request:', err);
      setError('Failed to submit verification request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepComplete = () => {
    switch (step) {
      case 1:
        return !!profileImageUrl;
      case 2:
        return true; // Optional information
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Image</h3>
            <p className="text-gray-600 mb-6">
              Enter the URL of the profile image you want to verify. This will be used for reverse image search.
            </p>
            
            <div className="mb-6">
              <Input
                label="Profile Image URL"
                type="url"
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                placeholder="https://example.com/profile-image.jpg"
                icon={<Image className="w-4 h-4 text-gray-400" />}
                required
              />
              
              {profileImageUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-200">
                    <img 
                      src={profileImageUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Why we need this</h4>
                  <p className="text-sm text-blue-700">
                    We'll perform a reverse image search to check if this image appears elsewhere online,
                    which helps verify the authenticity of the profile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            <p className="text-gray-600 mb-6">
              Enter additional profile information to help with verification. This information will be cross-referenced across platforms.
            </p>
            
            <div className="space-y-4 mb-6">
              <Input
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., john.smith123"
                icon={<User className="w-4 h-4 text-gray-400" />}
              />
              
              <Input
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York, USA"
                icon={<MapPin className="w-4 h-4 text-gray-400" />}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio/About
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Enter profile bio or about section"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Social Media Profiles</h4>
              
              <div className="space-y-3 mb-4">
                {socialProfiles.map((profile, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center flex-1">
                      {profile.platform === 'Facebook' && <Facebook className="w-4 h-4 text-blue-600 mr-2" />}
                      {profile.platform === 'Twitter' && <Twitter className="w-4 h-4 text-blue-400 mr-2" />}
                      {profile.platform === 'Instagram' && <Instagram className="w-4 h-4 text-pink-600 mr-2" />}
                      {profile.platform === 'LinkedIn' && <Linkedin className="w-4 h-4 text-blue-700 mr-2" />}
                      <div>
                        <div className="font-medium text-gray-900">{profile.platform}</div>
                        <div className="text-sm text-gray-500">{profile.username}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSocialProfile(index)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2 mb-3">
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Facebook">Facebook</option>
                  <option value="Twitter">Twitter</option>
                  <option value="Instagram">Instagram</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>
                
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Username"
                  className="flex-2"
                />
                
                <Button
                  variant="outline"
                  onClick={handleAddSocialProfile}
                  disabled={!newPlatform || !newUsername}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-xs text-gray-500">
                Add social media profiles to improve verification accuracy.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Why we need this</h4>
                  <p className="text-sm text-blue-700">
                    This information helps us cross-reference the profile across multiple platforms
                    to verify consistency and authenticity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Profile Verification Request</h2>
          {onCancel && (
            <button 
              onClick={onCancel}
              className="text-white hover:text-blue-100"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Verify profile authenticity and detect potential fake accounts</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div 
            className={`flex items-center cursor-pointer ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}
            onClick={() => step > 1 && setStep(1)}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
              step >= 1 ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Image className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Image</span>
          </div>
          
          <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
          
          <div 
            className={`flex items-center cursor-pointer ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}
            onClick={() => step > 2 && setStep(2)}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
              step >= 2 ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Profile</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {renderStepContent()}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700">
              <AlertTriangle className="w-4 h-4 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onCancel || (() => setStep(Math.max(1, step - 1)))}
            disabled={isSubmitting}
          >
            {step === 1 && onCancel ? 'Cancel' : 'Back'}
          </Button>
          
          <Button
            onClick={() => {
              if (step < 2) {
                setStep(step + 1);
              } else {
                handleSubmit();
              }
            }}
            disabled={!isStepComplete() || isSubmitting}
            loading={isSubmitting}
          >
            {step < 2 ? 'Next' : 'Submit Verification Request'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileVerificationForm;