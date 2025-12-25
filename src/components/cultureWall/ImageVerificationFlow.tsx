import React, { useState, useEffect } from 'react';
import { verificationService } from '../../services/verificationService';
import type { UserVerificationRequest } from '../../types/cultureWall';
import { Camera, Upload, CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';

interface ImageVerificationFlowProps {
  userId: string;
  onComplete?: () => void;
}

export const ImageVerificationFlow: React.FC<ImageVerificationFlowProps> = ({ userId, onComplete }) => {
  const [step, setStep] = useState<'intro' | 'upload' | 'processing' | 'result'>('intro');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<UserVerificationRequest | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setStep('processing');
    setUploading(true);

    try {
      // In production, upload to Supabase Storage first
      // For now, using a mock URL
      const mockImageUrl = previewUrl;

      const result = await verificationService.submitImageVerification(
        mockImageUrl,
        'phone_camera'
      );

      setVerificationResult(result);
      setStep('result');
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert('Error submitting verification. Please try again.');
      setStep('upload');
    } finally {
      setUploading(false);
    }
  };

  const getRiskLevelColor = (level?: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-16 h-16 text-red-600" />;
      case 'flagged':
        return <AlertTriangle className="w-16 h-16 text-orange-600" />;
      default:
        return <Shield className="w-16 h-16 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Intro Step */}
        {step === 'intro' && (
          <div className="text-center">
            <Shield className="w-20 h-20 text-pink-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Profile Photo Verification
            </h1>
            <p className="text-gray-600 mb-6">
              Help us keep our community safe by verifying your profile photo.
              We'll check that it's authentic and not used elsewhere.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">What we check:</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>✓ Photo is not a stock image</li>
                <li>✓ Photo is not AI-generated</li>
                <li>✓ Photo is not found on other dating platforms</li>
                <li>✓ Photo is not found on adult content sites</li>
                <li>✓ Photo was taken with a real camera (EXIF data)</li>
              </ul>
            </div>

            <button
              onClick={() => setStep('upload')}
              className="w-full px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition font-medium"
            >
              Start Verification
            </button>
          </div>
        )}

        {/* Upload Step */}
        {step === 'upload' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Your Photo</h2>
            <p className="text-gray-600 mb-6">
              Please upload a clear photo of yourself. For best results, use your phone's camera.
            </p>

            {!previewUrl ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <label className="cursor-pointer block">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <span className="text-gray-600 mb-2 block">Take a photo or upload from gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <span className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition">
                    Choose Photo
                  </span>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl('');
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('intro')}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={uploading}
                    className="flex-1 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
                  >
                    Submit for Verification
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-pink-600 mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Analyzing Your Photo</h2>
            <p className="text-gray-600">
              We're checking your photo against multiple databases. This may take a moment...
            </p>
          </div>
        )}

        {/* Result Step */}
        {step === 'result' && verificationResult && (
          <div className="text-center">
            <div className="mb-6">
              {getStatusIcon(verificationResult.status)}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {verificationResult.status === 'verified' ? 'Verification Successful!' : 
               verificationResult.status === 'rejected' ? 'Verification Failed' :
               'Manual Review Required'}
            </h2>

            {verificationResult.status === 'verified' && (
              <p className="text-gray-600 mb-6">
                Your photo has been verified! Your profile will now show a verification badge.
              </p>
            )}

            {verificationResult.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">
                  {verificationResult.rejection_reason || 'Your photo did not pass our verification checks.'}
                </p>
              </div>
            )}

            {/* Risk Assessment */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Risk Assessment</h3>
                <span className={`px-3 py-1 rounded-full font-medium ${getRiskLevelColor(verificationResult.risk_level)}`}>
                  {verificationResult.risk_level?.toUpperCase() || 'UNKNOWN'} RISK
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Phone Camera</span>
                  <span className={verificationResult.is_phone_camera ? 'text-green-600' : 'text-red-600'}>
                    {verificationResult.is_phone_camera ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Stock Photo</span>
                  <span className={!verificationResult.is_stock_photo ? 'text-green-600' : 'text-red-600'}>
                    {!verificationResult.is_stock_photo ? '✓ No' : '✗ Yes'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">AI Generated</span>
                  <span className={!verificationResult.is_ai_generated ? 'text-green-600' : 'text-red-600'}>
                    {!verificationResult.is_ai_generated ? '✓ No' : '✗ Yes'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Found on Platforms</span>
                  <span className="text-gray-900">
                    {verificationResult.found_on_platforms?.length || 0}
                  </span>
                </div>
              </div>

              {verificationResult.risk_factors && verificationResult.risk_factors.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">Risk Factors:</h4>
                  <ul className="space-y-1">
                    {verificationResult.risk_factors.map((factor, index) => (
                      <li key={index} className="text-sm text-gray-600">• {factor}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {verificationResult.status !== 'verified' && (
                <button
                  onClick={() => {
                    setStep('intro');
                    setSelectedFile(null);
                    setPreviewUrl('');
                    setVerificationResult(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Try Again
                </button>
              )}
              {onComplete && (
                <button
                  onClick={onComplete}
                  className="flex-1 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
