import React from 'react';
import { Activity, Clock, Heart, MessageSquare, TrendingUp, Users, Calendar } from 'lucide-react';

interface BehavioralInsight {
  avgSessionDuration?: number;
  sessionsPerWeek?: number;
  avgProfilesViewedPerSession?: number;
  likeRate?: number;
  skipRate?: number;
  messageResponseRate?: number;
  messageResponseTimeAvg?: number;
  preferredActivityTimes?: Record<string, number>;
  preferredDays?: string[];
  swipeVelocity?: number;
  engagementScore?: number;
}

interface BehavioralInsightsProps {
  insights: BehavioralInsight;
  userName?: string;
}

export const BehavioralInsights: React.FC<BehavioralInsightsProps> = ({
  insights,
  userName = 'You'
}) => {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0 min';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getEngagementLevel = (score?: number) => {
    if (!score) return { level: 'New User', color: 'gray' };
    if (score >= 75) return { level: 'Super Active', color: 'green' };
    if (score >= 50) return { level: 'Active', color: 'blue' };
    if (score >= 25) return { level: 'Casual', color: 'yellow' };
    return { level: 'Getting Started', color: 'gray' };
  };

  const getTopActivityTimes = () => {
    if (!insights.preferredActivityTimes) return [];
    
    return Object.entries(insights.preferredActivityTimes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => {
        const hourNum = parseInt(hour);
        const period = hourNum >= 12 ? 'PM' : 'AM';
        const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
        return `${displayHour}${period}`;
      });
  };

  const engagementLevel = getEngagementLevel(insights.engagementScore);
  const topActivityTimes = getTopActivityTimes();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-purple-600" />
          <div>
            <h3 className="text-2xl font-bold">Behavioral Insights</h3>
            <p className="text-gray-600 text-sm">Your dating activity patterns</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full font-semibold ${
          engagementLevel.color === 'green' ? 'bg-green-100 text-green-800' :
          engagementLevel.color === 'blue' ? 'bg-blue-100 text-blue-800' :
          engagementLevel.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {engagementLevel.level}
        </div>
      </div>

      {/* Engagement Score Ring */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${(insights.engagementScore || 0) * 5.53} 553`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {insights.engagementScore?.toFixed(0) || 0}
            </div>
            <div className="text-sm text-gray-500">Engagement Score</div>
          </div>
        </div>
      </div>

      {/* Activity Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-semibold text-purple-900">Avg Session</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {formatDuration(insights.avgSessionDuration)}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-semibold text-blue-900">Weekly Sessions</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {insights.sessionsPerWeek?.toFixed(1) || 0}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-pink-600" />
            <span className="text-xs font-semibold text-pink-900">Profiles/Session</span>
          </div>
          <div className="text-2xl font-bold text-pink-600">
            {insights.avgProfilesViewedPerSession || 0}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-xs font-semibold text-green-900">Swipe Speed</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {insights.swipeVelocity?.toFixed(1) || 0}<span className="text-sm">/min</span>
          </div>
        </div>
      </div>

      {/* Interaction Rates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <span className="text-sm font-semibold">Like Rate</span>
            </div>
            <span className="text-lg font-bold text-pink-600">
              {((insights.likeRate || 0) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-pink-500 h-2 rounded-full"
              style={{ width: `${(insights.likeRate || 0) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold">Response Rate</span>
            </div>
            <span className="text-lg font-bold text-blue-600">
              {((insights.messageResponseRate || 0) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${(insights.messageResponseRate || 0) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-semibold">Avg Response Time</span>
            </div>
            <span className="text-lg font-bold text-purple-600">
              {formatDuration(insights.messageResponseTimeAvg)}
            </span>
          </div>
        </div>
      </div>

      {/* Activity Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topActivityTimes.length > 0 && (
          <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-indigo-900">Most Active Times</span>
            </div>
            <div className="flex gap-2">
              {topActivityTimes.map((time, index) => (
                <div
                  key={index}
                  className="px-3 py-2 bg-white rounded-lg text-sm font-semibold text-indigo-600"
                >
                  {time}
                </div>
              ))}
            </div>
          </div>
        )}

        {insights.preferredDays && insights.preferredDays.length > 0 && (
          <div className="p-4 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span className="font-semibold text-teal-900">Preferred Days</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {insights.preferredDays.map((day, index) => (
                <div
                  key={index}
                  className="px-3 py-1 bg-white rounded-full text-sm font-semibold text-teal-600"
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
        <div className="font-semibold text-purple-900 mb-2">💡 Personalized Tips</div>
        <ul className="space-y-1 text-sm text-purple-800">
          {(insights.likeRate || 0) < 0.2 && (
            <li>• Consider being more selective with likes to improve match quality</li>
          )}
          {(insights.likeRate || 0) > 0.8 && (
            <li>• You like most profiles! Being more selective might improve match quality</li>
          )}
          {(insights.messageResponseRate || 0) < 0.5 && (
            <li>• Try responding to more messages to increase your engagement</li>
          )}
          {(insights.sessionsPerWeek || 0) < 2 && (
            <li>• More frequent logins can help you connect with matches faster</li>
          )}
          {(insights.engagementScore || 0) >= 75 && (
            <li>• Great job! Your high engagement is helping you find better matches</li>
          )}
        </ul>
      </div>
    </div>
  );
};
