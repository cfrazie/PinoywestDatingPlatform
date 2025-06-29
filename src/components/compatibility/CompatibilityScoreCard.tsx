import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Zap, ChevronDown, ChevronUp, Info } from 'lucide-react';
import Button from '../ui/Button';
import CompatibilityScore from './CompatibilityScore';
import CompatibilityDetails from './CompatibilityDetails';

interface CompatibilityScoreCardProps {
  userId: string;
  targetUserId: string;
  userName: string;
  targetUserName: string;
  score: number;
  className?: string;
}

const CompatibilityScoreCard: React.FC<CompatibilityScoreCardProps> = ({
  userId,
  targetUserId,
  userName,
  targetUserName,
  score,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
      >
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">AI Compatibility</h3>
            <CompatibilityScore score={score} size="sm" />
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  score >= 90 ? 'bg-green-500' :
                  score >= 80 ? 'bg-blue-500' :
                  score >= 70 ? 'bg-yellow-500' :
                  score >= 60 ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>

          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <p className="text-sm text-gray-600 mb-3">
                Our AI has analyzed 50+ compatibility factors between you and {targetUserName}, including cultural background, communication style, values, and interests.
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="font-medium text-blue-800">Cultural Match</div>
                  <div className="text-blue-600">Strong</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="font-medium text-green-800">Values Alignment</div>
                  <div className="text-green-600">Very High</div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(true)}
              className="w-full"
            >
              <Zap className="w-4 h-4 mr-2" />
              View Detailed Analysis
            </Button>
            
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-800"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Learn More
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Detailed Compatibility Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CompatibilityDetails
              userId={userId}
              targetUserId={targetUserId}
              userName={userName}
              targetUserName={targetUserName}
              onClose={() => setShowDetails(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CompatibilityScoreCard;