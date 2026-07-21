// VideoTile Component - Individual participant video tile
import React, { useRef, useEffect, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Crown, Wifi, WifiOff } from 'lucide-react';
import { StreamParticipant } from '../../types/liveStream.types';

interface VideoTileProps {
  participant: StreamParticipant;
  stream?: MediaStream;
  isLocal?: boolean;
  isSpotlight?: boolean;
  isMuted?: boolean;
  onClick?: () => void;
  className?: string;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  stream,
  isLocal = false,
  isSpotlight = false,
  isMuted = false,
  onClick,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        setIsVideoLoaded(true);
      };
    }
  }, [stream]);

  const getConnectionQualityIcon = () => {
    switch (participant.connection_quality) {
      case 'excellent':
      case 'good':
        return <Wifi className="w-3 h-3 text-green-400" />;
      case 'poor':
        return <Wifi className="w-3 h-3 text-yellow-400" />;
      default:
        return <WifiOff className="w-3 h-3 text-red-400" />;
    }
  };

  return (
    <div
      className={`relative bg-gray-900 rounded-lg overflow-hidden ${
        isSpotlight ? 'spotlight-tile' : 'grid-tile'
      } ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-pink-500' : ''} ${className}`}
      onClick={onClick}
      style={{
        aspectRatio: '16/9',
        minHeight: isSpotlight ? '400px' : '150px',
      }}
    >
      {/* Video Element */}
      {participant.is_video_enabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted || isLocal}
          className={`w-full h-full object-cover ${!isVideoLoaded ? 'hidden' : ''}`}
        />
      ) : (
        // Avatar fallback
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600">
          {participant.avatar_url ? (
            <img
              src={participant.avatar_url}
              alt={participant.username}
              className="w-24 h-24 rounded-full object-cover border-4 border-white"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
              <span className="text-4xl font-bold text-pink-600">
                {participant.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {participant.is_video_enabled && stream && !isVideoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      )}

      {/* Overlay with participant info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none">
        {/* Top bar - Connection quality and host badge */}
        <div className="absolute top-2 right-2 flex items-center gap-2">
          {participant.role === 'host' && (
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
              <Crown className="w-3 h-3" />
              <span className="text-xs font-semibold">Host</span>
            </div>
          )}
          <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
            {getConnectionQualityIcon()}
          </div>
        </div>

        {/* Bottom bar - Name and controls */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm truncate max-w-[150px]">
                {participant.username}
                {isLocal && ' (You)'}
              </span>
              {participant.is_speaking && (
                <div className="flex gap-0.5">
                  <div className="w-1 bg-green-400 rounded-full animate-pulse" style={{ height: '12px' }}></div>
                  <div className="w-1 bg-green-400 rounded-full animate-pulse" style={{ height: '16px', animationDelay: '0.1s' }}></div>
                  <div className="w-1 bg-green-400 rounded-full animate-pulse" style={{ height: '12px', animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!participant.is_muted ? (
                <div className="bg-green-500/80 backdrop-blur-sm p-1.5 rounded-full">
                  <Mic className="w-3 h-3 text-white" />
                </div>
              ) : (
                <div className="bg-red-500/80 backdrop-blur-sm p-1.5 rounded-full">
                  <MicOff className="w-3 h-3 text-white" />
                </div>
              )}

              {!participant.is_video_enabled && (
                <div className="bg-red-500/80 backdrop-blur-sm p-1.5 rounded-full">
                  <VideoOff className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Minimized overlay */}
      {participant.is_minimized && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-white text-center">
            <VideoOff className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Video hidden by host</p>
          </div>
        </div>
      )}
    </div>
  );
};
