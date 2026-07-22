import React, { useState, useEffect } from 'react';
import { EnhancedCompatibilityDashboard } from '../components/matching/EnhancedCompatibilityDashboard';
import { SuccessPredictionCard } from '../components/matching/SuccessPredictionCard';
import { BehavioralInsights } from '../components/matching/BehavioralInsights';
import { useEnhancedMatching } from '../hooks/useEnhancedMatching';

/**
 * Demo page showing how to use the ML-enhanced matching features
 * 
 * This page demonstrates:
 * 1. EnhancedCompatibilityDashboard - Complete matching dashboard
 * 2. SuccessPredictionCard - Individual match prediction
 * 3. BehavioralInsights - User engagement analytics
 * 4. useEnhancedMatching hook - API integration
 */
export const MLMatchingDemo: React.FC = () => {
  // Replace with actual user ID from auth context
  const userId = 'demo-user-id';
  const targetUserId = 'demo-target-user-id';

  const {
    getSuccessPrediction,
    getBehavioralInsights,
    trackInteraction,
    loading,
    error
  } = useEnhancedMatching(userId);

  const [prediction, setPrediction] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [activeDemo, setActiveDemo] = useState<'dashboard' | 'prediction' | 'insights'>('dashboard');

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    // Load prediction data
    const predictionData = await getSuccessPrediction(targetUserId);
    setPrediction(predictionData);

    // Load behavioral insights
    const insightsData = await getBehavioralInsights();
    setInsights(insightsData);
  };

  const handleInteractionDemo = async (type: string) => {
    await trackInteraction(targetUserId, type, {
      demo: true,
      timestamp: new Date().toISOString()
    });
    alert(`Tracked ${type} interaction!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ML Matching Algorithm Demo
          </h1>
          <p className="mt-2 text-gray-600">
            Explore the advanced machine learning features for intelligent matching
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveDemo('dashboard')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeDemo === 'dashboard'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Complete Dashboard
            </button>
            <button
              onClick={() => setActiveDemo('prediction')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeDemo === 'prediction'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Success Prediction
            </button>
            <button
              onClick={() => setActiveDemo('insights')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeDemo === 'insights'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Behavioral Insights
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            Error: {error}
          </div>
        )}

        {activeDemo === 'dashboard' && (
          <div>
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                📊 Complete Matching Dashboard
              </h3>
              <p className="text-sm text-blue-800">
                This component shows ML-powered recommendations, behavioral insights, and learned preferences all in one place.
              </p>
            </div>
            <EnhancedCompatibilityDashboard userId={userId} />
          </div>
        )}

        {activeDemo === 'prediction' && (
          <div>
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                🎯 Success Prediction Card
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Shows detailed success probabilities for a specific match including message, date, and relationship success rates.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleInteractionDemo('profile_like')}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                >
                  Track Like
                </button>
                <button
                  onClick={() => handleInteractionDemo('message_sent')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Track Message
                </button>
                <button
                  onClick={() => handleInteractionDemo('date_requested')}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  Track Date Request
                </button>
              </div>
            </div>
            {prediction ? (
              <div className="flex justify-center">
                <SuccessPredictionCard 
                  prediction={prediction} 
                  targetUserName="Sarah" 
                />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {loading ? 'Loading prediction...' : 'No prediction data available. Interact with users to generate predictions.'}
              </div>
            )}
          </div>
        )}

        {activeDemo === 'insights' && (
          <div>
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                📈 Behavioral Insights
              </h3>
              <p className="text-sm text-blue-800">
                Displays user engagement patterns, activity metrics, and personalized tips based on behavior analysis.
              </p>
            </div>
            {insights ? (
              <div className="flex justify-center">
                <BehavioralInsights insights={insights} />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {loading ? 'Loading insights...' : 'No behavioral data available. Start using the platform to see insights.'}
              </div>
            )}
          </div>
        )}

        {/* Usage Examples */}
        <div className="mt-12 bg-gray-800 rounded-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">💻 Code Examples</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-purple-300 mb-2">1. Using the Dashboard</h4>
              <pre className="bg-gray-900 rounded p-4 overflow-x-auto text-sm">
{`import { EnhancedCompatibilityDashboard } from '@/components/matching';

<EnhancedCompatibilityDashboard userId={currentUser.id} />`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold text-purple-300 mb-2">2. Getting Success Predictions</h4>
              <pre className="bg-gray-900 rounded p-4 overflow-x-auto text-sm">
{`const { getSuccessPrediction } = useEnhancedMatching(userId);

const prediction = await getSuccessPrediction(targetUserId);
// Returns: { message_success_probability, date_success_probability, ... }`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold text-purple-300 mb-2">3. Tracking Interactions</h4>
              <pre className="bg-gray-900 rounded p-4 overflow-x-auto text-sm">
{`const { trackInteraction } = useEnhancedMatching(userId);

// Track when user likes a profile
await trackInteraction(targetUserId, 'profile_like', {
  context: 'discover_page',
  source: 'recommendations'
});`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold text-purple-300 mb-2">4. Getting ML Recommendations</h4>
              <pre className="bg-gray-900 rounded p-4 overflow-x-auto text-sm">
{`const { getMLRecommendations } = useEnhancedMatching(userId);

const matches = await getMLRecommendations(
  20,    // limit
  60,    // min score
  true   // use cache
);
// Returns array of { targetUserId, compatibilityScore, successProbability, ... }`}
              </pre>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-3">🤖</div>
            <h4 className="font-bold mb-2">ML-Powered Matching</h4>
            <p className="text-sm text-gray-600">
              Multiple AI models (NCF, Transformer, XGBoost) work together to find your best matches
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-3">📊</div>
            <h4 className="font-bold mb-2">Behavioral Learning</h4>
            <p className="text-sm text-gray-600">
              System learns from 22 different interaction types to understand your preferences
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="font-bold mb-2">Success Prediction</h4>
            <p className="text-sm text-gray-600">
              Predict message, date, and relationship success before you connect
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLMatchingDemo;
