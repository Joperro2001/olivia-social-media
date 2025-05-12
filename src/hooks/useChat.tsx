
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
          
        if (error) throw error;
        
        setChatId(data);
        
        // Fetch existing messages
        await fetchMessages(data);
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast({
          title: "Error",
          description: "Failed to load chat. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
  }, [user, profileId, toast]);

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!chatId) return;
    
    // Using a properly typed channel name that Supabase accepts
    // TypeScript requires explicit type casting for custom channel names
    const channelName = `room_${chatId}`;
    const channel = supabase.channel(channelName as never)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
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
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  // Fetch existing messages
  const fetchMessages = async (chatIdToUse: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatIdToUse)
        .order('sent_at', { ascending: true });
      
      if (error) throw error;
      
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Send a new message
  const sendMessage = async (content: string) => {
    if (!user || !chatId || !content.trim()) return;
    
    try {
      const newMessage = {
        chat_id: chatId,
        sender_id: user.id,
        content: content.trim()
      };
      
      const { error } = await supabase
        .from('messages')
        .insert([newMessage]);
      
      if (error) throw error;
      
      // Message will be added via the real-time subscription
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async () => {
    if (!user || !chatId) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('chat_id', chatId)
        .neq('sender_id', user.id)
        .is('read_at', null);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    markMessagesAsRead
  };
};
