
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Message } from "@/types/Chat";
import { useChatReducer } from "./useChatReducer";
import {
  saveLocalMessages,
  loadLocalMessages,
  fetchChatMessages,
  getOrCreateChat,
  sendMessageToDatabase,
  createLocalMessage,
  subscribeToChat
} from "@/utils/chatUtils";

interface UseChatProps {
  profileId: string;
}

export const useChat = ({ profileId }: UseChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const [state, dispatch] = useChatReducer();
  
  const { 
    messages, 
    localMessages, 
    isLoading, 
    usingLocalMode, 
    chatId,
    hasLocalMessages
  } = state;

  // Load persisted local messages on component mount
  useEffect(() => {
    if (!user || !profileId) return;
    
    const loadedMessages = loadLocalMessages(user.id, profileId);
    dispatch({ type: 'SET_LOCAL_MESSAGES', payload: loadedMessages });
  }, [user, profileId]);

  // Get or create chat with the matched profile
  useEffect(() => {
    const initializeChat = async () => {
      if (!user || !profileId) return;
      
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const chatIdFromDB = await getOrCreateChat(profileId);
        dispatch({ type: 'SET_CHAT_ID', payload: chatIdFromDB });
        
        // Fetch existing messages
        await fetchMessages(chatIdFromDB);
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast({
          title: "Error",
          description: "Failed to load chat. Using local mode instead.",
          variant: "destructive",
        });
        dispatch({ type: 'SET_USING_LOCAL_MODE', payload: true });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    initializeChat();
  }, [user, profileId, toast, retryCount]);

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!chatId || usingLocalMode) return;
    
    const channel = subscribeToChat(chatId, (newMessage) => {
      dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
    });
    
    return () => {
      console.log('Removing channel');
      supabase.removeChannel(channel);
    };
  }, [chatId, user?.id, usingLocalMode]);

  // Save local messages to localStorage when they change
  useEffect(() => {
    saveLocalMessages(user?.id, profileId, localMessages);
  }, [localMessages, user, profileId]);

  // Fetch existing messages
  const fetchMessages = async (chatIdToUse: string) => {
    try {
      const messagesData = await fetchChatMessages(chatIdToUse);
      dispatch({ type: 'SET_MESSAGES', payload: messagesData });
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Using local mode.",
        variant: "destructive",
      });
      dispatch({ type: 'SET_USING_LOCAL_MODE', payload: true });
    }
  };

  // Retry database connection
  const retryDatabaseConnection = () => {
    dispatch({ type: 'SET_USING_LOCAL_MODE', payload: false });
    setRetryCount(prev => prev + 1);
  };

  // Synchronize local messages to database if possible
  const synchronizeLocalMessages = async () => {
    if (!chatId || localMessages.length === 0) return false;

    try {
      // Try to save all local messages to the database
      for (const message of localMessages) {
        const { error } = await supabase
          .from('messages')
          .insert([{
            chat_id: chatId,
            sender_id: message.sender_id,
            content: message.content,
            sent_at: message.sent_at
          }]);
          
        if (error) {
          console.error('Error synchronizing message:', error);
          return false;
        }
      }
      
      // If successful, clear local messages
      dispatch({ type: 'CLEAR_LOCAL_MESSAGES' });
      localStorage.removeItem(`chat_local_${user?.id}_${profileId}`);
      dispatch({ type: 'SET_USING_LOCAL_MODE', payload: false });
      
      toast({
        title: "Success",
        description: `Synchronized ${localMessages.length} messages to the database.`,
        variant: "default",
      });
      
      return true;
    } catch (error) {
      console.error('Error synchronizing messages:', error);
      return false;
    }
  };

  // Send a new message
  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return false;
    
    // If we're in local mode due to database issues, just add to local state
    if (usingLocalMode) {
      const localMessage = createLocalMessage(content, user.id);
      
      dispatch({ type: 'ADD_LOCAL_MESSAGE', payload: localMessage });
      dispatch({ type: 'ADD_MESSAGE', payload: localMessage });
      
      // Try to synchronize with database if we have a chatId
      if (chatId) {
        setTimeout(() => {
          synchronizeLocalMessages().catch(console.error);
        }, 2000);
      }
      
      return true;
    }

    // Use database if available
    if (chatId) {
      try {
        await sendMessageToDatabase(chatId, user.id, content);
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Fall back to local mode
        dispatch({ type: 'SET_USING_LOCAL_MODE', payload: true });
        
        // Add message to local state
        const localMessage = createLocalMessage(content, user.id);
        dispatch({ type: 'ADD_LOCAL_MESSAGE', payload: localMessage });
        dispatch({ type: 'ADD_MESSAGE', payload: localMessage });
        
        toast({
          title: "Warning",
          description: "Message sent in local mode only (saved to your device)",
          variant: "default",
        });
        
        return true;
      }
    } else {
      // No chatId available, use local mode
      const localMessage = createLocalMessage(content, user.id);
      dispatch({ type: 'ADD_LOCAL_MESSAGE', payload: localMessage });
      dispatch({ type: 'ADD_MESSAGE', payload: localMessage });
      return true;
    }
  };

  // Combine database and local messages
  const allMessages = [...messages, ...localMessages.filter(lm => 
    !messages.some(m => m.id === lm.id)
  )].sort((a, b) => {
    // Sort by timestamp
    return new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime();
  });

  return {
    messages: allMessages,
    isLoading,
    sendMessage,
    usingLocalMode,
    retryDatabaseConnection,
    synchronizeLocalMessages,
    hasLocalMessages
  };
};
