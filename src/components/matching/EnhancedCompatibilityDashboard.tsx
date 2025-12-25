import React, { useState, useEffect } from 'react';
import { useEnhancedMatching } from '../../hooks/useEnhancedMatching';
import { TrendingUp, Brain, Target, Activity, AlertCircle } from 'lucide-react';

interface EnhancedCompatibilityDashboardProps {
  userId: string;
  showInsights?: boolean;
}

export const EnhancedCompatibilityDashboard: React.FC<EnhancedCompatibilityDashboardProps> = ({
  userId,
  showInsights = true
}) => {
  const {
    getMLRecommendations,
    getBehavioralInsights,
    getLearnedPreferences,
    loading,
    error
  } = useEnhancedMatching(userId);

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [preferences, setPreferences] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'insights' | 'preferences'>('recommendations');

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    const [recs, behavioralInsights, learnedPrefs] = await Promise.all([
      getMLRecommendations(20, 60, true),
      getBehavioralInsights(),
      getLearnedPreferences()
    ]);

    setRecommendations(recs);
    setInsights(behavioralInsights);
    setPreferences(learnedPrefs);
  };

  const renderRecommendations = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-semibold">AI-Powered Recommendations</h3>
      </div>
      
      {recommendations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No recommendations available yet. Complete your profile to get better matches!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec, index) => (
            <div
              key={rec.targetUserId}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-purple-600">#{rec.rank}</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  {rec.successProbability.toFixed(0)}% match
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Compatibility:</span>
                  <span className="font-semibold">{rec.compatibilityScore.toFixed(0)}/100</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                    style={{ width: `${rec.compatibilityScore}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Confidence: {rec.predictionConfidence.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold">Behavioral Insights</h3>
      </div>

      {!insights ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No behavioral data available yet. Start using the platform to see your insights!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-4">Engagement Score</h4>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {insights.engagementScore?.toFixed(0) || 0}
            </div>
            <div className="text-sm text-blue-700">out of 100</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
            <h4 className="font-semibold text-purple-900 mb-4">Activity Level</h4>
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {insights.sessionsPerWeek?.toFixed(1) || 0}
            </div>
            <div className="text-sm text-purple-700">sessions per week</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
            <h4 className="font-semibold text-green-900 mb-4">Like Rate</h4>
            <div className="text-4xl font-bold text-green-600 mb-2">
              {((insights.likeRate || 0) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-green-700">of profiles liked</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
            <h4 className="font-semibold text-orange-900 mb-4">Response Rate</h4>
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {((insights.messageResponseRate || 0) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-orange-700">messages responded</div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-6 h-6 text-pink-600" />
        <h3 className="text-xl font-semibold">Learned Preferences</h3>
      </div>

      {preferences.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>We're still learning your preferences. Keep interacting to help us understand you better!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {preferences.map((pref, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold capitalize">
                  {pref.preferenceType.replace(/_/g, ' ')}
                </h4>
                <span className="text-xs px-2 py-1 bg-pink-100 text-pink-800 rounded-full">
                  {(pref.confidence * 100).toFixed(0)}% confident
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                Learned from {pref.sampleSize} {pref.learnedFrom}
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full"
                  style={{ width: `${pref.confidence * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <AlertCircle className="w-5 h-5 inline mr-2" />
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Enhanced Compatibility Dashboard
        </h2>
        <p className="text-gray-600">
          AI-powered insights to help you find your perfect match
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'recommendations'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Recommendations
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'insights'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Insights
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'preferences'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Preferences
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div>
          {activeTab === 'recommendations' && renderRecommendations()}
          {activeTab === 'insights' && renderInsights()}
          {activeTab === 'preferences' && renderPreferences()}
        </div>
      )}
    </div>
  );
};
