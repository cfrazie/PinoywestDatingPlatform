import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Star, ArrowUp, ArrowDown, Info, 
  ThumbsUp, AlertTriangle, Lightbulb, 
  ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import Button from '../ui/Button';
import CompatibilityScore from './CompatibilityScore';
import { 
  CompatibilityExplanation, 
  CompatibilityInsight,
  useCompatibilityScoring
} from '../../hooks/useCompatibilityScoring';

interface CompatibilityDetailsProps {
  userId: string;
  targetUserId: string;
  userName: string;
  targetUserName: string;
  onClose?: () => void;
}

const CompatibilityDetails: React.FC<CompatibilityDetailsProps> = ({
  userId,
  targetUserId,
  userName,
  targetUserName,
  onClose
}) => {
  const [explanation, setExplanation] = useState<CompatibilityExplanation | null>(null);
  const [insights, setInsights] = useState<CompatibilityInsight[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  const { 
    getCompatibilityScore,
    getCompatibilityExplanation,
    getCompatibilityInsights
  } = useCompatibilityScoring(userId);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const explanationData = await getCompatibilityExplanation(targetUserId);
        const insightsData = await getCompatibilityInsights(targetUserId);
        
        setExplanation(explanationData);
        setInsights(insightsData);
      } catch (err) {
        console.error('Error loading compatibility details:', err);
        setError('Failed to load compatibility details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [userId, targetUserId, getCompatibilityExplanation, getCompatibilityInsights]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Analyzing compatibility...</p>
      </div>
    );
  }

  if (error || !explanation) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis Error</h3>
        <p className="text-gray-600 mb-4">{error || 'Unable to generate compatibility analysis'}</p>
        <Button onClick={onClose}>Close</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Compatibility Analysis</h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-white hover:text-blue-100"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-center space-x-3">
          <div className="text-center">
            <p className="text-sm text-blue-100 mb-1">You</p>
            <p className="font-medium">{userName}</p>
          </div>
          
          <div className="flex flex-col items-center">
            <CompatibilityScore 
              score={explanation.score} 
              size="lg"
              showLabel={false}
              className="mb-2"
            />
            <Heart className="w-8 h-8 text-pink-300" />
          </div>
          
          <div className="text-center">
            <p className="text-sm text-blue-100 mb-1">Match</p>
            <p className="font-medium">{targetUserName}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Section */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('overview')}
            className="flex items-center justify-between w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <Info className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Overview</h3>
            </div>
            {expandedSection === 'overview' ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {expandedSection === 'overview' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-4 bg-white border border-gray-200 rounded-lg"
            >
              <p className="text-gray-700 mb-4">{explanation.explanation}</p>
              
              <div className="flex items-center justify-center mb-4">
                <div className="w-full max-w-xs bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full ${
                      explanation.score >= 90 ? 'bg-green-500' :
                      explanation.score >= 80 ? 'bg-blue-500' :
                      explanation.score >= 70 ? 'bg-yellow-500' :
                      explanation.score >= 60 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${explanation.score}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                <p>Based on {explanation.topFactors.length + explanation.improvementAreas.length} compatibility factors</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Strengths Section */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('strengths')}
            className="flex items-center justify-between w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <ThumbsUp className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Compatibility Strengths</h3>
            </div>
            {expandedSection === 'strengths' ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {expandedSection === 'strengths' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-3"
            >
              {explanation.topFactors.map((factor, index) => (
                <div 
                  key={index}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-800">{factor.factor}</h4>
                    <span className="text-sm bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                      {factor.score}%
                    </span>
                  </div>
                  <p className="text-sm text-green-700">{factor.description}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Growth Areas Section */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('growth')}
            className="flex items-center justify-between w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <Lightbulb className="w-5 h-5 text-yellow-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Growth Opportunities</h3>
            </div>
            {expandedSection === 'growth' ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {expandedSection === 'growth' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-3"
            >
              {explanation.improvementAreas.map((area, index) => (
                <div 
                  key={index}
                  className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-yellow-800">{area.factor}</h4>
                    <span className="text-sm bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                      {area.score}%
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700">{area.suggestion}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Insights Section */}
        {insights && insights.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => toggleSection('insights')}
              className="flex items-center justify-between w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="font-semibold text-gray-900">AI Insights</h3>
              </div>
              {expandedSection === 'insights' ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSection === 'insights' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-3"
              >
                {insights.map((insight, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg ${
                      insight.type === 'strength' ? 'bg-blue-50 border border-blue-200' :
                      insight.type === 'challenge' ? 'bg-orange-50 border border-orange-200' :
                      'bg-purple-50 border border-purple-200'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      {insight.type === 'strength' && <ThumbsUp className="w-4 h-4 text-blue-600 mr-2" />}
                      {insight.type === 'challenge' && <AlertTriangle className="w-4 h-4 text-orange-600 mr-2" />}
                      {insight.type === 'opportunity' && <Lightbulb className="w-4 h-4 text-purple-600 mr-2" />}
                      <h4 className={`font-medium ${
                        insight.type === 'strength' ? 'text-blue-800' :
                        insight.type === 'challenge' ? 'text-orange-800' :
                        'text-purple-800'
                      }`}>
                        {insight.title}
                      </h4>
                    </div>
                    <p className={`text-sm ${
                      insight.type === 'strength' ? 'text-blue-700' :
                      insight.type === 'challenge' ? 'text-orange-700' :
                      'text-purple-700'
                    }`}>
                      {insight.description}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          <Button>
            <Heart className="w-4 h-4 mr-2" />
            Connect
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityDetails;