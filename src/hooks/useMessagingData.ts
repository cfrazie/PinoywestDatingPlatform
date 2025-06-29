import { useState, useEffect, useCallback } from 'react';
import { Chat, ChatUser } from '../types/messaging';
import { supabase } from '../lib/supabase';

export const useMessagingData = (currentUserId: string) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockChats: Chat[] = [
    {
      id: 'chat_1',
      participants: [
        {
          id: currentUserId,
          name: 'You',
          avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
          isOnline: true,
          lastSeen: 'Online'
        },
        {
          id: 'user_2',
          name: 'Maria Santos',
          avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
          isOnline: true,
          lastSeen: 'Online',
          location: 'Manila, Philippines',
          age: 28,
          verified: true
        }
      ],
      lastMessage: {
        id: 'msg_1',
        chatId: 'chat_1',
        senderId: 'user_2',
        recipientId: currentUserId,
        type: 'text',
        content: 'That sounds amazing! I\'d love to learn more about your culture too 😊',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        status: 'delivered'
      },
      unreadCount: 2,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 300000).toISOString(),
      isArchived: false,
      isPinned: true,
      isBlocked: false,
      chatType: 'direct'
    },
    {
      id: 'chat_2',
      participants: [
        {
          id: currentUserId,
          name: 'You',
          avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
          isOnline: true,
          lastSeen: 'Online'
        },
        {
          id: 'user_3',
          name: 'David Chen',
          avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg',
          isOnline: false,
          lastSeen: '2 hours ago',
          location: 'Los Angeles, USA',
          age: 32,
          verified: true
        }
      ],
      lastMessage: {
        id: 'msg_2',
        chatId: 'chat_2',
        senderId: currentUserId,
        recipientId: 'user_3',
        type: 'text',
        content: 'Thanks for the travel tips! I\'ll definitely check out those places.',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'read'
      },
      unreadCount: 0,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
      isArchived: false,
      isPinned: false,
      isBlocked: false,
      chatType: 'direct'
    },
    {
      id: 'chat_3',
      participants: [
        {
          id: currentUserId,
          name: 'You',
          avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
          isOnline: true,
          lastSeen: 'Online'
        },
        {
          id: 'user_4',
          name: 'Sarah Johnson',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
          isOnline: true,
          lastSeen: 'Online',
          location: 'Toronto, Canada',
          age: 29,
          verified: false
        }
      ],
      lastMessage: {
        id: 'msg_3',
        chatId: 'chat_3',
        senderId: 'user_4',
        recipientId: currentUserId,
        type: 'image',
        content: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        status: 'delivered',
        caption: 'Beautiful sunset from my balcony!'
      },
      unreadCount: 1,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 14400000).toISOString(),
      isArchived: false,
      isPinned: false,
      isBlocked: false,
      chatType: 'direct'
    },
    {
      id: 'chat_4',
      participants: [
        {
          id: currentUserId,
          name: 'You',
          avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
          isOnline: true,
          lastSeen: 'Online'
        },
        {
          id: 'user_5',
          name: 'Carlos Rodriguez',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
          isOnline: false,
          lastSeen: '1 day ago',
          location: 'Madrid, Spain',
          age: 35,
          verified: true
        }
      ],
      lastMessage: {
        id: 'msg_4',
        chatId: 'chat_4',
        senderId: currentUserId,
        recipientId: 'user_5',
        type: 'voice',
        content: 'voice_message_url',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'read',
        duration: 15
      },
      unreadCount: 0,
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      isArchived: false,
      isPinned: false,
      isBlocked: false,
      chatType: 'direct'
    }
  ];

  // Load chats
  const loadChats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (supabase) {
        // In production, fetch from your API
        const { data, error } = await supabase
          .from('chats')
          .select(`
            *,
            participants:chat_participants(
              user:users(*)
            ),
            last_message:messages(*)
          `)
          .eq('chat_participants.user_id', currentUserId)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        // Transform data to match our types
        const transformedChats = data?.map(chat => ({
          ...chat,
          participants: chat.participants.map((p: any) => p.user),
          lastMessage: chat.last_message?.[0]
        })) || [];

        setChats(transformedChats);
      } else {
        // Use mock data for demo
        setTimeout(() => {
          setChats(mockChats);
          setIsLoading(false);
        }, 500);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chats');
      console.error('Failed to load chats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  // Create new chat
  const createNewChat = useCallback(async (otherUserId: string): Promise<Chat> => {
    try {
      if (supabase) {
        // Check if chat already exists
        const { data: existingChat } = await supabase
          .from('chats')
          .select('*')
          .eq('type', 'direct')
          .contains('participant_ids', [currentUserId, otherUserId])
          .single();

        if (existingChat) {
          return existingChat;
        }

        // Create new chat
        const { data: newChat, error } = await supabase
          .from('chats')
          .insert({
            type: 'direct',
            participant_ids: [currentUserId, otherUserId],
            created_by: currentUserId
          })
          .select()
          .single();

        if (error) throw error;

        // Add participants
        await supabase
          .from('chat_participants')
          .insert([
            { chat_id: newChat.id, user_id: currentUserId },
            { chat_id: newChat.id, user_id: otherUserId }
          ]);

        // Refresh chats
        await loadChats();

        return newChat;
      } else {
        // Mock new chat creation
        const newChat: Chat = {
          id: `chat_${Date.now()}`,
          participants: [
            {
              id: currentUserId,
              name: 'You',
              avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
              isOnline: true,
              lastSeen: 'Online'
            },
            {
              id: otherUserId,
              name: 'New Contact',
              avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg',
              isOnline: false,
              lastSeen: '5 minutes ago'
            }
          ],
          unreadCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isArchived: false,
          isPinned: false,
          isBlocked: false,
          chatType: 'direct'
        };

        setChats(prev => [newChat, ...prev]);
        return newChat;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat');
      throw err;
    }
  }, [currentUserId, loadChats]);

  // Archive chat
  const archiveChat = useCallback(async (chatId: string) => {
    try {
      if (supabase) {
        const { error } = await supabase
          .from('chats')
          .update({ is_archived: true })
          .eq('id', chatId);

        if (error) throw error;
      }

      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, isArchived: true }
          : chat
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive chat');
      throw err;
    }
  }, []);

  // Pin/unpin chat
  const togglePinChat = useCallback(async (chatId: string) => {
    try {
      const chat = chats.find(c => c.id === chatId);
      if (!chat) return;

      const newPinnedState = !chat.isPinned;

      if (supabase) {
        const { error } = await supabase
          .from('chats')
          .update({ is_pinned: newPinnedState })
          .eq('id', chatId);

        if (error) throw error;
      }

      setChats(prev => prev.map(c => 
        c.id === chatId 
          ? { ...c, isPinned: newPinnedState }
          : c
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update chat');
      throw err;
    }
  }, [chats]);

  // Delete chat
  const deleteChat = useCallback(async (chatId: string) => {
    try {
      if (supabase) {
        const { error } = await supabase
          .from('chats')
          .delete()
          .eq('id', chatId);

        if (error) throw error;
      }

      setChats(prev => prev.filter(chat => chat.id !== chatId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chat');
      throw err;
    }
  }, []);

  // Block user
  const blockUser = useCallback(async (userId: string) => {
    try {
      if (supabase) {
        const { error } = await supabase
          .from('blocked_users')
          .insert({
            user_id: currentUserId,
            blocked_user_id: userId,
            blocked_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Update local state
      setChats(prev => prev.map(chat => {
        const isUserInChat = chat.participants.some(p => p.id === userId);
        return isUserInChat ? { ...chat, isBlocked: true } : chat;
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to block user');
      throw err;
    }
  }, [currentUserId]);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Refresh chats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      loadChats();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [loadChats]);

  return {
    chats,
    isLoading,
    error,
    createNewChat,
    archiveChat,
    togglePinChat,
    deleteChat,
    blockUser,
    refreshChats: loadChats
  };
};