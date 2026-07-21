// useLiveStream Hook - Main hook for live stream state management
import { useState, useEffect, useCallback, useRef } from 'react';
import { liveStreamService } from '../services/liveStream.service';
import {
  LiveStream,
  StreamParticipant,
  ChatMessage,
  LayoutType,
  StreamStatus,
} from '../types/liveStream.types';

interface UseLiveStreamProps {
  streamId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  isHost?: boolean;
}

export const useLiveStream = ({
  streamId,
  userId,
  username,
  avatarUrl,
  isHost = false,
}: UseLiveStreamProps) => {
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [participants, setParticipants] = useState<StreamParticipant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [layoutType, setLayoutType] = useState<LayoutType>('grid');
  const [spotlightUserId, setSpotlightUserId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<any>(null);

  // Load stream data
  const loadStream = useCallback(async () => {
    setIsLoading(true);
    try {
      const streamData = await liveStreamService.getStream(streamId);
      if (streamData) {
        setStream(streamData);
        setLayoutType(streamData.layout_type);
        setSpotlightUserId(streamData.spotlight_user_id);
      } else {
        setError('Stream not found');
      }

      const participantData = await liveStreamService.getStreamParticipants(streamId);
      setParticipants(participantData);
    } catch (err) {
      setError('Failed to load stream');
      console.error('Failed to load stream:', err);
    } finally {
      setIsLoading(false);
    }
  }, [streamId]);

  // Join stream
  const joinStream = useCallback(async () => {
    if (!isHost) {
      const participant = await liveStreamService.joinStream(
        streamId,
        userId,
        username,
        avatarUrl
      );
      if (!participant) {
        setError('Failed to join stream');
        return false;
      }
    }
    return true;
  }, [streamId, userId, username, avatarUrl, isHost]);

  // Leave stream
  const leaveStream = useCallback(async () => {
    if (!isHost) {
      await liveStreamService.leaveStream(streamId, userId);
    }
  }, [streamId, userId, isHost]);

  // Update participant status
  const updateParticipantStatus = useCallback(
    async (updates: Partial<Pick<StreamParticipant, 'is_muted' | 'is_video_enabled' | 'is_minimized'>>) => {
      await liveStreamService.updateParticipantStatus(streamId, userId, updates);
    },
    [streamId, userId]
  );

  // Change layout (host only)
  const changeLayout = useCallback(
    async (newLayoutType: LayoutType, newSpotlightUserId?: string) => {
      if (!isHost) {
        console.warn('Only host can change layout');
        return;
      }

      const success = await liveStreamService.updateLayoutState(
        streamId,
        newLayoutType,
        newSpotlightUserId
      );

      if (success) {
        setLayoutType(newLayoutType);
        setSpotlightUserId(newSpotlightUserId);
      }
    },
    [streamId, isHost]
  );

  // Spotlight a participant (host only)
  const spotlightParticipant = useCallback(
    async (targetUserId: string) => {
      if (!isHost) {
        console.warn('Only host can spotlight participants');
        return;
      }

      await changeLayout('spotlight', targetUserId);
    },
    [isHost, changeLayout]
  );

  // Return to grid view (host only)
  const returnToGrid = useCallback(async () => {
    if (!isHost) {
      console.warn('Only host can change layout');
      return;
    }

    await changeLayout('grid');
  }, [isHost, changeLayout]);

  // Send chat message
  const sendMessage = useCallback(
    async (message: string) => {
      await liveStreamService.sendChatMessage(
        streamId,
        userId,
        username,
        message,
        avatarUrl,
        isHost
      );
    },
    [streamId, userId, username, avatarUrl, isHost]
  );

  // Update stream status (host only)
  const updateStreamStatus = useCallback(
    async (status: StreamStatus) => {
      if (!isHost) {
        console.warn('Only host can update stream status');
        return;
      }

      await liveStreamService.updateStreamStatus(streamId, status);
    },
    [streamId, isHost]
  );

  // Update viewer count
  const updateViewerCount = useCallback(
    async (count: number) => {
      await liveStreamService.updateViewerCount(streamId, count);
    },
    [streamId]
  );

  // Get participant by user ID
  const getParticipant = useCallback(
    (targetUserId: string) => {
      return participants.find((p) => p.user_id === targetUserId);
    },
    [participants]
  );

  // Subscribe to real-time updates
  useEffect(() => {
    if (!streamId) return;

    subscriptionRef.current = liveStreamService.subscribeToStream(
      streamId,
      // On participant join
      (participant) => {
        setParticipants((prev) => {
          const exists = prev.some((p) => p.user_id === participant.user_id);
          if (exists) return prev;
          return [...prev, participant];
        });
      },
      // On participant leave
      (participant) => {
        setParticipants((prev) =>
          prev.filter((p) => p.user_id !== participant.user_id)
        );
      },
      // On participant update
      (participant) => {
        setParticipants((prev) =>
          prev.map((p) => (p.user_id === participant.user_id ? participant : p))
        );
      },
      // On layout change
      (layout) => {
        setLayoutType(layout.layout_type);
        setSpotlightUserId(layout.spotlight_user_id);
      },
      // On chat message
      (message) => {
        setChatMessages((prev) => [...prev, message]);
      }
    );

    return () => {
      if (subscriptionRef.current?.unsubscribe) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [streamId]);

  // Load stream on mount
  useEffect(() => {
    loadStream();
  }, [loadStream]);

  return {
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
    changeLayout,
    spotlightParticipant,
    returnToGrid,
    sendMessage,
    updateStreamStatus,
    updateViewerCount,
    getParticipant,
  };
};
