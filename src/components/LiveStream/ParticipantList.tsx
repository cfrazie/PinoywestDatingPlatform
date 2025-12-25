// ParticipantList Component - List of participants with status
import React from 'react';
import { Users, Mic, MicOff, Video, VideoOff, Crown } from 'lucide-react';
import { StreamParticipant } from '../../types/liveStream.types';

interface ParticipantListProps {
  participants: StreamParticipant[];
  viewerCount: number;
  className?: string;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  viewerCount,
  className = '',
}) => {
  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Participants
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">
            {participants.length} active
          </span>
          <span className="text-gray-400 text-sm">•</span>
          <span className="text-gray-400 text-sm">
            {viewerCount} viewer{viewerCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
        {participants.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            No participants yet
          </p>
        ) : (
          participants.map((participant) => (
            <div
              key={participant.user_id}
              className="bg-gray-700 rounded-lg p-3 flex items-center justify-between hover:bg-gray-650 transition-colors"
            >
              <div className="flex items-center gap-3">
                {participant.avatar_url ? (
                  <img
                    src={participant.avatar_url}
                    alt={participant.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {participant.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-sm">
                      {participant.username}
                    </p>
                    {participant.role === 'host' && (
                      <div className="bg-yellow-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        <span className="text-xs font-semibold">Host</span>
                      </div>
                    )}
                  </div>
                  
                  {participant.is_speaking && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex gap-0.5">
                        <div className="w-1 bg-green-400 rounded-full animate-pulse" style={{ height: '8px' }}></div>
                        <div className="w-1 bg-green-400 rounded-full animate-pulse" style={{ height: '12px', animationDelay: '0.1s' }}></div>
                        <div className="w-1 bg-green-400 rounded-full animate-pulse" style={{ height: '8px', animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-green-400 text-xs">Speaking</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {participant.is_muted ? (
                  <div className="p-1.5 rounded-full bg-red-500/20">
                    <MicOff className="w-4 h-4 text-red-400" />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-full bg-green-500/20">
                    <Mic className="w-4 h-4 text-green-400" />
                  </div>
                )}

                {participant.is_video_enabled ? (
                  <div className="p-1.5 rounded-full bg-green-500/20">
                    <Video className="w-4 h-4 text-green-400" />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-full bg-red-500/20">
                    <VideoOff className="w-4 h-4 text-red-400" />
                  </div>
                )}

                {/* Connection quality indicator */}
                <div
                  className={`w-2 h-2 rounded-full ${
                    participant.connection_quality === 'excellent'
                      ? 'bg-green-400'
                      : participant.connection_quality === 'good'
                      ? 'bg-yellow-400'
                      : 'bg-red-400'
                  }`}
                  title={`Connection: ${participant.connection_quality || 'unknown'}`}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
