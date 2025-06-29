import { useState, useEffect, useCallback, useRef } from 'react';
import { VideoCallState, CallType, CallStatus, CallQuality, ConnectionStatus } from '../types/video';
import { supabase } from '../lib/supabase';

interface UseVideoCallReturn {
  callState: CallStatus;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isSpeakerEnabled: boolean;
  callQuality: CallQuality;
  connectionStatus: ConnectionStatus;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isCallInProgress: boolean;
  toggleVideo: () => void;
  toggleAudio: () => void;
  toggleSpeaker: () => void;
  switchCamera: () => void;
  acceptCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  endCall: () => Promise<void>;
  initiateCall: (targetUserId: string, callType: CallType) => Promise<string>;
  sendReaction: (emoji: string) => void;
}

export const useVideoCall = (callId: string, userId: string): UseVideoCallReturn => {
  const [callState, setCallState] = useState<CallStatus>('pending');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(false);
  const [callQuality, setCallQuality] = useState<CallQuality>('good');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallInProgress, setIsCallInProgress] = useState(false);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize WebRTC peer connection
  const initializePeerConnection = useCallback(() => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    peerConnection.oniceconnectionstatechange = () => {
      const state = peerConnection.iceConnectionState;
      switch (state) {
        case 'connected':
        case 'completed':
          setConnectionStatus('connected');
          setCallState('connected');
          break;
        case 'disconnected':
          setConnectionStatus('reconnecting');
          break;
        case 'failed':
        case 'closed':
          setConnectionStatus('disconnected');
          setCallState('ended');
          break;
        default:
          setConnectionStatus('connecting');
      }
    };

    peerConnection.ontrack = (event) => {
      const [stream] = event.streams;
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, []);

  // Get user media
  const getUserMedia = useCallback(async (video: boolean = true, audio: boolean = true) => {
    try {
      const constraints: MediaStreamConstraints = {
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false,
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error('Failed to get user media:', error);
      throw error;
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle speaker
  const toggleSpeaker = useCallback(() => {
    setIsSpeakerEnabled(prev => !prev);
    // In a real implementation, you would change the audio output device
  }, []);

  // Switch camera
  const switchCamera = useCallback(async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        const constraints = videoTrack.getConstraints() as MediaTrackConstraints;
        const currentFacingMode = constraints.facingMode;
        const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: newFacingMode },
            audio: true
          });

          // Replace video track
          const newVideoTrack = newStream.getVideoTracks()[0];
          const sender = peerConnectionRef.current?.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );

          if (sender && newVideoTrack) {
            await sender.replaceTrack(newVideoTrack);
          }

          // Update local stream
          videoTrack.stop();
          localStream.removeTrack(videoTrack);
          localStream.addTrack(newVideoTrack);

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
        } catch (error) {
          console.error('Failed to switch camera:', error);
        }
      }
    }
  }, [localStream]);

  // Accept call
  const acceptCall = useCallback(async () => {
    try {
      setCallState('connecting');
      const stream = await getUserMedia(true, true);
      const peerConnection = initializePeerConnection();

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // In a real implementation, you would handle signaling here
      setTimeout(() => {
        setCallState('connected');
        setConnectionStatus('connected');
        setIsCallInProgress(true);
      }, 2000);

    } catch (error) {
      console.error('Failed to accept call:', error);
      setCallState('ended');
    }
  }, [getUserMedia, initializePeerConnection]);

  // Reject call
  const rejectCall = useCallback(async () => {
    setCallState('ended');
    setIsCallInProgress(false);
    
    // Clean up resources
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  }, [localStream]);

  // End call
  const endCall = useCallback(async () => {
    setCallState('ended');
    setIsCallInProgress(false);
    
    // Clean up resources
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // In a real implementation, you would notify the server
    if (supabase) {
      try {
        await supabase
          .from('call_records')
          .update({ 
            status: 'completed',
            end_time: new Date().toISOString()
          })
          .eq('id', callId);
      } catch (error) {
        console.error('Failed to update call record:', error);
      }
    }
  }, [callId, localStream, remoteStream]);

  // Initiate call
  const initiateCall = useCallback(async (targetUserId: string, callType: CallType): Promise<string> => {
    try {
      setCallState('ringing');
      setIsCallInProgress(true);

      // Generate call ID
      const newCallId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Get user media
      const stream = await getUserMedia(callType === 'video', true);
      const peerConnection = initializePeerConnection();

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // In a real implementation, you would:
      // 1. Send call invitation to target user via signaling server
      // 2. Handle ICE candidates exchange
      // 3. Create and exchange SDP offers/answers

      // For demo, simulate call progression
      setTimeout(() => {
        setCallState('connecting');
      }, 2000);

      setTimeout(() => {
        setCallState('connected');
        setConnectionStatus('connected');
      }, 4000);

      // Save call record
      if (supabase) {
        try {
          await supabase
            .from('call_records')
            .insert({
              id: newCallId,
              initiator_id: userId,
              target_id: targetUserId,
              call_type: callType,
              status: 'ringing',
              start_time: new Date().toISOString()
            });
        } catch (error) {
          console.error('Failed to save call record:', error);
        }
      }

      return newCallId;
    } catch (error) {
      console.error('Failed to initiate call:', error);
      setCallState('ended');
      setIsCallInProgress(false);
      throw error;
    }
  }, [userId, getUserMedia, initializePeerConnection]);

  // Send reaction
  const sendReaction = useCallback((emoji: string) => {
    // In a real implementation, you would send this via data channel or signaling
    console.log('Sending reaction:', emoji);
    
    // Show reaction animation locally
    // This would be handled by the UI component
  }, []);

  // Monitor call quality
  useEffect(() => {
    if (peerConnectionRef.current && callState === 'connected') {
      const interval = setInterval(async () => {
        try {
          const stats = await peerConnectionRef.current!.getStats();
          let packetsLost = 0;
          let packetsReceived = 0;

          stats.forEach((report) => {
            if (report.type === 'inbound-rtp' && report.kind === 'video') {
              packetsLost += report.packetsLost || 0;
              packetsReceived += report.packetsReceived || 0;
            }
          });

          const lossRate = packetsReceived > 0 ? packetsLost / packetsReceived : 0;
          
          if (lossRate < 0.02) {
            setCallQuality('excellent');
          } else if (lossRate < 0.05) {
            setCallQuality('good');
          } else {
            setCallQuality('poor');
          }
        } catch (error) {
          console.error('Failed to get call stats:', error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [callState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [localStream]);

  return {
    callState,
    isVideoEnabled,
    isAudioEnabled,
    isSpeakerEnabled,
    callQuality,
    connectionStatus,
    localStream,
    remoteStream,
    isCallInProgress,
    toggleVideo,
    toggleAudio,
    toggleSpeaker,
    switchCamera,
    acceptCall,
    rejectCall,
    endCall,
    initiateCall,
    sendReaction
  };
};