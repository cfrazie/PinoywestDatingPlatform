// HostControls Component - Control panel for stream host
import React from 'react';
import {
  Grid3x3,
  Maximize2,
  UserX,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Users,
} from 'lucide-react';
import { StreamParticipant, LayoutType } from '../../types/liveStream.types';

interface HostControlsProps {
  participants: StreamParticipant[];
  layoutType: LayoutType;
  spotlightUserId?: string;
  onSpotlightParticipant: (userId: string) => void;
  onReturnToGrid: () => void;
  onMinimizeParticipant: (userId: string) => void;
  onRemoveParticipant: (userId: string) => void;
  className?: string;
}

export const HostControls: React.FC<HostControlsProps> = ({
  participants,
  layoutType,
  spotlightUserId,
  onSpotlightParticipant,
  onReturnToGrid,
  onMinimizeParticipant,
  onRemoveParticipant,
  className = '',
}) => {
  const nonHostParticipants = participants.filter((p) => p.role !== 'host');

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Host Controls
        </h3>
        <span className="text-gray-400 text-sm">
          {participants.length} participant{participants.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Layout Toggle */}
      <div className="mb-4">
        <label className="text-gray-300 text-sm mb-2 block">Layout Mode</label>
        <div className="flex gap-2">
          <button
            onClick={onReturnToGrid}
            className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              layoutType === 'grid'
                ? 'bg-pink-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            Grid View
          </button>
          <button
            onClick={() => {
              if (nonHostParticipants.length > 0) {
                onSpotlightParticipant(nonHostParticipants[0].user_id);
              }
            }}
            disabled={nonHostParticipants.length === 0}
            className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              layoutType === 'spotlight'
                ? 'bg-pink-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            Spotlight
          </button>
        </div>
      </div>

      {/* Participant List */}
      <div>
        <label className="text-gray-300 text-sm mb-2 block">
          Manage Participants
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
          {nonHostParticipants.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No participants yet
            </p>
          ) : (
            nonHostParticipants.map((participant) => (
              <div
                key={participant.user_id}
                className="bg-gray-700 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {participant.avatar_url ? (
                    <img
                      src={participant.avatar_url}
                      alt={participant.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {participant.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium text-sm">
                      {participant.username}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {participant.is_muted && (
                        <VolumeX className="w-3 h-3 text-red-400" />
                      )}
                      {!participant.is_video_enabled && (
                        <EyeOff className="w-3 h-3 text-red-400" />
                      )}
                      {participant.user_id === spotlightUserId && (
                        <span className="text-xs bg-pink-600 text-white px-2 py-0.5 rounded-full">
                          Spotlight
                        </span>
                      )}
                      {participant.is_minimized && (
                        <span className="text-xs bg-gray-600 text-white px-2 py-0.5 rounded-full">
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Spotlight button */}
                  {participant.user_id !== spotlightUserId && (
                    <button
                      onClick={() => onSpotlightParticipant(participant.user_id)}
                      className="p-2 rounded-lg bg-gray-600 hover:bg-pink-600 text-white transition-colors"
                      title="Spotlight this participant"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Minimize button */}
                  <button
                    onClick={() => onMinimizeParticipant(participant.user_id)}
                    className={`p-2 rounded-lg transition-colors ${
                      participant.is_minimized
                        ? 'bg-pink-600 hover:bg-pink-700 text-white'
                        : 'bg-gray-600 hover:bg-gray-500 text-white'
                    }`}
                    title={participant.is_minimized ? 'Show video' : 'Hide video'}
                  >
                    {participant.is_minimized ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>

                  {/* Remove button */}
                  <button
                    onClick={() => onRemoveParticipant(participant.user_id)}
                    className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                    title="Remove participant"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
