import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, ThumbsUp, AlertTriangle, Lightbulb, 
  Zap, ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react';
import Button from '../ui/Button';
import CompatibilityScore from './CompatibilityScore';
import { 
  CompatibilityInsight,
  useCompatibilityScoring
} from '../../hooks/useCompatibilityScoring';

interface CompatibilityInsightsProps {
  userId: string;
  targetUserId: string;
  userName: string;
  targetUserName: string;
  onViewDetails?: () => void;
  className?: string;
}

const CompatibilityInsights: React.FC<CompatibilityInsightsProps> = ({
  userId,
  targetUserId,
  userName,
  targetUserName,
  onViewDetails,
  className = ''
}) => {
  const [score, setScore] = useState<number | null>(null);
  const [insights, setInsights] = useState<CompatibilityInsight[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllInsights, setShowAllInsights] = useState(false);

  const { 
    getCompatibilityScore,
    getCompatibilityInsights
  } = useCompatibilityScoring(userId);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const scoreData = await getCompatibilityScore(targetUserId);
        const insightsData = await getCompatibilityInsights(targetUserId);
        
        if (scoreData) {
          setScore(scoreData.score);
        }
        
        setInsights(insightsData);
      } catch (err) {
        console.error('Error loading compatibility insights:', err);
        setError('Failed to load compatibility insights');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [userId, targetUserId, getCompatibilityScore, getCompatibilityInsights]);

  if (isLoading) {
    return (
      <div className={`p-4 bg-white rounded-lg shadow-md ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || score === null) {
    return (
      <div className={`p-4 bg-white rounded-lg shadow-md ${className}`}>
        <div className="flex items-center justify-center h-32 text-center">
          <div>
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-gray-600">Unable to load compatibility insights</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Compatibility Insights</h3>
          <CompatibilityScore score={score} size="sm" />
        </div>
        <p className="text-sm text-gray-600">
          AI-powered analysis of your compatibility with {targetUserName}
        </p>
      </div>

      {/* Insights */}
      <div className="p-4">
        {insights && insights.length > 0 ? (
          <div className="space-y-3">
            {/* Show first 2 insights or all if expanded */}
            {(showAllInsights ? insights : insights.slice(0, 2)).map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg ${
                  insight.type === 'strength' ? 'bg-green-50 border border-green-200' :
                  insight.type === 'challenge' ? 'bg-orange-50 border border-orange-200' :
                  'bg-blue-50 border border-blue-200'
                }`}
              >
                <div className="flex items-start">
                  <div className="mt-0.5 mr-3">
                    {insight.type === 'strength' && <ThumbsUp className="w-4 h-4 text-green-600" />}
                    {insight.type === 'challenge' && <AlertTriangle className="w-4 h-4 text-orange-600" />}
                    {insight.type === 'opportunity' && <Lightbulb className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${
                      insight.type === 'strength' ? 'text-green-800' :
                      insight.type === 'challenge' ? 'text-orange-800' :
                      'text-blue-800'
                    }`}>
                      {insight.title}
                    </h4>
                    <p className={`text-xs ${
                      insight.type === 'strength' ? 'text-green-700' :
                      insight.type === 'challenge' ? 'text-orange-700' :
                      'text-blue-700'
                    }`}>
                      {insight.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Show/hide toggle if more than 2 insights */}
            {insights.length > 2 && (
              <button
                onClick={() => setShowAllInsights(!showAllInsights)}
                className="w-full text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center mt-2"
              >
                {showAllInsights ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Show {insights.length - 2} More Insights
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <Zap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No insights available yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          className="w-full"
        >
          <Heart className="w-4 h-4 mr-2" />
          View Full Compatibility Analysis
        </Button>
      </div>
    </div>
  );
};

export default CompatibilityInsights;