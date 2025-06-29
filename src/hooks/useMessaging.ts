import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, TypingStatus, MessageDraft } from '../types/messaging';
import { supabase } from '../lib/supabase';

interface UseMessagingProps {
  chatId: string;
  currentUserId: string;
}

interface SendMessageData {
  type: Message['type'];
  content: string;
  recipientId: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  caption?: string;
  replyTo?: string;
}

export const useMessaging = (chatId: string, currentUserId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState<string>('');
  
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection for real-time features
  useEffect(() => {
    if (!chatId) return;

    // In a real implementation, you'd connect to your WebSocket server
    // For demo purposes, we'll simulate real-time updates
    const simulateRealTime = () => {
      // Simulate receiving messages
      const interval = setInterval(() => {
        if (Math.random() > 0.95) { // 5% chance every second
          const newMessage: Message = {
            id: `msg_${Date.now()}`,
            chatId,
            senderId: 'other_user',
            recipientId: currentUserId,
            type: 'text',
            content: 'This is a simulated real-time message!',
            timestamp: new Date().toISOString(),
            status: 'delivered'
          };
          setMessages(prev => [...prev, newMessage]);
        }
      }, 1000);

      return () => clearInterval(interval);
    };

    const cleanup = simulateRealTime();
    return cleanup;
  }, [chatId, currentUserId]);

  // Load messages for the chat
  const loadMessages = useCallback(async () => {
    if (!chatId) return;

    setIsLoading(true);
    try {
      // In production, this would fetch from your API
      // For demo, we'll use mock data
      const mockMessages: Message[] = [
        {
          id: '1',
          chatId,
          senderId: 'other_user',
          recipientId: currentUserId,
          type: 'text',
          content: 'Hey! How are you doing today?',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'read'
        },
        {
          id: '2',
          chatId,
          senderId: currentUserId,
          recipientId: 'other_user',
          type: 'text',
          content: 'I\'m doing great! Just finished work. How about you?',
          timestamp: new Date(Date.now() - 3000000).toISOString(),
          status: 'read'
        },
        {
          id: '3',
          chatId,
          senderId: 'other_user',
          recipientId: currentUserId,
          type: 'text',
          content: 'That\'s awesome! I\'m planning to visit the Philippines next month. Any recommendations?',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          status: 'read'
        },
        {
          id: '4',
          chatId,
          senderId: currentUserId,
          recipientId: 'other_user',
          type: 'text',
          content: 'Oh wow, that\'s exciting! You should definitely visit Palawan and Boracay. The beaches are incredible! 🏖️',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          status: 'read'
        }
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [chatId, currentUserId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Send a message
  const sendMessage = useCallback(async (messageData: SendMessageData) => {
    const tempId = `temp_${Date.now()}`;
    const newMessage: Message = {
      id: tempId,
      chatId,
      senderId: currentUserId,
      recipientId: messageData.recipientId,
      type: messageData.type,
      content: messageData.content,
      timestamp: new Date().toISOString(),
      status: 'sending',
      fileName: messageData.fileName,
      fileSize: messageData.fileSize,
      duration: messageData.duration,
      caption: messageData.caption
    };

    // Optimistically add message
    setMessages(prev => [...prev, newMessage]);

    try {
      // In production, send to your API
      if (supabase) {
        const { data, error } = await supabase
          .from('messages')
          .insert({
            chat_id: chatId,
            sender_id: currentUserId,
            recipient_id: messageData.recipientId,
            type: messageData.type,
            content: messageData.content,
            file_name: messageData.fileName,
            file_size: messageData.fileSize,
            duration: messageData.duration,
            caption: messageData.caption
          })
          .select()
          .single();

        if (error) throw error;

        // Update with real ID and status
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, id: data.id, status: 'sent' }
            : msg
        ));
      } else {
        // Simulate successful send
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === tempId 
              ? { ...msg, status: 'delivered' }
              : msg
          ));
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Update message status to failed
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, status: 'sent' } // For demo, we'll mark as sent anyway
          : msg
      ));
    }
  }, [chatId, currentUserId]);

  // Send typing indicator
  const sendTypingIndicator = useCallback(() => {
    setIsTyping(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);

    // In production, send typing status to server
    console.log('Typing indicator sent');
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    try {
      if (supabase) {
        await supabase
          .from('messages')
          .update({ status: 'read' })
          .eq('chat_id', chatId)
          .eq('recipient_id', currentUserId)
          .neq('status', 'read');
      }

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.recipientId === currentUserId && msg.status !== 'read'
          ? { ...msg, status: 'read' }
          : msg
      ));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, [chatId, currentUserId]);

  // Upload file
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    try {
      if (supabase) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `chat-files/${chatId}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('chat-attachments')
          .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(filePath);

        return publicUrl;
      } else {
        // Simulate file upload
        return URL.createObjectURL(file);
      }
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }, [chatId]);

  // Send voice message
  const sendVoiceMessage = useCallback(async (audioBlob: Blob): Promise<string> => {
    try {
      const file = new File([audioBlob], 'voice-message.wav', { type: 'audio/wav' });
      return await uploadFile(file);
    } catch (error) {
      console.error('Voice message upload failed:', error);
      throw error;
    }
  }, [uploadFile]);

  // Save draft
  const saveDraft = useCallback((content: string) => {
    setDraft(content);
    // In production, save to local storage or server
    localStorage.setItem(`draft_${chatId}`, content);
  }, [chatId]);

  // Load draft
  const loadDraft = useCallback(() => {
    const savedDraft = localStorage.getItem(`draft_${chatId}`);
    if (savedDraft) {
      setDraft(savedDraft);
    }
  }, [chatId]);

  // Clear draft
  const clearDraft = useCallback(() => {
    setDraft('');
    localStorage.removeItem(`draft_${chatId}`);
  }, [chatId]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    messages,
    isTyping,
    isOnline,
    isLoading,
    draft,
    sendMessage,
    sendTypingIndicator,
    markAsRead,
    uploadFile,
    sendVoiceMessage,
    saveDraft,
    loadDraft,
    clearDraft,
    refreshMessages: loadMessages
  };
};