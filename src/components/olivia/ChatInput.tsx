
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage
}) => {
  const [message, setMessage] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };
  
  console.log("ChatInput rendered"); // Debug log to confirm component is rendering
  
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
      />
      
      <Button 
        type="submit" 
        size="icon" 
        className="rounded-full bg-primary"
        disabled={!message.trim()}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default ChatInput;
