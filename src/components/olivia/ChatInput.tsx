
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<boolean>;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage
}) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isSending) {
      setIsSending(true);
      
      try {
        console.log("Sending message:", message);
        const success = await onSendMessage(message);
        
        if (success) {
          setMessage("");
        } else {
          toast({
            title: "Failed to send message",
            description: "Please try again",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSending(false);
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white p-2 border-2 border-primary shadow-md rounded-full">
      <Button 
        type="button" 
        size="icon" 
        variant="ghost"
        className="rounded-full"
      >
        <Paperclip className="h-4 w-4 text-gray-500" />
      </Button>
      
      <Input 
        type="text" 
        value={message} 
        onChange={e => setMessage(e.target.value)} 
        placeholder="Type a message..." 
        className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
        disabled={isSending}
      />
      
      <Button 
        type="submit" 
        size="icon" 
        className="rounded-full bg-primary"
        disabled={!message.trim() || isSending}
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
};

export default ChatInput;
