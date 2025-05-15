
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react"; // Changed from PaperPlaneRight to Send

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<boolean> | Promise<void>;
  disabled?: boolean; // Added disabled prop
  placeholder?: string; // Added placeholder prop
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled = false, // Default value
  placeholder = "Type a message..." // Default value
}) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await onSendMessage(message);
      setMessage("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4">
      <div className="relative flex items-center">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="pr-10 py-6 bg-white shadow-md rounded-lg"
          disabled={disabled || isSending}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || isSending || disabled}
          className="absolute right-2 bg-primary text-white rounded-full w-8 h-8 p-0 flex justify-center items-center"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
