
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserConversationMessage } from '@/types/Chat';
import { v4 as uuidv4 } from 'uuid';

interface UseAIChatProps {
  sessionId?: string;
}

export function useAIChat({ sessionId }: UseAIChatProps = {}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<UserConversationMessage[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(sessionId || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create a new session if none exists
  const createNewSession = useCallback(async (title: string = "New Conversation"): Promise<string> => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      // Generate a new session ID
      const newSessionId = uuidv4();
      
      // Create initial system message to identify the session
      await supabase
        .from('user_conversations')
        .insert({
          user_id: user.id,
          session_id: newSessionId,
          message_type: 'ai' as const,
          content: `Session started: ${title}`,
          summary_flag: true // This marks it as a system message
        });
      
      return newSessionId;
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create a new conversation session');
      return '';
    }
  }, [user]);

  // Load existing session or create a new one
  const loadOrCreateSession = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let activeSessionId = currentSessionId;
      
      // If no session ID is provided, create a new one
      if (!activeSessionId) {
        activeSessionId = await createNewSession();
        setCurrentSessionId(activeSessionId);
      }
      
      // Load messages for the session
      if (activeSessionId) {
        const { data: messageData, error: messagesError } = await supabase
          .from('user_conversations')
          .select('*')
          .eq('user_id', user.id)
          .eq('session_id', activeSessionId)
          .order('timestamp', { ascending: true });
        
        if (messagesError) throw messagesError;
        
        if (messageData) {
          // Ensure messageData has the correct type
          const typedMessages = messageData.map(msg => ({
            ...msg,
            message_type: msg.message_type as 'human' | 'ai'
          }));
          
          setMessages(typedMessages);
        }
      }
      
    } catch (err) {
      console.error('Error loading conversation session:', err);
      setError('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  }, [user, currentSessionId, createNewSession]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!user || !currentSessionId) {
      if (!currentSessionId && user) {
        // Create a session if we don't have one yet
        const newSessionId = await createNewSession();
        setCurrentSessionId(newSessionId);
        return sendMessage(content); // Retry with the new session
      }
      return false;
    }
    
    try {
      // Add user message to DB
      const userMessage = {
        user_id: user.id,
        session_id: currentSessionId,
        content,
        message_type: 'human' as const,
      };
      
      const { error: sendError } = await supabase
        .from('user_conversations')
        .insert([userMessage]);
      
      if (sendError) throw sendError;
      
      // Optimistically update UI
      setMessages(prev => [
        ...prev,
        {
          ...userMessage,
          message_id: uuidv4(), // Temporary ID that will be replaced when we fetch from DB
          timestamp: new Date().toISOString(),
          summary_flag: false
        } as UserConversationMessage
      ]);
      
      // Here we would normally make an API call to get AI response
      // For now, we'll simulate a basic AI response
      setTimeout(async () => {
        const aiResponse = {
          user_id: user.id,
          session_id: currentSessionId,
          content: getSimulatedResponse(content),
          message_type: 'ai' as const,
        };
        
        const { error: aiError } = await supabase
          .from('user_conversations')
          .insert([aiResponse]);
        
        if (aiError) {
          console.error('Error saving AI response:', aiError);
          return;
        }
        
        // Refresh messages from database to get the real IDs
        loadOrCreateSession();
      }, 1000);
      
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return false;
    }
  }, [user, currentSessionId, createNewSession, loadOrCreateSession]);

  // Simulated AI response function - this would normally be replaced with a real API call
  const getSimulatedResponse = (userMessage: string) => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
      return "Hello! I'm Olivia, your relocation assistant. How can I help you today?";
    }
    
    if (lowerCaseMessage.includes('city') || lowerCaseMessage.includes('move')) {
      return "Moving to a new city is exciting! I can help you find the perfect location based on your preferences.";
    }
    
    if (lowerCaseMessage.includes('housing') || lowerCaseMessage.includes('apartment')) {
      return "Finding housing can be challenging! I can provide resources for rental options and connect you with local agents in your destination city.";
    }
    
    if (lowerCaseMessage.includes('job') || lowerCaseMessage.includes('work')) {
      return "Looking for work in your new location? I can suggest job boards specific to your industry and city of interest.";
    }
    
    return "Thanks for your message! I'm here to help with your relocation needs. Could you provide more details about what you're looking for?";
  };

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!currentSessionId || !user) return;
    
    const channel = supabase
      .channel('user-conversations-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_conversations',
        filter: `session_id=eq.${currentSessionId}`
      }, (payload) => {
        const newMessage = payload.new as UserConversationMessage;
        // Only add message if it's not already in our list and belongs to current user
        if (newMessage.user_id === user.id) {
          setMessages(currentMessages => {
            if (currentMessages.find(m => m.message_id === newMessage.message_id)) {
              return currentMessages;
            }
            // Ensure message_type is correctly typed
            const typedMessage: UserConversationMessage = {
              ...newMessage,
              message_type: newMessage.message_type as 'human' | 'ai'
            };
            return [...currentMessages, typedMessage];
          });
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentSessionId, user]);

  // Initial load
  useEffect(() => {
    if (user) {
      loadOrCreateSession();
    }
  }, [user, loadOrCreateSession]);

  return {
    messages,
    sessionId: currentSessionId,
    isLoading,
    error,
    sendMessage,
    createNewSession
  };
}
