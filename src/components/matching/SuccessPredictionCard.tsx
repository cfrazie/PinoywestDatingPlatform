import React from 'react';
import { Heart, MessageCircle, Calendar, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface SuccessPrediction {
  messageSuccessProbability: number;
  dateSuccessProbability: number;
  relationshipSuccessProbability: number;
  longTermCompatibilityScore: number;
  predictedSatisfactionRating: number;
  ghostingRisk: number;
  conflictLikelihood: number;
  predictionConfidence: number;
  dataSufficiency: number;
  interactionCount: number;
}

interface SuccessPredictionCardProps {
  prediction: SuccessPrediction;
  targetUserName?: string;
}

export const SuccessPredictionCard: React.FC<SuccessPredictionCardProps> = ({
  prediction,
  targetUserName = 'this person'
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return 'bg-green-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getConfidenceLevel = () => {
    if (prediction.predictionConfidence >= 70) return 'High';
    if (prediction.predictionConfidence >= 50) return 'Medium';
    return 'Low';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold mb-1">Success Prediction</h3>
          <p className="text-gray-600">AI analysis for {targetUserName}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
          prediction.predictionConfidence >= 70 ? 'bg-green-100 text-green-800' :
          prediction.predictionConfidence >= 50 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {getConfidenceLevel()} Confidence
        </div>
      </div>

      {/* Main Scores */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 text-pink-600" />
          <div className="text-3xl font-bold text-pink-600 mb-1">
            {prediction.messageSuccessProbability.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600">Message Success</div>
        </div>

        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {prediction.dateSuccessProbability.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600">Date Success</div>
        </div>

        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <Heart className="w-8 h-8 mx-auto mb-2 text-blue-600" />
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {prediction.relationshipSuccessProbability.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600">Relationship Success</div>
        </div>
      </div>

      {/* Compatibility Score */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-gray-700">Long-Term Compatibility</span>
          <span className={`font-bold ${getScoreColor(prediction.longTermCompatibilityScore)}`}>
            {prediction.longTermCompatibilityScore.toFixed(0)}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
            style={{ width: `${prediction.longTermCompatibilityScore}%` }}
          />
        </div>
      </div>

      {/* Predicted Satisfaction */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-gray-700">Predicted Satisfaction</span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Heart
              key={star}
              className={`w-6 h-6 ${
                star <= prediction.predictedSatisfactionRating
                  ? 'fill-pink-500 text-pink-500'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {prediction.predictedSatisfactionRating.toFixed(1)}/5.0
          </span>
        </div>
      </div>

      {/* Risk Indicators */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className={`w-5 h-5 ${
              prediction.ghostingRisk > 50 ? 'text-red-500' : 'text-yellow-500'
            }`} />
            <span className="text-sm font-semibold">Ghosting Risk</span>
          </div>
          <div className="text-2xl font-bold mb-1">
            {prediction.ghostingRisk.toFixed(0)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                prediction.ghostingRisk > 50 ? 'bg-red-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${prediction.ghostingRisk}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className={`w-5 h-5 ${
              prediction.conflictLikelihood > 50 ? 'text-red-500' : 'text-yellow-500'
            }`} />
            <span className="text-sm font-semibold">Conflict Likelihood</span>
          </div>
          <div className="text-2xl font-bold mb-1">
            {prediction.conflictLikelihood.toFixed(0)}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                prediction.conflictLikelihood > 50 ? 'bg-red-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${prediction.conflictLikelihood}%` }}
            />
          </div>
        </div>
      </div>

      {/* Data Sufficiency */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold">Data Sufficiency</span>
          </div>
          <span className="text-sm text-gray-600">
            {prediction.dataSufficiency.toFixed(0)}%
          </span>
        </div>
        <div className="text-xs text-gray-600 mb-2">
          Based on {prediction.interactionCount} interaction{prediction.interactionCount !== 1 ? 's' : ''}
        </div>
        {prediction.dataSufficiency < 50 && (
          <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
            ⚠️ Limited data available. Predictions will improve as you interact more.
          </div>
        )}
      </div>

      {/* Overall Recommendation */}
      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <div className="font-semibold text-purple-900 mb-1">
              {prediction.relationshipSuccessProbability >= 70
                ? '✨ Highly Recommended Match!'
                : prediction.relationshipSuccessProbability >= 50
                ? '👍 Good Potential Match'
                : '🤔 Moderate Compatibility'}
            </div>
            <div className="text-sm text-purple-800">
              {prediction.relationshipSuccessProbability >= 70
                ? 'This match shows exceptional potential. Your compatibility scores are high across all dimensions!'
                : prediction.relationshipSuccessProbability >= 50
                ? 'This match shows good potential. Consider reaching out to learn more about each other.'
                : 'This match shows moderate compatibility. You might have some differences to work through.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
