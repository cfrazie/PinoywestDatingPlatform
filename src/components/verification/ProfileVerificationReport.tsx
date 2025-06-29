import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Search, AlertTriangle, CheckCircle, 
  Image, User, MapPin, Calendar, Link, ExternalLink,
  Clock, Info, X, RefreshCw, Download, Copy, 
  Facebook, Twitter, Instagram, Linkedin, Globe
} from 'lucide-react';
import Button from '../ui/Button';
import OptimizedImage from '../ui/OptimizedImage';
import { 
  useProfileVerification,
  VerificationResult,
  VerificationEvidence
} from '../../hooks/useProfileVerification';

interface ProfileVerificationReportProps {
  reportId: string;
  onClose?: () => void;
}

const ProfileVerificationReport: React.FC<ProfileVerificationReportProps> = ({
  reportId,
  onClose
}) => {
  const [report, setReport] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'evidence' | 'recommendations'>('summary');
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null);

  const { getVerificationReport } = useProfileVerification();

  useEffect(() => {
    const loadReport = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await getVerificationReport(reportId);
        setReport(result);
      } catch (err) {
        console.error('Error loading verification report:', err);
        setError('Failed to load verification report');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReport();
  }, [reportId, getVerificationReport]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-100';
      case 'suspicious':
        return 'text-yellow-600 bg-yellow-100';
      case 'unverifiable':
        return 'text-blue-600 bg-blue-100';
      case 'fake':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'suspicious':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'unverifiable':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'fake':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const getEvidenceTypeIcon = (type: string) => {
    switch (type) {
      case 'image_match':
        return <Image className="w-4 h-4" />;
      case 'profile_link':
        return <Link className="w-4 h-4" />;
      case 'username_match':
        return <User className="w-4 h-4" />;
      case 'creation_date':
        return <Calendar className="w-4 h-4" />;
      case 'location_match':
        return <MapPin className="w-4 h-4" />;
      case 'inconsistency':
        return <AlertTriangle className="w-4 h-4" />;
      case 'stock_photo':
        return <Image className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <Facebook className="w-4 h-4" />;
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'google images':
        return <Search className="w-4 h-4" />;
      case 'tineye':
        return <Search className="w-4 h-4" />;
      case 'yandex images':
        return <Search className="w-4 h-4" />;
      case 'bing visual search':
        return <Search className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getEvidenceTitle = (evidence: VerificationEvidence) => {
    switch (evidence.evidenceType) {
      case 'image_match':
        return 'Image Match Analysis';
      case 'profile_link':
        return 'Profile Link Verification';
      case 'username_match':
        return 'Username Consistency Check';
      case 'creation_date':
        return 'Account Creation Timeline';
      case 'location_match':
        return 'Location Consistency';
      case 'inconsistency':
        return 'Profile Inconsistency';
      case 'stock_photo':
        return 'Stock Photo Detection';
      default:
        return 'Verification Evidence';
    }
  };

  const renderEvidenceContent = (evidence: VerificationEvidence) => {
    switch (evidence.evidenceType) {
      case 'image_match':
        return (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Reverse Image Search Results</h4>
            {evidence.evidenceData.matches && evidence.evidenceData.matches.length > 0 ? (
              <div className="space-y-3">
                {evidence.evidenceData.matches.map((match: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {getPlatformIcon(match.platform)}
                        <span className="ml-2 font-medium">{match.platform}</span>
                      </div>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {(match.similarity * 100).toFixed(0)}% match
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <Link className="w-3 h-3 mr-1" />
                        <a 
                          href={match.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {match.url}
                        </a>
                      </div>
                      {match.creation_date && (
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>Created: {new Date(match.creation_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No image matches found.</p>
            )}
            
            {evidence.evidenceData.is_stock_photo && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-700">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span className="font-medium">Stock photo detected</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  This image appears to be a stock photo, which is often used in fake profiles.
                </p>
              </div>
            )}
          </div>
        );
      
      case 'username_match':
        return (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Username Consistency Analysis</h4>
            {evidence.evidenceData.matches && evidence.evidenceData.matches.length > 0 ? (
              <div className="space-y-3">
                {evidence.evidenceData.matches.map((match: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {getPlatformIcon(match.platform)}
                        <span className="ml-2 font-medium">{match.platform}</span>
                      </div>
                      {match.bio_similarity && (
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {(match.bio_similarity * 100).toFixed(0)}% bio match
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        <span>Username: {match.username}</span>
                      </div>
                      <div className="flex items-center">
                        <Link className="w-3 h-3 mr-1" />
                        <a 
                          href={match.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {match.url}
                        </a>
                      </div>
                      {match.creation_date && (
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>Created: {new Date(match.creation_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {match.location_match !== undefined && (
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>
                            Location: {match.location_match ? 'Matches profile' : 'Different from profile'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No username matches found across platforms.</p>
            )}
          </div>
        );
      
      default:
        return (
          <div className="text-gray-600">
            <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto">
              {JSON.stringify(evidence.evidenceData, null, 2)}
            </pre>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <h2 className="text-xl font-bold">Profile Verification Report</h2>
        </div>
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading verification report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <h2 className="text-xl font-bold">Profile Verification Report</h2>
        </div>
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Report Error</h3>
            <p className="text-gray-600 mb-4">{error || 'Failed to load verification report'}</p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Profile Verification Report</h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-white hover:text-blue-100"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.verificationResult || 'unverifiable')}`}>
            <div className="flex items-center">
              {getStatusIcon(report.verificationResult || 'unverifiable')}
              <span className="ml-1 capitalize">{report.verificationResult || 'Unverifiable'}</span>
            </div>
          </div>
          
          <div className="text-sm text-blue-100">
            <Clock className="w-4 h-4 inline mr-1" />
            {formatDate(report.completedAt)}
          </div>
          
          {report.confidenceScore !== undefined && (
            <div className="text-sm bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
              {(report.confidenceScore * 100).toFixed(0)}% confidence
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'summary'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'evidence'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Evidence ({report.evidence?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'recommendations'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Recommendations
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Verification Summary</h3>
              <div className={`p-4 rounded-lg ${
                report.verificationResult === 'verified' ? 'bg-green-50 border border-green-200' :
                report.verificationResult === 'suspicious' ? 'bg-yellow-50 border border-yellow-200' :
                report.verificationResult === 'fake' ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-start">
                  <div className="mt-0.5 mr-3">
                    {getStatusIcon(report.verificationResult || 'unverifiable')}
                  </div>
                  <div>
                    <h4 className={`font-medium ${
                      report.verificationResult === 'verified' ? 'text-green-800' :
                      report.verificationResult === 'suspicious' ? 'text-yellow-800' :
                      report.verificationResult === 'fake' ? 'text-red-800' :
                      'text-blue-800'
                    }`}>
                      {report.verificationResult === 'verified' ? 'Profile Verified' :
                       report.verificationResult === 'suspicious' ? 'Suspicious Profile' :
                       report.verificationResult === 'fake' ? 'Likely Fake Profile' :
                       'Unable to Verify Profile'}
                    </h4>
                    <p className={`${
                      report.verificationResult === 'verified' ? 'text-green-700' :
                      report.verificationResult === 'suspicious' ? 'text-yellow-700' :
                      report.verificationResult === 'fake' ? 'text-red-700' :
                      'text-blue-700'
                    }`}>
                      {report.summary}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Findings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Image className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Image Analysis</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {report.evidence?.some(e => e.evidenceType === 'image_match' && e.evidenceData.matches?.length > 0)
                      ? `Found ${report.evidence.find(e => e.evidenceType === 'image_match')?.evidenceData.matches.length || 0} instances of this profile image online.`
                      : 'No matches found for this profile image.'}
                  </p>
                  {report.evidence?.some(e => e.evidenceType === 'stock_photo' && e.evidenceData.is_stock_photo) && (
                    <div className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      <span>Profile image appears to be a stock photo.</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <User className="w-5 h-5 text-purple-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Profile Consistency</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {report.evidence?.some(e => e.evidenceType === 'username_match')
                      ? `Found ${report.evidence.find(e => e.evidenceType === 'username_match')?.evidenceData.matches?.length || 0} profiles with matching username.`
                      : 'No username matches found across platforms.'}
                  </p>
                  {report.evidence?.some(e => e.evidenceType === 'inconsistency' && e.isRedFlag) && (
                    <div className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      <span>Inconsistencies detected in profile information.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Verification Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {report.evidence?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Evidence Items</div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {report.redFlags || 0}
                  </div>
                  <div className="text-sm text-gray-600">Red Flags</div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {report.confidenceScore ? (report.confidenceScore * 100).toFixed(0) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Confidence</div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {report.evidence?.filter(e => e.evidenceType === 'image_match').length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Image Matches</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Evidence Tab */}
        {activeTab === 'evidence' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Evidence</h3>
            
            {report.evidence && report.evidence.length > 0 ? (
              <div className="space-y-4">
                {report.evidence.map((evidence) => (
                  <div 
                    key={evidence.id}
                    className={`border rounded-lg overflow-hidden ${
                      evidence.isRedFlag ? 'border-red-300' : 'border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedEvidence(expandedEvidence === evidence.id ? null : evidence.id)}
                      className={`flex items-center justify-between w-full p-4 text-left ${
                        evidence.isRedFlag ? 'bg-red-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${
                          evidence.isRedFlag ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {getEvidenceTypeIcon(evidence.evidenceType)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{getEvidenceTitle(evidence)}</h4>
                          <div className="flex items-center text-sm text-gray-500">
                            <div className="flex items-center mr-3">
                              {getPlatformIcon(evidence.platformName)}
                              <span className="ml-1">{evidence.platformName}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{new Date(evidence.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {evidence.isRedFlag && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full mr-3">
                            Red Flag
                          </span>
                        )}
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mr-3">
                          {(evidence.confidenceScore * 100).toFixed(0)}% confidence
                        </span>
                        {expandedEvidence === evidence.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>
                    
                    {expandedEvidence === evidence.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 border-t border-gray-200"
                      >
                        {renderEvidenceContent(evidence)}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Evidence Found</h4>
                <p className="text-gray-600">
                  No verification evidence has been collected for this profile.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            
            <div className="space-y-4">
              {report.verificationResult === 'verified' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-green-800 mb-1">Profile Appears Authentic</h4>
                      <p className="text-green-700">
                        This profile has been verified with high confidence. You can proceed with confidence in your interactions.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {report.verificationResult === 'suspicious' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">Proceed with Caution</h4>
                      <p className="text-yellow-700">
                        This profile has some suspicious elements. Consider these additional verification steps:
                      </p>
                      <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
                        <li>Request a video call before meeting in person</li>
                        <li>Ask specific questions about information in their profile</li>
                        <li>Be cautious about sharing personal information</li>
                        <li>Report any requests for money or financial assistance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {report.verificationResult === 'fake' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <X className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-red-800 mb-1">Likely Fake Profile</h4>
                      <p className="text-red-700">
                        This profile shows strong indicators of being fake or misrepresented. We recommend:
                      </p>
                      <ul className="list-disc list-inside text-red-700 mt-2 space-y-1">
                        <li>Discontinue communication with this user</li>
                        <li>Report the profile to platform administrators</li>
                        <li>Block this user to prevent further contact</li>
                        <li>Do not share any personal information or financial details</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {report.verificationResult === 'unverifiable' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">Unable to Verify</h4>
                      <p className="text-blue-700">
                        We couldn't find enough information to verify this profile. Consider these steps:
                      </p>
                      <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
                        <li>Ask for additional verification (e.g., video call)</li>
                        <li>Proceed slowly and cautiously in your interactions</li>
                        <li>Be alert for inconsistencies in their communication</li>
                        <li>Consider requesting social media connections</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* General Safety Tips */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mt-4">
                <h4 className="font-medium text-gray-900 mb-2">General Online Dating Safety Tips</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Meet in public places for your first few meetings</li>
                  <li>Tell a friend or family member about your plans</li>
                  <li>Use the platform's messaging system until you build trust</li>
                  <li>Trust your instincts if something feels wrong</li>
                  <li>Report suspicious behavior to platform administrators</li>
                  <li>Never send money to someone you haven't met in person</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              <span>Report ID: {reportId.substring(0, 8)}...</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // In a real app, this would download the report as PDF
                alert('Report download functionality would be implemented here.');
              }}
            >
              <Download className="w-4 h-4 mr-1" />
              Download Report
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileVerificationReport;