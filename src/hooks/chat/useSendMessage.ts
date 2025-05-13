
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/types/Chat";
import { sendMessageToDatabase } from "@/utils/chatUtils";

interface UseSendMessageProps {
  chatId: string | null;
  userId: string | undefined;
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
}

export const useSendMessage = ({
  chatId,
  userId,
  setMessages
}: UseSendMessageProps) => {
  const { toast } = useToast();

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!userId || !content.trim() || !chatId) {
      console.log('Cannot send message: missing required data', {
        hasUser: !!userId,
        hasContent: !!content.trim(),
        chatId
      });
      return false;
    }

    try {
      console.log('Sending message to chat:', chatId);
      
      const newMessage = await sendMessageToDatabase(chatId, userId, content);
      
      // Add the message to local state immediately for better UX
      setMessages(prev => [...prev, newMessage]);
      return true;
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      toast({
        title: "Message not sent",
        description: "Could not send your message. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { sendMessage };
};
