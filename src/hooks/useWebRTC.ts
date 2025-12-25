// useWebRTC Hook - Manages WebRTC peer connections for live streaming
import { useState, useEffect, useCallback, useRef } from 'react';
import { webrtcService } from '../services/webrtc.service';
import { PeerConnection } from '../types/liveStream.types';

interface UseWebRTCProps {
  streamId: string;
  userId: string;
  onSignal: (peerId: string, signal: any) => void;
  onRemoteStream: (peerId: string, stream: MediaStream) => void;
  onPeerError: (peerId: string, error: Error) => void;
  onPeerClose: (peerId: string) => void;
}

export const useWebRTC = ({
  streamId,
  userId,
  onSignal,
  onRemoteStream,
  onPeerError,
  onPeerClose,
}: UseWebRTCProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize local media stream
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await webrtcService.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      setLocalStream(stream);
      setIsInitialized(true);
      setError(null);
      return stream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access media devices';
      setError(errorMessage);
      console.error('Failed to initialize media:', err);
      throw err;
    }
  }, []);

  // Create a new peer connection
  const createPeer = useCallback(
    (peerId: string, targetUserId: string, initiator: boolean) => {
      if (!localStream) {
        console.error('Local stream not initialized');
        return;
      }

      const peer = webrtcService.createPeer(
        targetUserId,
        peerId,
        initiator,
        localStream,
        (signal) => onSignal(peerId, signal),
        (stream) => {
          onRemoteStream(peerId, stream);
          const peerConnection = webrtcService.getPeer(peerId);
          if (peerConnection) {
            peerConnection.stream = stream;
            setPeers(new Map(webrtcService.getAllPeers()));
          }
        },
        (err) => onPeerError(peerId, err),
        () => onPeerClose(peerId)
      );

      setPeers(new Map(webrtcService.getAllPeers()));
      return peer;
    },
    [localStream, onSignal, onRemoteStream, onPeerError, onPeerClose]
  );

  // Signal a peer with SDP/ICE data
  const signalPeer = useCallback((peerId: string, signal: any) => {
    webrtcService.signal(peerId, signal);
  }, []);

  // Remove a peer connection
  const removePeer = useCallback((peerId: string) => {
    webrtcService.removePeer(peerId);
    setPeers(new Map(webrtcService.getAllPeers()));
  }, []);

  // Toggle video on/off
  const toggleVideo = useCallback(() => {
    const newState = !isVideoEnabled;
    webrtcService.toggleVideo(newState);
    setIsVideoEnabled(newState);
  }, [isVideoEnabled]);

  // Toggle audio on/off
  const toggleAudio = useCallback(() => {
    const newState = !isAudioEnabled;
    webrtcService.toggleAudio(newState);
    setIsAudioEnabled(newState);
  }, [isAudioEnabled]);

  // Switch camera (front/back)
  const switchCamera = useCallback(async () => {
    try {
      await webrtcService.switchCamera();
    } catch (err) {
      console.error('Failed to switch camera:', err);
    }
  }, []);

  // Share screen
  const shareScreen = useCallback(async () => {
    try {
      const screenStream = await webrtcService.shareScreen();
      return screenStream;
    } catch (err) {
      console.error('Failed to share screen:', err);
      return null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      webrtcService.cleanup();
    };
  }, []);

  return {
    localStream,
    isVideoEnabled,
    isAudioEnabled,
    peers,
    isInitialized,
    error,
    initializeMedia,
    createPeer,
    signalPeer,
    removePeer,
    toggleVideo,
    toggleAudio,
    switchCamera,
    shareScreen,
  };
};
