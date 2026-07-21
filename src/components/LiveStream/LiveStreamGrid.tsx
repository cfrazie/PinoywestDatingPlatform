// LiveStreamGrid Component - Main grid layout with dynamic sizing
import React, { useMemo } from 'react';
import { VideoTile } from './VideoTile';
import { StreamParticipant, LayoutType } from '../../types/liveStream.types';
import { useStreamLayout } from '../../hooks/useStreamLayout';

interface LiveStreamGridProps {
  participants: StreamParticipant[];
  streams: Map<string, MediaStream>;
  localStream?: MediaStream;
  currentUserId: string;
  layoutType: LayoutType;
  spotlightUserId?: string;
  isHost: boolean;
  onParticipantClick?: (participant: StreamParticipant) => void;
}

export const LiveStreamGrid: React.FC<LiveStreamGridProps> = ({
  participants,
  streams,
  localStream,
  currentUserId,
  layoutType,
  spotlightUserId,
  isHost,
  onParticipantClick,
}) => {
  const { gridConfig, getGridTemplate, getSpotlightLayout, getTransitionClass } =
    useStreamLayout(participants.length, layoutType, spotlightUserId);

  // Separate spotlight participant from others
  const { spotlightParticipant, otherParticipants } = useMemo(() => {
    if (layoutType === 'spotlight' && spotlightUserId) {
      const spotlight = participants.find((p) => p.user_id === spotlightUserId);
      const others = participants.filter((p) => p.user_id !== spotlightUserId);
      return { spotlightParticipant: spotlight, otherParticipants: others };
    }
    return { spotlightParticipant: null, otherParticipants: participants };
  }, [participants, layoutType, spotlightUserId]);

  const getStreamForParticipant = (participant: StreamParticipant) => {
    if (participant.user_id === currentUserId) {
      return localStream;
    }
    return streams.get(participant.user_id);
  };

  if (participants.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg">
        <div className="text-center text-gray-400">
          <p className="text-xl mb-2">Waiting for participants...</p>
          <p className="text-sm">The stream will begin once participants join</p>
        </div>
      </div>
    );
  }

  // Grid Layout
  if (layoutType === 'grid') {
    return (
      <div
        className={`w-full h-full p-2 ${getTransitionClass()}`}
        style={getGridTemplate()}
      >
        {participants.map((participant) => (
          <VideoTile
            key={participant.user_id}
            participant={participant}
            stream={getStreamForParticipant(participant)}
            isLocal={participant.user_id === currentUserId}
            isMuted={participant.is_muted}
            onClick={
              isHost && participant.role !== 'host'
                ? () => onParticipantClick?.(participant)
                : undefined
            }
            className={getTransitionClass()}
          />
        ))}
      </div>
    );
  }

  // Spotlight Layout
  const spotlightLayout = getSpotlightLayout();
  
  return (
    <div className={`w-full h-full flex gap-2 p-2 ${getTransitionClass()}`}>
      {/* Main spotlight video */}
      {spotlightParticipant && (
        <div style={spotlightLayout.main} className={getTransitionClass()}>
          <VideoTile
            participant={spotlightParticipant}
            stream={getStreamForParticipant(spotlightParticipant)}
            isLocal={spotlightParticipant.user_id === currentUserId}
            isSpotlight={true}
            isMuted={spotlightParticipant.is_muted}
            className="h-full"
          />
        </div>
      )}

      {/* Thumbnail videos */}
      {otherParticipants.length > 0 && (
        <div
          style={spotlightLayout.thumbnails}
          className={`${getTransitionClass()} scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800`}
        >
          {otherParticipants.map((participant) => (
            <div
              key={participant.user_id}
              className={`flex-shrink-0 ${getTransitionClass()}`}
              style={{ minHeight: '150px' }}
            >
              <VideoTile
                participant={participant}
                stream={getStreamForParticipant(participant)}
                isLocal={participant.user_id === currentUserId}
                isMuted={participant.is_muted}
                onClick={
                  isHost && participant.role !== 'host'
                    ? () => onParticipantClick?.(participant)
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
