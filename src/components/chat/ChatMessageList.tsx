
import React, { useRef, useEffect } from "react";
import { Message } from "@/types/Chat";

interface ChatMessageListProps {
  messages: Message[];
  userId: string;
  formatTime: (timestamp: string) => string;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ 
  messages, 
  userId,
  formatTime 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth"
      });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-center">No messages yet. Say hello!</p>
      </div>
    );
  }

  return (
    <>
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`max-w-[75%] p-3 rounded-lg ${
              message.sender_id === userId 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-white rounded-bl-none shadow-sm'
            }`}
          >
            <p className="break-words">{message.content}</p>
            <div 
              className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                message.sender_id === userId ? 'text-white/70' : 'text-gray-500'
              }`}
            >
              {formatTime(message.sent_at)}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </>
  );
};

export default ChatMessageList;
