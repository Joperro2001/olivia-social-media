
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface ChatInputProps {
  onSendMessage: (content: string) => Promise<boolean>;
  placeholder?: string;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  placeholder = "Type a message...",
  disabled = false
}) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Auto-focus the textarea when the component mounts
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSubmitting || disabled) return;
    
    setIsSubmitting(true);
    
    try {
      const success = await onSendMessage(trimmedMessage);
      if (success) {
        setMessage("");
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      // Re-focus the textarea after sending
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="px-4 mx-auto w-full max-w-3xl"
    >
      <div className="flex items-end gap-2 bg-white dark:bg-gray-800 rounded-lg border p-2 shadow-sm">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-10 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={isSubmitting || disabled}
        />
        <Button 
          size="icon" 
          type="submit"
          disabled={isSubmitting || !message.trim() || disabled}
          className={`rounded-full h-8 w-8 ${message.trim() ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"}`}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
