
import React from "react";
import { Avatar } from "@/components/ui/avatar";

interface ChatBubbleProps {
  message: string;
  isUser?: boolean;
  timestamp?: string;
  avatar?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isUser = false,
  timestamp,
  avatar,
}) => {
  return (
    <div
      className={`flex items-end gap-2 mb-4 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <Avatar className="w-8 h-8">
          <img
            src={avatar || "https://api.dicebear.com/7.x/thumbs/svg?seed=olivia"}
            alt="Olivia"
            className="w-full h-full object-cover"
          />
        </Avatar>
      )}
      <div
        className={`${
          isUser ? "chat-bubble-user" : "chat-bubble-assistant"
        }`}
      >
        <p className="text-sm">{message}</p>
        {timestamp && (
          <div className={`text-[10px] mt-1 ${isUser ? "text-white/70" : "text-gray-500"}`}>
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
