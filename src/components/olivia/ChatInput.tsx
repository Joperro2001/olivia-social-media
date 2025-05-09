import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic } from "lucide-react";
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
  return <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white p-4 border shadow-sm rounded-full py-[12px] my-[20px]">
      <Input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Ask Olivia anything..." className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
      <Button type="submit" size="icon" className="rounded-full" disabled={!message.trim()}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Button>
      <Button type="button" size="icon" variant="secondary" className="rounded-full bg-primary/10 hover:bg-primary/20">
        <Mic className="h-4 w-4" />
      </Button>
    </form>;
};
export default ChatInput;