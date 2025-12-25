// WebRTC Service for peer-to-peer connections
import SimplePeer from 'simple-peer';
import { PeerConnection } from '../types/liveStream.types';

export class WebRTCService {
  private peers: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private config: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
  };

  async getUserMedia(constraints: MediaStreamConstraints = {
    video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
  }): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('Failed to get user media:', error);
      throw new Error('Camera/microphone access denied');
    }
  }

  createPeer(
    userId: string,
    peerId: string,
    initiator: boolean,
    stream: MediaStream,
    onSignal: (signal: any) => void,
    onStream: (stream: MediaStream) => void,
    onError: (error: Error) => void,
    onClose: () => void
  ): SimplePeer.Instance {
    const peer = new SimplePeer({
      initiator,
      trickle: true,
      config: this.config,
      stream,
    });

    peer.on('signal', (signal) => {
      onSignal(signal);
    });

    peer.on('stream', (remoteStream) => {
      onStream(remoteStream);
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      onError(err);
    });

    peer.on('close', () => {
      onClose();
      this.removePeer(peerId);
    });

    const peerConnection: PeerConnection = {
      peer_id: peerId,
      user_id: userId,
      peer,
    };

    this.peers.set(peerId, peerConnection);
    return peer;
  }

  signal(peerId: string, signal: any): void {
    const peerConnection = this.peers.get(peerId);
    if (peerConnection && peerConnection.peer) {
      try {
        peerConnection.peer.signal(signal);
      } catch (error) {
        console.error('Failed to signal peer:', error);
      }
    }
  }

  removePeer(peerId: string): void {
    const peerConnection = this.peers.get(peerId);
    if (peerConnection) {
      try {
        peerConnection.peer.destroy();
      } catch (error) {
        console.error('Error destroying peer:', error);
      }
      this.peers.delete(peerId);
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getPeer(peerId: string): PeerConnection | undefined {
    return this.peers.get(peerId);
  }

  getAllPeers(): Map<string, PeerConnection> {
    return this.peers;
  }

  async switchCamera(): Promise<void> {
    if (!this.localStream) return;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (!videoTrack) return;

    const currentFacingMode = videoTrack.getSettings().facingMode || 'user';
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: true,
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      
      // Replace track in all peer connections
      this.peers.forEach((peerConnection) => {
        const sender = peerConnection.peer._pc
          ?.getSenders()
          .find((s: RTCRtpSender) => s.track?.kind === 'video');
        
        if (sender && newVideoTrack) {
          sender.replaceTrack(newVideoTrack);
        }
      });

      // Replace local track
      videoTrack.stop();
      this.localStream.removeTrack(videoTrack);
      this.localStream.addTrack(newVideoTrack);
    } catch (error) {
      console.error('Failed to switch camera:', error);
    }
  }

  async shareScreen(): Promise<MediaStream | null> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      });

      return screenStream;
    } catch (error) {
      console.error('Failed to share screen:', error);
      return null;
    }
  }

  cleanup(): void {
    // Stop all tracks in local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Close all peer connections
    this.peers.forEach((peerConnection) => {
      try {
        peerConnection.peer.destroy();
      } catch (error) {
        console.error('Error destroying peer during cleanup:', error);
      }
    });
    
    this.peers.clear();
  }
}

export const webrtcService = new WebRTCService();
