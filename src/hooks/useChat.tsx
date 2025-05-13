
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Message } from "@/types/Chat";
import { useChatReducer } from "./useChatReducer";
import {
  saveLocalMessages,
  loadLocalMessages,
  deleteLocalMessages,
  fetchChatMessages,
  getOrCreateChat,
  sendMessageToDatabase,
  createLocalMessage,
  subscribeToChat,
  sendMultipleMessagesToDatabase,
  testDatabaseConnection
} from "@/utils/chatUtils";

interface UseChatProps {
  profileId: string;
}

export const useChat = ({ profileId }: UseChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const [state, dispatch] = useChatReducer();
  const [syncAttemptInProgress, setSyncAttemptInProgress] = useState(false);
  
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
    
    const loadMessages = async () => {
      const loadedMessages = await loadLocalMessages(user.id, profileId);
      dispatch({ type: 'SET_LOCAL_MESSAGES', payload: loadedMessages });
    };
    
    loadMessages();
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
        
        // If we have local messages and we're now connected, try to sync them
        if (localMessages.length > 0) {
          synchronizeLocalMessages().catch(console.error);
        }
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
    
    try {
      const channel = subscribeToChat(chatId, (newMessage) => {
        // Only add messages from other users, not our own (to avoid duplicates)
        if (newMessage.sender_id !== user?.id) {
          dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
        }
      });
      
      return () => {
        console.log('Removing channel');
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
      dispatch({ type: 'SET_USING_LOCAL_MODE', payload: true });
      toast({
        title: "Connection Error",
        description: "Failed to set up real-time updates. Using local mode.",
        variant: "destructive",
      });
    }
  }, [chatId, user?.id, usingLocalMode]);

  // Save local messages to localStorage when they change
  useEffect(() => {
    const saveMessages = async () => {
      await saveLocalMessages(user?.id, profileId, localMessages);
    };
    
    saveMessages();
  }, [localMessages, user, profileId]);

  // Periodic sync attempt when in local mode
  useEffect(() => {
    if (!usingLocalMode || !localMessages.length || !chatId || syncAttemptInProgress) return;
    
    // Try to sync every 30 seconds when in local mode
    const syncInterval = setInterval(async () => {
      try {
        setSyncAttemptInProgress(true);
        const isConnected = await testDatabaseConnection();
        
        if (isConnected) {
          console.log("Database connection restored, attempting to sync messages");
          await synchronizeLocalMessages();
          dispatch({ type: 'SET_USING_LOCAL_MODE', payload: false });
          clearInterval(syncInterval);
        }
      } catch (error) {
        console.log("Auto-sync attempt failed:", error);
      } finally {
        setSyncAttemptInProgress(false);
      }
    }, 30000);  // 30 seconds
    
    return () => clearInterval(syncInterval);
  }, [usingLocalMode, localMessages, chatId, syncAttemptInProgress]);

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
    if (!chatId || localMessages.length === 0 || !user) return false;

    try {
      // Try to save all local messages to the database
      const success = await sendMultipleMessagesToDatabase(chatId, localMessages);
      
      if (success) {
        // If successful, clear local messages
        dispatch({ type: 'CLEAR_LOCAL_MESSAGES' });
        deleteLocalMessages(user.id, profileId);
        dispatch({ type: 'SET_USING_LOCAL_MODE', payload: false });
        
        // Refresh messages from database
        await fetchMessages(chatId);
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error synchronizing messages:', error);
      return false;
    }
  };

  // Send a new message
  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return false;
    
    // If we're in local mode due to database issues
    if (usingLocalMode) {
      // Create and store message locally
      const localMessage = await createLocalMessage(content, user.id);
      
      dispatch({ type: 'ADD_LOCAL_MESSAGE', payload: localMessage });
      dispatch({ type: 'ADD_MESSAGE', payload: localMessage });
      
      // Try to synchronize with database if we have a chatId
      if (chatId) {
        setTimeout(() => {
          testDatabaseConnection()
            .then(isConnected => {
              if (isConnected) {
                synchronizeLocalMessages().catch(console.error);
              }
            })
            .catch(console.error);
        }, 2000);
      }
      
      return true;
    }

    // Use database if available
    if (chatId) {
      try {
        const newMessage = await sendMessageToDatabase(chatId, user.id, content);
        dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Fall back to local mode
        dispatch({ type: 'SET_USING_LOCAL_MODE', payload: true });
        
        // Add message to local state
        const localMessage = await createLocalMessage(content, user.id);
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
      const localMessage = await createLocalMessage(content, user.id);
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
