
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sent_at: string;
  read_at: string | null;
}

interface UseChatProps {
  profileId: string;
}

export const useChat = ({ profileId }: UseChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [usingLocalMode, setUsingLocalMode] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Load persisted local messages on component mount
  useEffect(() => {
    if (!user || !profileId) return;
    
    try {
      // Try to load any saved local messages from localStorage
      const savedLocalKey = `chat_local_${user.id}_${profileId}`;
      const savedMessages = localStorage.getItem(savedLocalKey);
      
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages)) {
          setLocalMessages(parsedMessages);
          console.log('Loaded saved local messages:', parsedMessages.length);
        }
      }
    } catch (error) {
      console.error('Error loading saved local messages:', error);
    }
  }, [user, profileId]);

  // Get or create chat with the matched profile
  useEffect(() => {
    const initializeChat = async () => {
      if (!user || !profileId) return;
      
      try {
        setIsLoading(true);
        
        // Get or create a chat with this profile
        const { data, error } = await supabase
          .rpc('get_or_create_private_chat', {
            other_user_id: profileId
          });
          
        if (error) {
          console.error('Error in get_or_create_private_chat:', error);
          // Enable local message mode if we can't get a chat ID
          setUsingLocalMode(true);
          setIsLoading(false);
          return;
        }
        
        setChatId(data);
        console.log('Chat ID:', data);
        
        // Fetch existing messages
        await fetchMessages(data);
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast({
          title: "Error",
          description: "Failed to load chat. Using local mode instead.",
          variant: "destructive",
        });
        setUsingLocalMode(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
  }, [user, profileId, toast, retryCount]);

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!chatId || usingLocalMode) return;
    
    console.log('Setting up real-time subscription for chat:', chatId);
    
    // Create a channel for real-time updates
    const channel = supabase.channel(`chat:${chatId}`);
    
    // Configure the real-time subscription
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('Received new message:', payload);
          const newMessage = payload.new as Message;
          setMessages(prevMessages => {
            // Check if message already exists
            if (prevMessages.find(msg => msg.id === newMessage.id)) {
              return prevMessages;
            }
            return [...prevMessages, newMessage];
          });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });
    
    return () => {
      console.log('Removing channel');
      supabase.removeChannel(channel);
    };
  }, [chatId, user?.id, usingLocalMode]);

  // Save local messages to localStorage when they change
  useEffect(() => {
    if (!user || !profileId || localMessages.length === 0) return;
    
    try {
      const savedLocalKey = `chat_local_${user.id}_${profileId}`;
      localStorage.setItem(savedLocalKey, JSON.stringify(localMessages));
    } catch (error) {
      console.error('Error saving local messages:', error);
    }
  }, [localMessages, user, profileId]);

  // Fetch existing messages
  const fetchMessages = async (chatIdToUse: string) => {
    try {
      console.log('Fetching messages for chat:', chatIdToUse);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatIdToUse)
        .order('sent_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching messages:', error);
        // If database error, switch to local mode
        setUsingLocalMode(true);
        return;
      }
      
      console.log('Fetched messages:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Using local mode.",
        variant: "destructive",
      });
      setUsingLocalMode(true);
    }
  };

  // Retry database connection
  const retryDatabaseConnection = () => {
    setUsingLocalMode(false);
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
      setLocalMessages([]);
      localStorage.removeItem(`chat_local_${user?.id}_${profileId}`);
      setUsingLocalMode(false);
      
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
      const localMessage = {
        id: Date.now().toString(),
        content: content.trim(),
        sender_id: user.id,
        sent_at: new Date().toISOString(),
        read_at: null
      };
      setLocalMessages(prev => [...prev, localMessage]);
      // Also update the main messages array to display the message
      setMessages(prev => [...prev, localMessage]);
      
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
        console.log('Sending message to chat:', chatId);
        const newMessage = {
          chat_id: chatId,
          sender_id: user.id,
          content: content.trim()
        };
        
        const { error, data } = await supabase
          .from('messages')
          .insert([newMessage])
          .select();
        
        if (error) {
          console.error('Error sending message:', error);
          // Fall back to local mode if database fails
          setUsingLocalMode(true);
          // Add message to local state
          const localMessage = {
            id: Date.now().toString(),
            content: content.trim(),
            sender_id: user.id,
            sent_at: new Date().toISOString(),
            read_at: null
          };
          setLocalMessages(prev => [...prev, localMessage]);
          // Also update the messages array to show the message
          setMessages(prev => [...prev, localMessage]);
          
          toast({
            title: "Warning",
            description: "Message sent in local mode only (saved to your device)",
            variant: "default",
          });
          
          return true;
        }
        
        console.log('Message sent successfully:', data);
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        // Fall back to local mode
        setUsingLocalMode(true);
        const localMessage = {
          id: Date.now().toString(),
          content: content.trim(),
          sender_id: user.id,
          sent_at: new Date().toISOString(),
          read_at: null
        };
        setLocalMessages(prev => [...prev, localMessage]);
        setMessages(prev => [...prev, localMessage]);
        
        toast({
          title: "Warning",
          description: "Message sent in local mode only (saved to your device)",
          variant: "default",
        });
        
        return true;
      }
    } else {
      // No chatId available, use local mode
      const localMessage = {
        id: Date.now().toString(),
        content: content.trim(),
        sender_id: user.id,
        sent_at: new Date().toISOString(),
        read_at: null
      };
      setLocalMessages(prev => [...prev, localMessage]);
      setMessages(prev => [...prev, localMessage]);
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
    hasLocalMessages: localMessages.length > 0
  };
};
