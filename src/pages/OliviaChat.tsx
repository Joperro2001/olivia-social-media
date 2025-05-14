
import React, { useState, useEffect, useRef } from "react";
import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import TypingIndicator from "@/components/olivia/TypingIndicator";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_AVATAR } from "@/constants/chatConstants";
import OliviaSuggestions from "@/components/olivia/OliviaSuggestions";
import { useOliviaChat } from "@/hooks/useOliviaChat";
import ChatError from "@/components/chat/ChatError";
import { testApiConnection } from "@/utils/apiService";
import { toast } from "@/hooks/use-toast";

const OliviaChat: React.FC = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  
  const { 
    messages, 
    isTyping, 
    handleSendMessage,
    handleCardAction,
    retryConnection
  } = useOliviaChat();

  // Test API connectivity on component mount and when connection error state changes
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await testApiConnection();
        if (!isConnected && retryCount < 3) {
          // Auto-retry up to 3 times
          setRetryCount(prev => prev + 1);
          setErrorMessage("Attempting to reconnect automatically...");
          
          // Wait a bit before retrying
          setTimeout(() => {
            checkConnection();
          }, 3000);
        } else if (!isConnected) {
          setConnectionError(true);
          setErrorMessage("We're having trouble connecting to the chat service. This could be due to network issues or server problems.");
        } else {
          // Reset if connection is restored
          setConnectionError(false);
          setRetryCount(0);
          setErrorMessage(undefined);
        }
      } catch (err) {
        console.error("Connection check error:", err);
        setConnectionError(true);
        setErrorMessage("We're having trouble connecting to the chat service. This could be due to network issues or server problems.");
      }
    };
    
    checkConnection();
    
    // Set up a periodic connection check
    const intervalId = setInterval(checkConnection, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [retryCount]);

  // Handle manual retry
  const handleRetry = async () => {
    toast({
      title: "Checking connection",
      description: "Attempting to reconnect to the AI assistant..."
    });
    
    const success = await retryConnection();
    if (success) {
      setConnectionError(false);
      setRetryCount(0);
      setErrorMessage(undefined);
    } else {
      setConnectionError(true);
      setErrorMessage("Still unable to reach the AI assistant. Please try again later.");
    }
  };

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, isTyping]);

  // If there's a connection error, show the error component
  if (connectionError) {
    return <ChatError onRetry={handleRetry} message={errorMessage} />;
  }

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">Ask Olivia</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-2 px-4 pt-2">
        {messages.map((message, index) => <ChatBubble 
          key={message.id} 
          message={message.content} 
          isUser={message.isUser} 
          timestamp={message.timestamp} 
          avatar={!message.isUser ? DEFAULT_AVATAR : undefined} 
          isFirstMessage={index === 0}
        />)}
        
        {isTyping && <TypingIndicator />}
        
        {messages.length <= 2 && !isTyping && <OliviaSuggestions onCardAction={handleCardAction} />}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-0 pb-8 sticky bottom-0 py-0 bg-gradient-to-t from-[#FDF5EF] to-transparent pt-4">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default OliviaChat;
