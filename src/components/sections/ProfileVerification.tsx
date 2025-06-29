import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Camera, CheckCircle, Star, Users, Award,
  Search, Image, User, MapPin, Link, AlertCircle
} from 'lucide-react';
import Button from '../ui/Button';
import VideoVerification from '../verification/VideoVerification';
import ProfileVerificationForm from '../verification/ProfileVerificationForm';
import ProfileVerificationReport from '../verification/ProfileVerificationReport';
import { VerificationResults } from '../verification/VideoVerification';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

const ProfileVerification: React.FC = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver();
  const [showVerification, setShowVerification] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationResults, setVerificationResults] = useState<VerificationResults | null>(null);
  const [showProfileVerification, setShowProfileVerification] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const handleVerificationComplete = (results: VerificationResults) => {
    setVerificationResults(results);
    setVerificationComplete(true);
    setShowVerification(false);
  };

  const handleProfileVerificationComplete = (newReportId: string) => {
    setReportId(newReportId);
    setShowProfileVerification(false);
    setShowReport(true);
  };

  const benefits = [
    {
      icon: Shield,
      title: 'Enhanced Trust',
      description: 'Verified profiles receive 3x more matches and messages'
    },
    {
      icon: Search,
      title: 'Cross-Platform Analysis',
      description: 'We check your photos and info across multiple platforms'
    },
    {
      icon: Star,
      title: 'Priority Visibility',
      description: 'Appear first in search results and recommendations'
    },
    {
      icon: Award,
      title: 'Verified Badge',
      description: 'Display the coveted blue checkmark on your profile'
    },
    {
      step: 1,
      title: 'Live Video Recording',
      description: 'Record a short video following our guided prompts'
    },
    {
      icon: Users,
      title: 'Quality Matches',
      description: 'Connect with other verified, serious relationship seekers'
    }
  ];

  return (
    <section ref={elementRef} className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex p-3 bg-blue-100 rounded-full mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Profile Verification
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our multi-layered verification system ensures authenticity and builds trust
            through advanced image analysis and cross-platform verification.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isIntersecting ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Verification Methods
              </h3>
              <div className="grid grid-cols-1 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Search className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Social Media Verification</h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Our system performs reverse image searches and cross-references your profile information
                    across multiple platforms to verify authenticity.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProfileVerification(true)}
                    className="w-full"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Start Social Media Verification
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Camera className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Video Verification</h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Complete a short video verification process to confirm your identity
                    and prove you're a real person.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVerification(true)}
                    className="w-full"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start Video Verification
                  </Button>
                </motion.div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Benefits of Verification
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {benefits.slice(0, 4).map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    className="bg-white p-6 rounded-xl shadow-lg"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <benefit.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                    </div>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Verification status */}
            {verificationComplete && verificationResults ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl border-2 ${
                  verificationResults.isVerified 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  {verificationResults.isVerified ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <Shield className="w-8 h-8 text-yellow-600" />
                  )}
                  <div>
                    <h4 className={`font-bold ${
                      verificationResults.isVerified ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      {verificationResults.isVerified ? 'Verification Complete!' : 'Verification Pending'}
                    </h4>
                    <p className={`text-sm ${
                      verificationResults.isVerified ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      Score: {verificationResults.overallScore}%
                    </p>
                  </div>
                </div>
                <p className={`text-sm ${
                  verificationResults.isVerified ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {verificationResults.isVerified 
                    ? 'Your profile is now verified and will display the verification badge.'
                    : 'Your verification is being reviewed. You may retry if needed.'
                  }
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl text-white"
              >
                <h3 className="text-xl font-bold mb-4">Get Verified Today</h3>
                <p className="text-blue-100 mb-6">
                  Verified profiles receive 3x more matches and build trust with potential partners.
                  Choose your preferred verification method to get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    className="bg-white text-blue-600 hover:bg-gray-100 flex-1"
                    onClick={() => setShowProfileVerification(true)}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Social Media Verification
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white text-purple-600 hover:bg-gray-100 flex-1"
                    onClick={() => setShowVerification(true)}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Video Verification
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Process steps */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isIntersecting ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Verification Process
            </h3>
            
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Reverse Image Search</h4>
                  <p className="text-gray-600">We search for your profile photo across Google Images, TinEye, Yandex, and Bing to verify authenticity.</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Social Media Cross-Reference</h4>
                  <p className="text-gray-600">We check for consistent usernames, profile details, and creation dates across major platforms.</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Comprehensive Analysis</h4>
                  <p className="text-gray-600">Our system analyzes all evidence to generate a detailed verification report with confidence score.</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Verification Badge</h4>
                  <p className="text-gray-600">Verified profiles receive a blue checkmark badge and improved visibility in search results.</p>
                </div>
              </motion.div>
            </div>

            {/* Security features */}
            <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
              <h4 className="font-semibold text-gray-900 mb-4">Security Features</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Real-time liveness detection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Cross-platform identity verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Stock photo detection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Profile consistency analysis</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isIntersecting ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 bg-white rounded-2xl p-8 shadow-lg"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">98.5%</div>
              <div className="text-gray-600">Verification Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">5+</div>
              <div className="text-gray-600">Verification Methods</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">25K+</div>
              <div className="text-gray-600">Verified Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600 mb-2">3x</div>
              <div className="text-gray-600">More Matches</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Video Verification Modal */}
      {showVerification && (
        <VideoVerification
          onComplete={handleVerificationComplete}
          onCancel={() => setShowVerification(false)}
        />
      )}
      
      {/* Profile Verification Modal */}
      {showProfileVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ProfileVerificationForm
              userId="current_user"
              targetUserId="current_user"
              onComplete={handleProfileVerificationComplete}
              onCancel={() => setShowProfileVerification(false)}
            />
          </div>
        </div>
      )}
      
      {/* Verification Report Modal */}
      {showReport && reportId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ProfileVerificationReport
              reportId={reportId}
              onClose={() => setShowReport(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default ProfileVerification;