
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ChatInput from "@/components/chat/ChatInput";
import ChatBubble from "@/components/chat/ChatBubble";
import TypingIndicator from "@/components/olivia/TypingIndicator";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { DEFAULT_AVATAR, MESSAGE_TYPES } from "@/constants/chatConstants";
import { sendChatMessage } from "@/utils/apiService";
import { useAIChat } from "@/hooks/useAIChat";

const AIChatPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage: hookSendMessage,
    sessionId: currentSessionId 
  } = useAIChat({ sessionId });

  const handleSendMessage = async (content: string) => {
    if (isInputDisabled) return false;
    
    setIsInputDisabled(true);
    setIsTyping(true);
    
    try {
      // Use the API service instead of the hook's sendMessage function
      if (user) {
        // Get AI response from the API
        const response = await sendChatMessage(
          user.id, 
          sessionId || currentSessionId, 
          content
        );
        
        if (response) {
          // Update messages through the hook method to maintain state consistency
          await hookSendMessage(content);
          return true;
        }
        return false;
      } else {
        // Fallback to the hook method if no user
        await hookSendMessage(content);
        return true;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    } finally {
      // Add a slight delay to simulate the AI thinking
      setTimeout(() => {
        setIsInputDisabled(false);
        setIsTyping(false);
      }, 800);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const chatContainer = document.getElementById('chat-messages-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages, isTyping]);

  if (!user) {
    return (
      <div className="flex flex-col h-[100vh] items-center justify-center">
        <p>Please sign in to chat with AI assistant</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading conversation..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col h-[100vh] items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100vh] bg-[#FDF5EF] pb-16">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">Chat with Olivia</h1>
      </div>
      
      <div 
        id="chat-messages-container"
        className="flex-1 overflow-y-auto pb-2 px-4 pt-2"
      >
        {messages.length === 0 && !isTyping ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500 text-center">
              No messages yet. Start a conversation!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatBubble
                key={message.message_id}
                message={message.content}
                isUser={message.message_type === MESSAGE_TYPES.HUMAN}
                timestamp={new Date(message.timestamp).toLocaleTimeString()}
                avatar={message.message_type === MESSAGE_TYPES.AI ? DEFAULT_AVATAR : undefined}
                isFirstMessage={index === 0}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </>
        )}
      </div>
      
      <div className="p-0 pb-8 sticky bottom-0 py-0 bg-gradient-to-t from-[#FDF5EF] to-transparent pt-4">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isInputDisabled}
          placeholder="Message Olivia..."
        />
      </div>
    </div>
  );
};

export default AIChatPage;
