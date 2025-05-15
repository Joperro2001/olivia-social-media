
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MAX_RETRIES } from "@/constants/chatConstants";

export interface ChatInputProps {
  onSendMessage: (content: string) => Promise<boolean>;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  placeholder = "Type a message...",
  disabled = false,
  autoFocus = true
}) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Auto-focus the textarea when the component mounts if autoFocus is true
    if (textareaRef.current && autoFocus && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled, autoFocus]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSubmitting || disabled) return;
    
    setIsSubmitting(true);
    console.log("Attempting to send message:", trimmedMessage);
    
    let retryCount = 0;
    let success = false;

    while (retryCount < MAX_RETRIES && !success) {
      try {
        success = await onSendMessage(trimmedMessage);
        
        if (success) {
          console.log("Message sent successfully");
          setMessage("");
        } else {
          console.error(`Message sending failed (attempt ${retryCount + 1})`);
          retryCount++;
          
          if (retryCount >= MAX_RETRIES) {
            toast({
              title: "Failed to send message",
              description: "Please try again or refresh the page.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error(`Error in handleSubmit (attempt ${retryCount + 1}):`, error);
        retryCount++;
        
        if (retryCount >= MAX_RETRIES) {
          toast({
            title: "Error",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
      }
    }
    
    setIsSubmitting(false);
    
    // Re-focus the textarea after sending
    if (textareaRef.current && autoFocus) {
      textareaRef.current.focus();
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
