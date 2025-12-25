// Live Stream Service for Supabase operations
import { supabase } from '../lib/supabase';
import {
  LiveStream,
  StreamParticipant,
  StreamLayoutState,
  SignalingMessage,
  ChatMessage,
  LayoutType,
} from '../types/liveStream.types';

export class LiveStreamService {
  async createStream(
    hostId: string,
    title: string,
    maxParticipants: number = 9
  ): Promise<LiveStream | null> {
    if (!supabase) {
      console.error('Supabase not initialized');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('live_streams')
        .insert({
          host_id: hostId,
          title,
          status: 'starting',
          max_participants: maxParticipants,
          viewer_count: 0,
          layout_type: 'grid',
        })
        .select()
        .single();

      if (error) throw error;
      return data as LiveStream;
    } catch (error) {
      console.error('Failed to create stream:', error);
      return null;
    }
  }

  async updateStreamStatus(
    streamId: string,
    status: 'idle' | 'starting' | 'live' | 'ended' | 'error'
  ): Promise<boolean> {
    if (!supabase) return false;

    try {
      const updateData: any = { status };
      if (status === 'ended') {
        updateData.ended_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('live_streams')
        .update(updateData)
        .eq('id', streamId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to update stream status:', error);
      return false;
    }
  }

  async joinStream(
    streamId: string,
    userId: string,
    username: string,
    avatarUrl?: string
  ): Promise<StreamParticipant | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('stream_participants')
        .insert({
          stream_id: streamId,
          user_id: userId,
          username,
          avatar_url: avatarUrl,
          role: 'participant',
          is_muted: false,
          is_video_enabled: true,
          is_minimized: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as StreamParticipant;
    } catch (error) {
      console.error('Failed to join stream:', error);
      return null;
    }
  }

  async leaveStream(streamId: string, userId: string): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('stream_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('stream_id', streamId)
        .eq('user_id', userId)
        .is('left_at', null);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to leave stream:', error);
      return false;
    }
  }

  async getStreamParticipants(streamId: string): Promise<StreamParticipant[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('stream_participants')
        .select('*')
        .eq('stream_id', streamId)
        .is('left_at', null)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return (data as StreamParticipant[]) || [];
    } catch (error) {
      console.error('Failed to get stream participants:', error);
      return [];
    }
  }

  async updateParticipantStatus(
    streamId: string,
    userId: string,
    updates: Partial<Pick<StreamParticipant, 'is_muted' | 'is_video_enabled' | 'is_minimized'>>
  ): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('stream_participants')
        .update(updates)
        .eq('stream_id', streamId)
        .eq('user_id', userId)
        .is('left_at', null);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to update participant status:', error);
      return false;
    }
  }

  async updateLayoutState(
    streamId: string,
    layoutType: LayoutType,
    spotlightUserId?: string
  ): Promise<boolean> {
    if (!supabase) return false;

    try {
      // Update live_streams table
      const { error: streamError } = await supabase
        .from('live_streams')
        .update({
          layout_type: layoutType,
          spotlight_user_id: spotlightUserId || null,
        })
        .eq('id', streamId);

      if (streamError) throw streamError;

      // Update stream_layout_state table
      const { error: layoutError } = await supabase
        .from('stream_layout_state')
        .upsert({
          stream_id: streamId,
          layout_type: layoutType,
          spotlight_user_id: spotlightUserId || null,
          updated_at: new Date().toISOString(),
        });

      if (layoutError) throw layoutError;
      return true;
    } catch (error) {
      console.error('Failed to update layout state:', error);
      return false;
    }
  }

  async getStream(streamId: string): Promise<LiveStream | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select('*')
        .eq('id', streamId)
        .single();

      if (error) throw error;
      return data as LiveStream;
    } catch (error) {
      console.error('Failed to get stream:', error);
      return null;
    }
  }

  async sendChatMessage(
    streamId: string,
    userId: string,
    username: string,
    message: string,
    avatarUrl?: string,
    isHost: boolean = false
  ): Promise<ChatMessage | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('stream_chat')
        .insert({
          stream_id: streamId,
          user_id: userId,
          username,
          avatar_url: avatarUrl,
          message,
          is_host: isHost,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ChatMessage;
    } catch (error) {
      console.error('Failed to send chat message:', error);
      return null;
    }
  }

  // Realtime subscriptions
  subscribeToStream(
    streamId: string,
    onParticipantJoin: (participant: StreamParticipant) => void,
    onParticipantLeave: (participant: StreamParticipant) => void,
    onParticipantUpdate: (participant: StreamParticipant) => void,
    onLayoutChange: (layout: StreamLayoutState) => void,
    onChatMessage: (message: ChatMessage) => void
  ) {
    if (!supabase) return null;

    const participantChannel = supabase
      .channel(`stream_participants:${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stream_participants',
          filter: `stream_id=eq.${streamId}`,
        },
        (payload) => {
          onParticipantJoin(payload.new as StreamParticipant);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stream_participants',
          filter: `stream_id=eq.${streamId}`,
        },
        (payload) => {
          const participant = payload.new as StreamParticipant;
          if (participant.left_at) {
            onParticipantLeave(participant);
          } else {
            onParticipantUpdate(participant);
          }
        }
      )
      .subscribe();

    const layoutChannel = supabase
      .channel(`stream_layout:${streamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stream_layout_state',
          filter: `stream_id=eq.${streamId}`,
        },
        (payload) => {
          onLayoutChange(payload.new as StreamLayoutState);
        }
      )
      .subscribe();

    const chatChannel = supabase
      .channel(`stream_chat:${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stream_chat',
          filter: `stream_id=eq.${streamId}`,
        },
        (payload) => {
          onChatMessage(payload.new as ChatMessage);
        }
      )
      .subscribe();

    return {
      participantChannel,
      layoutChannel,
      chatChannel,
      unsubscribe: () => {
        supabase.removeChannel(participantChannel);
        supabase.removeChannel(layoutChannel);
        supabase.removeChannel(chatChannel);
      },
    };
  }

  async updateViewerCount(streamId: string, count: number): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('live_streams')
        .update({ viewer_count: count })
        .eq('id', streamId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to update viewer count:', error);
      return false;
    }
  }
}

export const liveStreamService = new LiveStreamService();
