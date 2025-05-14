
import React, { useState, useEffect, useRef } from "react";
import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import TypingIndicator from "@/components/olivia/TypingIndicator";
import { useAuth } from "@/context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_AVATAR } from "@/constants/chatConstants";
import OliviaSuggestions from "@/components/olivia/OliviaSuggestions";
import { useOliviaChat } from "@/hooks/useOliviaChat";
import ChatError from "@/components/chat/ChatError";
import { testApiConnection } from "@/utils/apiService";

const OliviaChat: React.FC = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [connectionError, setConnectionError] = useState(false);
  
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
      const isConnected = await testApiConnection();
      setConnectionError(!isConnected);
    };
    
    checkConnection();
    
    // Set up a periodic connection check
    const intervalId = setInterval(checkConnection, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, isTyping]);

  // If there's a connection error, show the error component
  if (connectionError) {
    return <ChatError onRetry={retryConnection} />;
  }

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">Ask Olivia</h1>
        <div className="flex items-center gap-2">
          {/* Placeholder for consistent spacing */}
        </div>
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
