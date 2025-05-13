
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/Chat";
import { subscribeToChat } from "@/utils/chatUtils";

interface UseChatSubscriptionProps {
  chatId: string | null;
  userId: string | undefined;
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
}

export const useChatSubscription = ({ chatId, userId, setMessages }: UseChatSubscriptionProps) => {
  const { toast } = useToast();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!chatId || !userId) return;
    
    try {
      console.log('Setting up real-time subscription for messages in chat:', chatId);
      
      // Clean up any existing subscription
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      
      const channel = subscribeToChat(chatId, (newMessage) => {
        // Only add messages from other users, not our own (to avoid duplicates)
        if (newMessage.sender_id !== userId) {
          console.log('Received real-time message:', newMessage);
          setMessages(prev => [...prev, newMessage]);
        }
      });
      
      channelRef.current = channel;
      
    } catch (error: any) {
      console.error('Error setting up realtime subscription:', error);
      toast({
        title: "Realtime Connection Error",
        description: "Unable to receive live updates. Messages will still be sent, but you may need to refresh to see new messages.",
        variant: "destructive",
      });
    }
    
    return () => {
      if (channelRef.current) {
        console.log('Removing channel on cleanup');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [chatId, userId, toast, setMessages]);

  return channelRef;
};
