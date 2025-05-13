
import { useState } from "react";
import { Message } from "@/types/Chat";

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  chatId: string | null;
  connectionError: boolean;
}

export const useChatState = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  
  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    chatId,
    setChatId,
    connectionError,
    setConnectionError
  };
};
