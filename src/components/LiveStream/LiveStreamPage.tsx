// LiveStreamPage Component - Main live stream page
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Users as UsersIcon,
  Settings,
  MessageCircle,
  Send,
} from 'lucide-react';
import { LiveStreamGrid } from './LiveStreamGrid';
import { HostControls } from './HostControls';
import { ParticipantList } from './ParticipantList';
import { useLiveStream } from '../../hooks/useLiveStream';
import { useWebRTC } from '../../hooks/useWebRTC';
import { StreamParticipant } from '../../types/liveStream.types';

// Mock user data - in real app, this would come from auth context
// TODO: Replace with actual authentication system
// SECURITY WARNING: Using Math.random() for IDs is not secure for production
const CURRENT_USER = {
  id: 'user_' + Math.random().toString(36).substr(2, 9),
  username: 'Demo User',
  avatarUrl: undefined,
};

export const LiveStreamPage: React.FC = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showHostControls, setShowHostControls] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

  // Initialize live stream management
  const {
    stream,
    participants,
    chatMessages,
    layoutType,
    spotlightUserId,
    isLoading,
    error,
    joinStream,
    leaveStream,
    updateParticipantStatus,
    spotlightParticipant,
    returnToGrid,
    sendMessage,
    updateStreamStatus,
  } = useLiveStream({
    streamId: streamId || '',
    userId: CURRENT_USER.id,
    username: CURRENT_USER.username,
    avatarUrl: CURRENT_USER.avatarUrl,
    isHost: false, // This would be determined by checking if current user is the host
  });

  // Check if current user is host
  const isHost = stream?.host_id === CURRENT_USER.id;

  // Initialize WebRTC
  const {
    localStream,
    isInitialized,
    error: webrtcError,
    initializeMedia,
    createPeer,
    signalPeer,
    removePeer,
    toggleVideo: webrtcToggleVideo,
    toggleAudio: webrtcToggleAudio,
  } = useWebRTC({
    streamId: streamId || '',
    userId: CURRENT_USER.id,
    onSignal: (peerId, signal) => {
      // In real implementation, send signal via Supabase or signaling server
      console.log('Signal for peer:', peerId, signal);
    },
    onRemoteStream: (peerId, stream) => {
      setRemoteStreams((prev) => new Map(prev).set(peerId, stream));
    },
    onPeerError: (peerId, error) => {
      console.error('Peer error:', peerId, error);
    },
    onPeerClose: (peerId) => {
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        next.delete(peerId);
        return next;
      });
    },
  });

  // Initialize media and join stream
  useEffect(() => {
    if (!streamId) return;

    const initialize = async () => {
      try {
        await initializeMedia();
        const joined = await joinStream();
        if (!joined) {
          console.error('Failed to join stream');
        }
      } catch (err) {
        console.error('Failed to initialize:', err);
      }
    };

    initialize();

    return () => {
      leaveStream();
    };
  }, [streamId]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    webrtcToggleVideo();
    setIsVideoEnabled(!isVideoEnabled);
    updateParticipantStatus({ is_video_enabled: !isVideoEnabled });
  }, [isVideoEnabled, webrtcToggleVideo, updateParticipantStatus]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    webrtcToggleAudio();
    setIsAudioEnabled(!isAudioEnabled);
    updateParticipantStatus({ is_muted: !isAudioEnabled });
  }, [isAudioEnabled, webrtcToggleAudio, updateParticipantStatus]);

  // End stream/leave
  const handleEndStream = useCallback(async () => {
    if (isHost) {
      await updateStreamStatus('ended');
    }
    await leaveStream();
    navigate('/');
  }, [isHost, updateStreamStatus, leaveStream, navigate]);

  // Handle participant click (host only)
  const handleParticipantClick = useCallback(
    (participant: StreamParticipant) => {
      if (!isHost) return;
      spotlightParticipant(participant.user_id);
    },
    [isHost, spotlightParticipant]
  );

  // Handle minimize participant
  const handleMinimizeParticipant = useCallback(
    async (userId: string) => {
      const participant = participants.find((p) => p.user_id === userId);
      if (participant) {
        await updateParticipantStatus({ is_minimized: !participant.is_minimized });
      }
    },
    [participants, updateParticipantStatus]
  );

  // Handle remove participant
  const handleRemoveParticipant = useCallback(
    async (userId: string) => {
      // In real implementation, this would trigger a removal through the service
      console.log('Remove participant:', userId);
    },
    []
  );

  // Send chat message
  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatMessage.trim()) return;

      await sendMessage(chatMessage);
      setChatMessage('');
    },
    [chatMessage, sendMessage]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading stream...</p>
        </div>
      </div>
    );
  }

  if (error || webrtcError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-white text-xl mb-2">Error</p>
          <p className="text-gray-400">{error || webrtcError}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">{stream?.title}</h1>
            <p className="text-gray-400 text-sm mt-1">
              {participants.length} participant{participants.length !== 1 ? 's' : ''} •{' '}
              {stream?.viewer_count || 0} viewer{stream?.viewer_count !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-black">
            <LiveStreamGrid
              participants={participants}
              streams={remoteStreams}
              localStream={localStream || undefined}
              currentUserId={CURRENT_USER.id}
              layoutType={layoutType}
              spotlightUserId={spotlightUserId}
              isHost={isHost}
              onParticipantClick={handleParticipantClick}
            />
          </div>

          {/* Control Bar */}
          <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-colors ${
                    isVideoEnabled
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                  {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>

                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-full transition-colors ${
                    isAudioEnabled
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  title={isAudioEnabled ? 'Mute' : 'Unmute'}
                >
                  {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center gap-3">
                {isHost && (
                  <button
                    onClick={() => setShowHostControls(!showHostControls)}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      showHostControls
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="hidden sm:inline">Host Controls</span>
                  </button>
                )}

                <button
                  onClick={() => setShowParticipants(!showParticipants)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    showParticipants
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  <UsersIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Participants</span>
                </button>

                <button
                  onClick={() => setShowChat(!showChat)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    showChat
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="hidden sm:inline">Chat</span>
                </button>

                <button
                  onClick={handleEndStream}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span className="hidden sm:inline">{isHost ? 'End Stream' : 'Leave'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        {(showHostControls || showParticipants || showChat) && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            {showHostControls && isHost && (
              <HostControls
                participants={participants}
                layoutType={layoutType}
                spotlightUserId={spotlightUserId}
                onSpotlightParticipant={spotlightParticipant}
                onReturnToGrid={returnToGrid}
                onMinimizeParticipant={handleMinimizeParticipant}
                onRemoveParticipant={handleRemoveParticipant}
                className="flex-1 overflow-y-auto"
              />
            )}

            {showParticipants && !showHostControls && (
              <ParticipantList
                participants={participants}
                viewerCount={stream?.viewer_count || 0}
                className="flex-1 overflow-y-auto"
              />
            )}

            {showChat && (
              <div className="flex-1 flex flex-col p-4">
                <h3 className="text-white font-semibold mb-4">Chat</h3>
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white text-sm">{msg.username}</span>
                        {msg.is_host && (
                          <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">
                            Host
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm">{msg.message}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-pink-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!chatMessage.trim()}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
