import React, { useState, useEffect, useRef } from "react";
import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import TypingIndicator from "@/components/olivia/TypingIndicator";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_AVATAR } from "@/constants/chatConstants";
import OliviaSuggestions from "@/components/olivia/OliviaSuggestions";
import useOliviaChat from "@/hooks/useOliviaChat"; // Fixed import
import ChatError from "@/components/chat/ChatError";
import { testApiConnection } from "@/utils/apiService";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const OliviaChat: React.FC = () => {
  const {
    user
  } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const {
    messages,
    isTyping,
    handleSendMessage,
    handleCardAction,
    retryConnection,
    clearChatHistory
  } = useOliviaChat();

  // Only test API connectivity once on initial mount, not on every re-render
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // First try from localStorage or session config
        const isConnected = await testApiConnection();
        if (!isConnected) {
          console.log("Connection test failed, using offline mode");
          setErrorMessage("We can't connect to the API. You're in offline mode with limited functionality.");
        } else {
          // Reset if connection is successful
          setConnectionError(false);
          setRetryCount(0);
          setErrorMessage(undefined);
        }
      } catch (err) {
        console.error("Connection check error:", err);
        // Don't set connection error to true so users can still use fallback mode
      }
    };
    checkConnection();
  }, []); // Empty dependency array so this only runs once

  // Handle manual retry
  const handleRetry = async () => {
    toast({
      title: "Checking connection",
      description: "Attempting to reconnect to the AI assistant..."
    });
    setRetryCount(prev => prev + 1);
    const success = await retryConnection();
    if (success) {
      setConnectionError(false);
      setRetryCount(0);
      setErrorMessage(undefined);
      toast({
        title: "Connected",
        description: "Successfully connected to the AI assistant."
      });
    } else {
      // Don't show error screen, just show a toast
      toast({
        title: "Offline Mode Active",
        description: "Still unable to reach the AI assistant. Using offline mode with limited responses.",
        variant: "default"
      });
    }
  };

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, isTyping]);

  // Only show full error screen on critical errors
  if (connectionError && retryCount > 3) {
    return <ChatError onRetry={handleRetry} message={errorMessage} />;
  }
  
  return <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">Ask Olivia</h1>
        <div className="flex items-center space-x-2">
          {errorMessage && <div className="text-amber-600 text-sm flex items-center">
            <button onClick={handleRetry} className="text-xs bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded">
              Retry Connection
            </button>
          </div>}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={clearChatHistory}
                className="text-destructive flex items-center cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Clear Chat History</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-2 px-4 pt-2">
        {messages.map((message, index) => <ChatBubble key={message.id} message={message.content} isUser={message.isUser} timestamp={message.timestamp} avatar={!message.isUser ? DEFAULT_AVATAR : undefined} isFirstMessage={index === 0} />)}
        
        {isTyping && <TypingIndicator />}
        
        {messages.length <= 2 && !isTyping && <OliviaSuggestions onCardAction={handleCardAction} />}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-0 pb-8 sticky bottom-0 py-0 bg-gradient-to-t from-[#FDF5EF] to-transparent pt-4">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>;
};
export default OliviaChat;
