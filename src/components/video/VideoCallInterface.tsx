import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, 
  Settings, Maximize2, Minimize2, MessageCircle, 
  Camera, CameraOff, Volume2, VolumeX, MoreVertical,
  Users, Share, Heart, Gift
} from 'lucide-react';
import Button from '../ui/Button';
import OptimizedImage from '../ui/OptimizedImage';
import { ChatUser } from '../../types/messaging';
import { VideoCallState, CallQuality } from '../../types/video';
import { useVideoCall } from '../../hooks/useVideoCall';

interface VideoCallInterfaceProps {
  callId: string;
  currentUser: ChatUser;
  otherUser: ChatUser;
  isIncoming?: boolean;
  onEndCall: () => void;
  onMinimize?: () => void;
  onToggleChat?: () => void;
}

const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({
  callId,
  currentUser,
  otherUser,
  isIncoming = false,
  onEndCall,
  onMinimize,
  onToggleChat
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    callState,
    isVideoEnabled,
    isAudioEnabled,
    isSpeakerEnabled,
    callQuality,
    connectionStatus,
    toggleVideo,
    toggleAudio,
    toggleSpeaker,
    switchCamera,
    acceptCall,
    rejectCall,
    endCall,
    sendReaction
  } = useVideoCall(callId, currentUser.id);

  // Call duration timer
  useEffect(() => {
    if (callState === 'connected') {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callState]);

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (callState === 'connected') {
          setShowControls(false);
        }
      }, 3000);
    };

    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [callState]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAcceptCall = () => {
    acceptCall();
  };

  const handleRejectCall = () => {
    rejectCall();
    onEndCall();
  };

  const handleEndCall = () => {
    endCall();
    onEndCall();
  };

  const getQualityColor = (quality: CallQuality) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getQualityBars = (quality: CallQuality) => {
    const bars = quality === 'excellent' ? 4 : quality === 'good' ? 3 : quality === 'poor' ? 2 : 1;
    return Array.from({ length: 4 }, (_, i) => (
      <div
        key={i}
        className={`w-1 h-3 rounded-full ${
          i < bars ? getQualityColor(quality).replace('text-', 'bg-') : 'bg-gray-300'
        }`}
      />
    ));
  };

  // Incoming call screen
  if (isIncoming && callState === 'ringing') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center z-50"
      >
        <div className="text-center text-white">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-8"
          >
            <OptimizedImage
              src={otherUser.avatar}
              alt={otherUser.name}
              className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-2xl"
              width={128}
              height={128}
            />
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-2">{otherUser.name}</h2>
          <p className="text-blue-200 mb-8">Incoming video call...</p>
          
          <div className="flex items-center justify-center space-x-8">
            <Button
              variant="outline"
              size="lg"
              onClick={handleRejectCall}
              className="bg-red-500 border-red-500 text-white hover:bg-red-600 rounded-full w-16 h-16 p-0"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
            
            <Button
              variant="primary"
              size="lg"
              onClick={handleAcceptCall}
              className="bg-green-500 hover:bg-green-600 rounded-full w-16 h-16 p-0"
            >
              <Video className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed inset-0 bg-black z-50 flex flex-col ${
        isFullscreen ? '' : 'inset-4 rounded-lg overflow-hidden'
      }`}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Remote Video */}
      <div className="flex-1 relative">
        <video
          ref={remoteVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
        />
        
        {/* Connection Status */}
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-black bg-opacity-50 rounded-full px-3 py-1">
            {getQualityBars(callQuality)}
          </div>
          <div className="bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full">
            {connectionStatus}
          </div>
        </div>

        {/* Call Duration */}
        {callState === 'connected' && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full">
            {formatDuration(callDuration)}
          </div>
        )}

        {/* User Info */}
        <div className="absolute bottom-20 left-4 text-white">
          <h3 className="text-xl font-semibold">{otherUser.name}</h3>
          <p className="text-sm opacity-75">{otherUser.location}</p>
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <motion.div
          drag
          dragConstraints={{ left: 0, right: 200, top: 0, bottom: 200 }}
          className="absolute top-4 right-4 w-32 h-24 bg-gray-900 rounded-lg overflow-hidden border-2 border-white shadow-lg cursor-move"
        >
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <CameraOff className="w-6 h-6 text-white" />
            </div>
          )}
        </motion.div>
      </div>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6"
          >
            <div className="flex items-center justify-center space-x-4">
              {/* Audio Toggle */}
              <Button
                variant={isAudioEnabled ? "outline" : "primary"}
                size="lg"
                onClick={toggleAudio}
                className={`rounded-full w-12 h-12 p-0 ${
                  isAudioEnabled 
                    ? 'bg-white bg-opacity-20 text-white border-white border-opacity-30' 
                    : 'bg-red-500 text-white'
                }`}
              >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>

              {/* Video Toggle */}
              <Button
                variant={isVideoEnabled ? "outline" : "primary"}
                size="lg"
                onClick={toggleVideo}
                className={`rounded-full w-12 h-12 p-0 ${
                  isVideoEnabled 
                    ? 'bg-white bg-opacity-20 text-white border-white border-opacity-30' 
                    : 'bg-red-500 text-white'
                }`}
              >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>

              {/* End Call */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleEndCall}
                className="bg-red-500 hover:bg-red-600 rounded-full w-12 h-12 p-0"
              >
                <PhoneOff className="w-5 h-5" />
              </Button>

              {/* Speaker Toggle */}
              <Button
                variant="outline"
                size="lg"
                onClick={toggleSpeaker}
                className={`rounded-full w-12 h-12 p-0 ${
                  isSpeakerEnabled 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white bg-opacity-20 text-white border-white border-opacity-30'
                }`}
              >
                {isSpeakerEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>

              {/* Switch Camera */}
              <Button
                variant="outline"
                size="lg"
                onClick={switchCamera}
                className="rounded-full w-12 h-12 p-0 bg-white bg-opacity-20 text-white border-white border-opacity-30"
              >
                <Camera className="w-5 h-5" />
              </Button>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center justify-center space-x-4 mt-4">
              {/* Chat Toggle */}
              {onToggleChat && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleChat}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
              )}

              {/* Send Reaction */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => sendReaction('❤️')}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <Heart className="w-4 h-4 mr-2" />
                React
              </Button>

              {/* Send Gift */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <Gift className="w-4 h-4 mr-2" />
                Gift
              </Button>

              {/* Settings */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>

              {/* Minimize */}
              {onMinimize && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMinimize}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <Minimize2 className="w-4 h-4 mr-2" />
                  Minimize
                </Button>
              )}

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-0 right-0 w-80 h-full bg-black bg-opacity-90 text-white p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Call Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
                className="text-white"
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Video Quality</h4>
                <div className="space-y-2">
                  {['HD (720p)', 'SD (480p)', 'Low (360p)'].map((quality) => (
                    <label key={quality} className="flex items-center space-x-2">
                      <input type="radio" name="quality" className="text-blue-500" />
                      <span className="text-sm">{quality}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Audio Settings</h4>
                <div className="space-y-2">
                  <label className="flex items-center justify-between">
                    <span className="text-sm">Noise Cancellation</span>
                    <input type="checkbox" className="text-blue-500" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm">Echo Cancellation</span>
                    <input type="checkbox" className="text-blue-500" defaultChecked />
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Connection Info</h4>
                <div className="text-sm space-y-1 text-gray-300">
                  <div>Quality: {callQuality}</div>
                  <div>Status: {connectionStatus}</div>
                  <div>Duration: {formatDuration(callDuration)}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call State Overlay */}
      {callState !== 'connected' && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="mb-4">
              <OptimizedImage
                src={otherUser.avatar}
                alt={otherUser.name}
                className="w-24 h-24 rounded-full mx-auto border-2 border-white"
                width={96}
                height={96}
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">{otherUser.name}</h3>
            <p className="text-gray-300">
              {callState === 'connecting' && 'Connecting...'}
              {callState === 'ringing' && 'Calling...'}
              {callState === 'ended' && 'Call ended'}
            </p>
            {callState === 'connecting' && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default VideoCallInterface;